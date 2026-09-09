using ChessPlatform.Domain.Enums;

namespace ChessPlatform.Application.DTOs.Puzzle;

public class PuzzleDto
{
    public Guid Id { get; set; }
    public string InitialFen { get; set; } = string.Empty;
    public string SolutionMoves { get; set; } = string.Empty; // Space-separated UCI moves e.g. "e7e8q g8f7 e8f6"
    public int Rating { get; set; }
    public PuzzleDifficulty Difficulty { get; set; }
    public string Themes { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class SubmitPuzzleAttemptDto
{
    public Guid PuzzleId { get; set; }
    public bool Solved { get; set; }
}

public class PuzzleAttemptResponseDto
{
    public Guid PuzzleId { get; set; }
    public bool Solved { get; set; }
    public string Message { get; set; } = string.Empty;
    public DateTime AttemptedAtUtc { get; set; }
}

public class UserPuzzleHistoryItemDto
{
    public Guid PuzzleId { get; set; }
    public bool Solved { get; set; }
    public PuzzleDifficulty Difficulty { get; set; }
    public int Rating { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTime AttemptedAtUtc { get; set; }
}
