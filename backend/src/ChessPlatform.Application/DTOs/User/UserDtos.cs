namespace ChessPlatform.Application.DTOs.User;

public class UserProfileDto
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; }
    public UserSettingsDto Settings { get; set; } = new();
}

public class UserSettingsDto
{
    public string BoardTheme { get; set; } = "slate";
    public string PieceStyle { get; set; } = "classic";
    public bool SoundEnabled { get; set; } = true;
    public bool DarkTheme { get; set; } = true;
    public bool MoveAnimationEnabled { get; set; } = true;
}

public class UpdateSettingsDto
{
    public string? BoardTheme { get; set; }
    public string? PieceStyle { get; set; }
    public bool? SoundEnabled { get; set; }
    public bool? DarkTheme { get; set; }
    public bool? MoveAnimationEnabled { get; set; }
}
