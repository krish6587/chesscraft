using ChessPlatform.Domain.Enums;

namespace ChessPlatform.Application.DTOs.Game;

public class CreateGameDto
{
    public int TimeControlSeconds { get; set; } = 600; // 10 minutes default
    public PieceColor PreferredColor { get; set; } = PieceColor.White;
}

public class CreateGameResponseDto
{
    public Guid GameId { get; set; }
    public string InviteCode { get; set; } = string.Empty;
    public string CurrentFen { get; set; } = string.Empty;
    public GameStatus Status { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}

public class GameDetailsDto
{
    public Guid Id { get; set; }
    public string InviteCode { get; set; } = string.Empty;
    public Guid? WhitePlayerId { get; set; }
    public string? WhitePlayerUsername { get; set; }
    public Guid? BlackPlayerId { get; set; }
    public string? BlackPlayerUsername { get; set; }
    public Guid? WinnerPlayerId { get; set; }
    public string CurrentFen { get; set; } = string.Empty;
    public string Pgn { get; set; } = string.Empty;
    public GameStatus Status { get; set; }
    public GameResult Result { get; set; }
    public TerminationReason TerminationReason { get; set; }
    public int TimeControlSeconds { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? StartedAtUtc { get; set; }
    public DateTime? EndedAtUtc { get; set; }
}

public class GameHistoryItemDto
{
    public Guid Id { get; set; }
    public string InviteCode { get; set; } = string.Empty;
    public string OpponentUsername { get; set; } = string.Empty;
    public PieceColor UserColor { get; set; }
    public GameResult Result { get; set; }
    public TerminationReason TerminationReason { get; set; }
    public bool UserWon { get; set; }
    public int TotalMoves { get; set; }
    public DateTime PlayedAtUtc { get; set; }
}

public class MoveHistoryItemDto
{
    public int MoveNumber { get; set; }
    public string FromSquare { get; set; } = string.Empty;
    public string ToSquare { get; set; } = string.Empty;
    public char? PromotionPiece { get; set; }
    public string San { get; set; } = string.Empty;
    public string FenAfter { get; set; } = string.Empty;
    public int TimeSpentMs { get; set; }
    public DateTime PlayedAtUtc { get; set; }
}

public class GameReplayDto
{
    public Guid GameId { get; set; }
    public string WhitePlayerUsername { get; set; } = string.Empty;
    public string BlackPlayerUsername { get; set; } = string.Empty;
    public GameResult Result { get; set; }
    public TerminationReason TerminationReason { get; set; }
    public string Pgn { get; set; } = string.Empty;
    public IReadOnlyList<MoveHistoryItemDto> Moves { get; set; } = new List<MoveHistoryItemDto>();
}
