using System.Security.Cryptography;
using Chess;
using ChessPlatform.Application.DTOs.Game;
using ChessPlatform.Application.Interfaces;
using ChessPlatform.Domain.Entities;
using ChessPlatform.Domain.Enums;
using ChessPlatform.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace ChessPlatform.Infrastructure.Services;

/// <summary>
/// Handles all game business logic with server-side chess move validation.
/// Uses Gera.Chess library for authoritative move validation and rules enforcement.
/// </summary>
public class GameService : IGameService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<GameService> _logger;

    public GameService(IUnitOfWork unitOfWork, ILogger<GameService> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    // ── CREATE GAME ───────────────────────────────────────────────────

    public async Task<GameCreatedDto> CreateGameAsync(Guid userId, CreateGameDto dto, CancellationToken ct = default)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId, ct)
            ?? throw new InvalidOperationException("User not found.");

        // Validate time control bounds: 60 seconds (1 min) to 7200 seconds (2 hours)
        var tcSeconds = dto.TimeControlSeconds;
        if (tcSeconds is < 60 or > 7200)
        {
            tcSeconds = 600;
        }

        // Generate strong unique invite code with collision loop
        string inviteCode = string.Empty;
        for (int i = 0; i < 5; i++)
        {
            var codeCandidate = GenerateStrongInviteCode();
            var exists = await _unitOfWork.Games.GetByInviteCodeAsync(codeCandidate, ct);
            if (exists == null)
            {
                inviteCode = codeCandidate;
                break;
            }
        }

        if (string.IsNullOrEmpty(inviteCode))
        {
            inviteCode = $"CRAFT-{Guid.NewGuid().ToString("N")[..8].ToUpperInvariant()}";
        }

        var game = new Domain.Entities.Game
        {
            InviteCode = inviteCode,
            TimeControlSeconds = tcSeconds,
            WhiteTimeRemainingSeconds = tcSeconds,
            BlackTimeRemainingSeconds = tcSeconds,
            Status = GameStatus.WaitingForPlayer,
            CurrentFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
            Version = 1,
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow,
        };

        // Assign creator to their preferred color
        if (dto.PreferredColor == Domain.Enums.PieceColor.Black)
        {
            game.BlackPlayerId = userId;
        }
        else
        {
            game.WhitePlayerId = userId;
        }

        await _unitOfWork.Games.AddAsync(game, ct);
        await _unitOfWork.SaveChangesAsync(ct);

        var playerColor = game.WhitePlayerId == userId ? "w" : "b";

        _logger.LogInformation("Game {GameId} created by user {UserId} as {Color} with invite code {InviteCode}.",
            game.Id, userId, playerColor, inviteCode);

        return new GameCreatedDto
        {
            GameId = game.Id,
            InviteCode = inviteCode,
            PlayerColor = playerColor,
            Fen = game.CurrentFen,
            Status = game.Status.ToString(),
            TimeControlSeconds = game.TimeControlSeconds,
        };
    }

    // ── JOIN GAME ─────────────────────────────────────────────────────

    public async Task<GameJoinedDto> JoinGameAsync(Guid userId, string inviteCode, CancellationToken ct = default)
    {
        var game = await _unitOfWork.Games.GetByInviteCodeAsync(inviteCode, ct)
            ?? throw new InvalidOperationException("Game not found with this invite code.");

        if (game.Status != GameStatus.WaitingForPlayer)
            throw new InvalidOperationException("This game is no longer accepting players.");

        // Prevent joining your own game
        if (game.WhitePlayerId == userId || game.BlackPlayerId == userId)
            throw new InvalidOperationException("You are already part of this game.");

        // Assign to the open color slot
        string playerColor;
        string opponentUsername;

        if (game.WhitePlayerId == null)
        {
            game.WhitePlayerId = userId;
            playerColor = "w";
            var opponent = await _unitOfWork.Users.GetByIdAsync(game.BlackPlayerId!.Value, ct);
            opponentUsername = opponent?.Username ?? "Unknown";
        }
        else if (game.BlackPlayerId == null)
        {
            game.BlackPlayerId = userId;
            playerColor = "b";
            var opponent = await _unitOfWork.Users.GetByIdAsync(game.WhitePlayerId!.Value, ct);
            opponentUsername = opponent?.Username ?? "Unknown";
        }
        else
        {
            throw new InvalidOperationException("This game already has two players.");
        }

        // Start the game
        game.Status = GameStatus.InProgress;
        game.StartedAtUtc = DateTime.UtcNow;
        game.LastMoveTimeUtc = DateTime.UtcNow;
        game.UpdatedAtUtc = DateTime.UtcNow;
        game.Version++;

        _unitOfWork.Games.Update(game);
        await _unitOfWork.SaveChangesAsync(ct);

        _logger.LogInformation("User {UserId} joined game {GameId} as {Color}.", userId, game.Id, playerColor);

        return new GameJoinedDto
        {
            GameId = game.Id,
            PlayerColor = playerColor,
            OpponentUsername = opponentUsername,
            Fen = game.CurrentFen,
            Status = game.Status.ToString(),
            TimeControlSeconds = game.TimeControlSeconds,
            MoveHistory = new List<MovePlayedDto>(),
        };
    }

    // ── MAKE MOVE ─────────────────────────────────────────────────────

    public async Task<MovePlayedDto> MakeMoveAsync(Guid userId, MakeMoveDto dto, CancellationToken ct = default)
    {
        var game = await _unitOfWork.Games.GetWithMovesAndPlayersAsync(dto.GameId, ct)
            ?? throw new InvalidOperationException("Game not found.");

        // Security: game must be in progress
        if (game.Status != GameStatus.InProgress)
            throw new InvalidOperationException("This game is not in progress.");

        // Security: user must be a member
        if (game.WhitePlayerId != userId && game.BlackPlayerId != userId)
            throw new InvalidOperationException("You are not a participant in this game.");

        // Determine player color
        var isWhite = game.WhitePlayerId == userId;
        var playerColor = isWhite ? "w" : "b";

        // Security: validate it's the player's turn
        var fenTurn = game.CurrentFen.Split(' ')[1]; // "w" or "b"
        if (fenTurn != playerColor)
            throw new InvalidOperationException("It is not your turn.");

        // ── Server-side Clock Calculation & Timeout Enforcement ──
        var now = DateTime.UtcNow;
        var lastMoveTime = game.LastMoveTimeUtc ?? game.StartedAtUtc ?? now;
        var elapsedSeconds = Math.Max(0, (int)(now - lastMoveTime).TotalSeconds);

        if (isWhite)
        {
            game.WhiteTimeRemainingSeconds = Math.Max(0, game.WhiteTimeRemainingSeconds - elapsedSeconds);
            if (game.WhiteTimeRemainingSeconds == 0)
            {
                // White timed out
                game.Status = GameStatus.Completed;
                game.Result = GameResult.BlackWins;
                game.TerminationReason = TerminationReason.Timeout;
                game.WinnerPlayerId = game.BlackPlayerId;
                game.EndedAtUtc = now;
                game.Version++;

                _unitOfWork.Games.Update(game);
                await _unitOfWork.SaveChangesAsync(ct);

                throw new InvalidOperationException("White timed out. Game over.");
            }
        }
        else
        {
            game.BlackTimeRemainingSeconds = Math.Max(0, game.BlackTimeRemainingSeconds - elapsedSeconds);
            if (game.BlackTimeRemainingSeconds == 0)
            {
                // Black timed out
                game.Status = GameStatus.Completed;
                game.Result = GameResult.WhiteWins;
                game.TerminationReason = TerminationReason.Timeout;
                game.WinnerPlayerId = game.WhitePlayerId;
                game.EndedAtUtc = now;
                game.Version++;

                _unitOfWork.Games.Update(game);
                await _unitOfWork.SaveChangesAsync(ct);

                throw new InvalidOperationException("Black timed out. Game over.");
            }
        }

        // ── Server-side move validation using Gera.Chess ──
        ChessBoard board;
        try
        {
            board = ChessBoard.LoadFromFen(game.CurrentFen);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to parse FEN for game {GameId}: {Fen}", game.Id, game.CurrentFen);
            throw new InvalidOperationException("Server error: invalid game state.");
        }

        // Execute move using Gera.Chess Move object
        string san;
        try
        {
            var move = new Move(new Position(dto.From), new Position(dto.To));
            if (!board.IsValidMove(move))
            {
                throw new InvalidOperationException($"Illegal move: {dto.From} to {dto.To}");
            }
            board.Move(move);
            var lastMove = board.ExecutedMoves.Last();
            san = lastMove.San;
        }
        catch (Exception ex) when (ex is not InvalidOperationException)
        {
            _logger.LogWarning("Illegal move attempted by {UserId} in game {GameId}: {From}->{To}. Error: {Error}",
                userId, game.Id, dto.From, dto.To, ex.Message);
            throw new InvalidOperationException($"Illegal move: {dto.From} to {dto.To}");
        }

        var newFen = board.ToFen();
        var newTurn = newFen.Split(' ')[1];
        var moveNumber = game.Moves.Count + 1;

        // ── Threefold Repetition Check Across Match History ──
        var currentPositionKey = GetPositionKey(newFen);
        var positionCount = 1;
        foreach (var m in game.Moves)
        {
            if (GetPositionKey(m.FenAfter) == currentPositionKey)
            {
                positionCount++;
            }
        }
        var isDrawByRepetition = positionCount >= 3;

        // Detect other game-ending conditions
        var isCheckmate = board.IsEndGame && board.EndGame?.EndgameType == EndgameType.Checkmate;
        var isStalemate = board.IsEndGame && board.EndGame?.EndgameType == EndgameType.Stalemate;
        var isDrawByFiftyMove = board.IsEndGame && board.EndGame?.EndgameType == EndgameType.FiftyMoveRule;
        var isDrawByInsufficient = board.IsEndGame && board.EndGame?.EndgameType == EndgameType.InsufficientMaterial;
        var isDraw = isStalemate || isDrawByRepetition || isDrawByFiftyMove || isDrawByInsufficient;
        var isInCheck = !board.IsEndGame && (board.WhiteKingChecked || board.BlackKingChecked);

        // Persist the move
        var gameMove = new GameMove
        {
            GameId = game.Id,
            PlayerId = userId,
            MoveNumber = moveNumber,
            FromSquare = dto.From,
            ToSquare = dto.To,
            PromotionPiece = string.IsNullOrEmpty(dto.Promotion) ? null : dto.Promotion[0],
            San = san,
            FenAfter = newFen,
            PlayedAtUtc = now,
            TimeSpentMs = elapsedSeconds * 1000,
        };

        game.Moves.Add(gameMove);
        game.CurrentFen = newFen;
        game.LastMoveTimeUtc = now;
        game.UpdatedAtUtc = now;
        game.Version++;

        // Handle game ending
        if (isCheckmate)
        {
            game.Status = GameStatus.Completed;
            game.Result = isWhite ? GameResult.WhiteWins : GameResult.BlackWins;
            game.TerminationReason = TerminationReason.Checkmate;
            game.WinnerPlayerId = userId;
            game.EndedAtUtc = now;
            _logger.LogInformation("Game {GameId} ended by checkmate. Winner: {UserId}", game.Id, userId);
        }
        else if (isDraw)
        {
            game.Status = GameStatus.Completed;
            game.Result = GameResult.Draw;
            game.EndedAtUtc = now;

            if (isStalemate) game.TerminationReason = TerminationReason.Stalemate;
            else if (isDrawByRepetition) game.TerminationReason = TerminationReason.ThreefoldRepetition;
            else if (isDrawByFiftyMove) game.TerminationReason = TerminationReason.FiftyMoveRule;
            else if (isDrawByInsufficient) game.TerminationReason = TerminationReason.InsufficientMaterial;

            _logger.LogInformation("Game {GameId} ended in draw. Reason: {Reason}", game.Id, game.TerminationReason);
        }

        _unitOfWork.Games.Update(game);
        await _unitOfWork.SaveChangesAsync(ct);

        return new MovePlayedDto
        {
            From = dto.From,
            To = dto.To,
            Promotion = dto.Promotion,
            San = san,
            Fen = newFen,
            Turn = newTurn,
            IsCheck = isInCheck,
            IsCheckmate = isCheckmate,
            IsStalemate = isStalemate,
            IsDraw = isDraw,
            MoveNumber = moveNumber,
        };
    }

    // ── RESIGN ────────────────────────────────────────────────────────

    public async Task<GameOverDto> ResignAsync(Guid userId, Guid gameId, CancellationToken ct = default)
    {
        var game = await _unitOfWork.Games.GetWithMovesAndPlayersAsync(gameId, ct)
            ?? throw new InvalidOperationException("Game not found.");

        if (game.Status != GameStatus.InProgress)
            throw new InvalidOperationException("This game is not in progress.");

        if (game.WhitePlayerId != userId && game.BlackPlayerId != userId)
            throw new InvalidOperationException("You are not a participant in this game.");

        var isWhite = game.WhitePlayerId == userId;
        var winnerId = isWhite ? game.BlackPlayerId : game.WhitePlayerId;
        var winnerResult = isWhite ? GameResult.BlackWins : GameResult.WhiteWins;

        game.Status = GameStatus.Completed;
        game.Result = winnerResult;
        game.TerminationReason = TerminationReason.Resignation;
        game.WinnerPlayerId = winnerId;
        game.EndedAtUtc = DateTime.UtcNow;
        game.UpdatedAtUtc = DateTime.UtcNow;
        game.Version++;

        _unitOfWork.Games.Update(game);
        await _unitOfWork.SaveChangesAsync(ct);

        var winnerUser = winnerId.HasValue 
            ? await _unitOfWork.Users.GetByIdAsync(winnerId.Value, ct) 
            : null;

        return new GameOverDto
        {
            GameId = game.Id,
            Result = winnerResult == GameResult.WhiteWins ? "white_wins" : "black_wins",
            Reason = "resignation",
            Fen = game.CurrentFen,
            WinnerUsername = winnerUser?.Username,
        };
    }

    // ── GET GAME STATE (reconnection support) ─────────────────────────

    public async Task<GameStateDto> GetGameStateAsync(Guid userId, Guid gameId, CancellationToken ct = default)
    {
        var game = await _unitOfWork.Games.GetWithMovesAndPlayersAsync(gameId, ct)
            ?? throw new InvalidOperationException("Game not found.");

        string playerColor = "spectator";
        if (game.WhitePlayerId == userId) playerColor = "w";
        else if (game.BlackPlayerId == userId) playerColor = "b";

        var fenTurn = game.CurrentFen.Split(' ')[1];

        var moveHistory = game.Moves
            .OrderBy(m => m.MoveNumber)
            .Select(m => new MovePlayedDto
            {
                From = m.FromSquare,
                To = m.ToSquare,
                Promotion = m.PromotionPiece?.ToString(),
                San = m.San,
                Fen = m.FenAfter,
                Turn = m.FenAfter.Split(' ')[1],
                MoveNumber = m.MoveNumber,
            })
            .ToList();

        return new GameStateDto
        {
            GameId = game.Id,
            InviteCode = game.InviteCode,
            Fen = game.CurrentFen,
            Turn = fenTurn,
            Status = game.Status.ToString(),
            WhiteUsername = game.WhitePlayer?.Username,
            BlackUsername = game.BlackPlayer?.Username,
            WhitePlayerId = game.WhitePlayerId,
            BlackPlayerId = game.BlackPlayerId,
            PlayerColor = playerColor,
            TimeControlSeconds = game.TimeControlSeconds,
            Result = game.Result != GameResult.None 
                ? (game.Result == GameResult.WhiteWins ? "white_wins" : game.Result == GameResult.BlackWins ? "black_wins" : "draw") 
                : null,
            TerminationReason = game.TerminationReason != TerminationReason.None 
                ? game.TerminationReason.ToString() 
                : null,
            MoveHistory = moveHistory,
            OpponentConnected = true,
        };
    }

    // ── Helpers ────────────────────────────────────────────────────────

    private static string GenerateStrongInviteCode()
    {
        var bytes = RandomNumberGenerator.GetBytes(4);
        var hex = Convert.ToHexString(bytes);
        return $"CRAFT-{hex}";
    }

    /// <summary>
    /// Extracts the position key (board, turn, castling rights, en passant) from FEN.
    /// Excludes halfmove and fullmove counters.
    /// </summary>
    private static string GetPositionKey(string fen)
    {
        var parts = fen.Split(' ');
        return parts.Length >= 4 ? string.Join(" ", parts.Take(4)) : fen;
    }
}
