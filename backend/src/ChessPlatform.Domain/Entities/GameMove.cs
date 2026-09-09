namespace ChessPlatform.Domain.Entities;

public class GameMove
{
    public long Id { get; set; }

    public Guid GameId { get; set; }
    public Game Game { get; set; } = null!;

    public int MoveNumber { get; set; }

    public Guid PlayerId { get; set; }
    public User Player { get; set; } = null!;

    public string FromSquare { get; set; } = string.Empty;
    public string ToSquare { get; set; } = string.Empty;
    public char? PromotionPiece { get; set; }

    public string San { get; set; } = string.Empty;
    public string FenAfter { get; set; } = string.Empty;

    public int TimeSpentMs { get; set; }
    public DateTime PlayedAtUtc { get; set; } = DateTime.UtcNow;
}
