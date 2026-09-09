namespace ChessPlatform.Domain.Entities;

public class UserSettings
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public string BoardTheme { get; set; } = "slate";       // slate, emerald, obsidian, wood
    public string PieceStyle { get; set; } = "classic";     // classic, modern, neo
    public bool SoundEnabled { get; set; } = true;
    public bool DarkTheme { get; set; } = true;
    public bool MoveAnimationEnabled { get; set; } = true;

    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}
