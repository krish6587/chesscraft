using ChessPlatform.Domain.Enums;

namespace ChessPlatform.Domain.Entities;

public class Game : BaseEntity
{
    public string InviteCode { get; set; } = string.Empty;

    public Guid? WhitePlayerId { get; set; }
    public User? WhitePlayer { get; set; }

    public Guid? BlackPlayerId { get; set; }
    public User? BlackPlayer { get; set; }

    public Guid? WinnerPlayerId { get; set; }
    public User? WinnerPlayer { get; set; }

    public string CurrentFen { get; set; } = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    public string Pgn { get; set; } = string.Empty;

    public GameStatus Status { get; set; } = GameStatus.WaitingForPlayer;
    public GameResult Result { get; set; } = GameResult.None;
    public TerminationReason TerminationReason { get; set; } = TerminationReason.None;

    public int TimeControlSeconds { get; set; } = 600; // Default 10 minutes
    public int WhiteTimeRemainingSeconds { get; set; } = 600;
    public int BlackTimeRemainingSeconds { get; set; } = 600;
    public DateTime? LastMoveTimeUtc { get; set; }

    public uint Version { get; set; } = 1;

    public DateTime? StartedAtUtc { get; set; }
    public DateTime? EndedAtUtc { get; set; }

    // Navigation properties
    public ICollection<GameMove> Moves { get; set; } = new List<GameMove>();
}
