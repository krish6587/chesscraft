using ChessPlatform.Application.Common.Models;
using ChessPlatform.Application.DTOs.Game;
using ChessPlatform.Application.Interfaces;
using ChessPlatform.Domain.Enums;
using ChessPlatform.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace ChessPlatform.Infrastructure.Services;

public class GameQueryService : IGameQueryService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<GameQueryService> _logger;

    public GameQueryService(IUnitOfWork unitOfWork, ILogger<GameQueryService> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<GameDetailsDto?> GetGameByInviteCodeAsync(string inviteCode, CancellationToken cancellationToken = default)
    {
        var game = await _unitOfWork.Games.GetByInviteCodeAsync(inviteCode, cancellationToken);
        if (game == null)
        {
            _logger.LogWarning("Game with invite code {InviteCode} not found.", inviteCode);
            return null;
        }

        return new GameDetailsDto
        {
            Id = game.Id,
            InviteCode = game.InviteCode,
            WhitePlayerId = game.WhitePlayerId,
            WhitePlayerUsername = game.WhitePlayer?.Username,
            BlackPlayerId = game.BlackPlayerId,
            BlackPlayerUsername = game.BlackPlayer?.Username,
            WinnerPlayerId = game.WinnerPlayerId,
            CurrentFen = game.CurrentFen,
            Pgn = game.Pgn,
            Status = game.Status,
            Result = game.Result,
            TerminationReason = game.TerminationReason,
            TimeControlSeconds = game.TimeControlSeconds,
            CreatedAtUtc = game.CreatedAtUtc,
            StartedAtUtc = game.StartedAtUtc,
            EndedAtUtc = game.EndedAtUtc
        };
    }

    public async Task<GameReplayDto?> GetGameReplayAsync(Guid gameId, CancellationToken cancellationToken = default)
    {
        var game = await _unitOfWork.Games.GetWithMovesAndPlayersAsync(gameId, cancellationToken);
        if (game == null)
        {
            _logger.LogWarning("Replay requested for non-existent game {GameId}.", gameId);
            return null;
        }

        return new GameReplayDto
        {
            GameId = game.Id,
            WhitePlayerUsername = game.WhitePlayer?.Username ?? "Unknown White",
            BlackPlayerUsername = game.BlackPlayer?.Username ?? "Unknown Black",
            Result = game.Result,
            TerminationReason = game.TerminationReason,
            Pgn = game.Pgn,
            Moves = game.Moves.Select(m => new MoveHistoryItemDto
            {
                MoveNumber = m.MoveNumber,
                FromSquare = m.FromSquare,
                ToSquare = m.ToSquare,
                PromotionPiece = m.PromotionPiece,
                San = m.San,
                FenAfter = m.FenAfter,
                TimeSpentMs = m.TimeSpentMs,
                PlayedAtUtc = m.PlayedAtUtc
            }).ToList()
        };
    }

    public async Task<PagedResult<GameHistoryItemDto>> GetUserGameHistoryAsync(
        Guid userId, 
        int pageNumber, 
        int pageSize, 
        CancellationToken cancellationToken = default)
    {
        var (games, totalCount) = await _unitOfWork.Games.GetUserGameHistoryAsync(userId, pageNumber, pageSize, cancellationToken);

        var items = games.Select(g =>
        {
            var isWhite = g.WhitePlayerId == userId;
            var opponentUsername = isWhite
                ? g.BlackPlayer?.Username ?? "Waiting for Opponent"
                : g.WhitePlayer?.Username ?? "Unknown Player";

            var userWon = g.WinnerPlayerId == userId;

            return new GameHistoryItemDto
            {
                Id = g.Id,
                InviteCode = g.InviteCode,
                OpponentUsername = opponentUsername,
                UserColor = isWhite ? PieceColor.White : PieceColor.Black,
                Result = g.Result,
                TerminationReason = g.TerminationReason,
                UserWon = userWon,
                TotalMoves = g.Moves.Count,
                PlayedAtUtc = g.EndedAtUtc ?? g.CreatedAtUtc
            };
        }).ToList();

        return new PagedResult<GameHistoryItemDto>(items, totalCount, pageNumber, pageSize);
    }
}
