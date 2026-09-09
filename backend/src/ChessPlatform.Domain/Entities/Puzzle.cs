using ChessPlatform.Domain.Enums;

namespace ChessPlatform.Domain.Entities;

public class Puzzle : BaseEntity
{
    public string InitialFen { get; set; } = string.Empty;
    public string SolutionMoves { get; set; } = string.Empty; // Space-separated UCI moves: e7e8q g8f7 e8f6
    public int Rating { get; set; } = 1500;
    public PuzzleDifficulty Difficulty { get; set; } = PuzzleDifficulty.Medium;
    public string Themes { get; set; } = string.Empty; // e.g., "fork,endgame"
    public string Description { get; set; } = string.Empty;

    // Navigation properties
    public ICollection<UserPuzzleAttempt> Attempts { get; set; } = new List<UserPuzzleAttempt>();
}
