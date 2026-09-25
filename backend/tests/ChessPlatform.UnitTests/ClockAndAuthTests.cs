using ChessPlatform.Domain.Entities;
using Xunit;

namespace ChessPlatform.UnitTests;

public class ClockAndAuthTests
{
    [Fact]
    public void User_UsernameNormalization_IsUpperCase()
    {
        var user = new User
        {
            Id = Guid.NewGuid(),
            Username = "GrandMaster99",
            Email = "grandmaster@example.com",
            PasswordHash = "hash123",
            NormalizedUsername = "GRANDMASTER99"
        };

        Assert.Equal("GRANDMASTER99", user.NormalizedUsername);
        Assert.Equal("grandmaster99", user.Username.ToLowerInvariant());
    }

    [Fact]
    public void PasswordHashing_BCrypt_VerifiesCorrectly()
    {
        var password = "SecurePassword123!";
        var hash = BCrypt.Net.BCrypt.HashPassword(password);

        Assert.True(BCrypt.Net.BCrypt.Verify(password, hash));
        Assert.False(BCrypt.Net.BCrypt.Verify("WrongPassword!", hash));
    }

    [Fact]
    public void ClockDecrement_CalculatesCorrectTimeRemaining()
    {
        int initialSeconds = 300; // 5 min blitz
        var lastMoveUtc = DateTime.UtcNow.AddSeconds(-15); // 15 seconds elapsed
        var now = DateTime.UtcNow;

        var elapsedSeconds = Math.Max(0, (int)(now - lastMoveUtc).TotalSeconds);
        var remainingSeconds = Math.Max(0, initialSeconds - elapsedSeconds);

        Assert.True(remainingSeconds <= 285 && remainingSeconds >= 284);
    }

    [Fact]
    public void ClockDecrement_DetectsTimeout()
    {
        int initialSeconds = 10;
        var lastMoveUtc = DateTime.UtcNow.AddSeconds(-20); // 20 seconds elapsed
        var now = DateTime.UtcNow;

        var elapsedSeconds = Math.Max(0, (int)(now - lastMoveUtc).TotalSeconds);
        var remainingSeconds = Math.Max(0, initialSeconds - elapsedSeconds);

        Assert.Equal(0, remainingSeconds);
    }
}
