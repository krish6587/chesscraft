namespace ChessPlatform.Domain.Entities;

public class User : BaseEntity
{
    public string Username { get; set; } = string.Empty;
    public string NormalizedUsername { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;

    // Navigation properties
    public UserSettings? Settings { get; set; }
    public ICollection<Game> GamesAsWhite { get; set; } = new List<Game>();
    public ICollection<Game> GamesAsBlack { get; set; } = new List<Game>();
    public ICollection<Game> WonGames { get; set; } = new List<Game>();
    public ICollection<GameMove> Moves { get; set; } = new List<GameMove>();
    public ICollection<UserPuzzleAttempt> PuzzleAttempts { get; set; } = new List<UserPuzzleAttempt>();
}
