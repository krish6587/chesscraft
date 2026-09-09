namespace ChessPlatform.Domain.Entities;

public class UserPuzzleAttempt
{
    public long Id { get; set; }

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Guid PuzzleId { get; set; }
    public Puzzle Puzzle { get; set; } = null!;

    public bool Solved { get; set; }
    public DateTime AttemptedAtUtc { get; set; } = DateTime.UtcNow;
}
