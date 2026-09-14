using ChessPlatform.Application.Common.Exceptions;
using ChessPlatform.Application.DTOs.Auth;
using ChessPlatform.Application.DTOs.User;
using ChessPlatform.Application.Interfaces;
using ChessPlatform.Domain.Entities;
using ChessPlatform.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace ChessPlatform.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenService _tokenService;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        IUnitOfWork unitOfWork,
        IPasswordHasher passwordHasher,
        ITokenService tokenService,
        ILogger<AuthService> logger)
    {
        _unitOfWork = unitOfWork;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
        _logger = logger;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request, CancellationToken cancellationToken = default)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var trimmedUsername = request.Username.Trim();
        var normalizedUsername = trimmedUsername.ToUpperInvariant();

        var existingUsers = await _unitOfWork.Users.FindAsync(
            u => u.Email == normalizedEmail || u.NormalizedUsername == normalizedUsername,
            cancellationToken);

        if (existingUsers.Any(u => u.Email.Equals(normalizedEmail, StringComparison.OrdinalIgnoreCase)))
        {
            throw new ConflictException("A user with this email address already exists.");
        }

        if (existingUsers.Any(u => u.NormalizedUsername.Equals(normalizedUsername, StringComparison.OrdinalIgnoreCase)))
        {
            throw new ConflictException("This username is already taken. Please choose another.");
        }

        var passwordHash = _passwordHasher.HashPassword(request.Password);

        var user = new User
        {
            Username = trimmedUsername,
            NormalizedUsername = normalizedUsername,
            Email = normalizedEmail,
            PasswordHash = passwordHash,
            CreatedAtUtc = DateTime.UtcNow,
            Settings = new UserSettings
            {
                BoardTheme = "slate",
                PieceStyle = "classic",
                SoundEnabled = true,
                DarkTheme = true,
                MoveAnimationEnabled = true,
                UpdatedAtUtc = DateTime.UtcNow
            }
        };

        await _unitOfWork.Users.AddAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("New user registered successfully: {Username}, Id: {UserId}",
            user.Username, user.Id);

        var token = _tokenService.GenerateToken(user);
        var expiresAt = _tokenService.GetTokenExpiration();

        return new AuthResponseDto
        {
            UserId = user.Id,
            Username = user.Username,
            Email = user.Email,
            Token = token,
            TokenExpiresAtUtc = expiresAt
        };
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken = default)
    {
        var identifier = request.EmailOrUsername.Trim();
        var normalizedEmail = identifier.ToLowerInvariant();
        var normalizedIdentifier = identifier.ToUpperInvariant();

        var matchingUsers = await _unitOfWork.Users.FindAsync(
            u => u.Email == normalizedEmail || u.NormalizedUsername == normalizedIdentifier,
            cancellationToken);

        var user = matchingUsers.FirstOrDefault();

        if (user == null || !_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            _logger.LogWarning("Failed login attempt for identifier: {Identifier}", identifier);
            throw new InvalidCredentialsException("Invalid email/username or password.");
        }

        _logger.LogInformation("User logged in successfully: {Username} (Id: {UserId})", user.Username, user.Id);

        var token = _tokenService.GenerateToken(user);
        var expiresAt = _tokenService.GetTokenExpiration();

        return new AuthResponseDto
        {
            UserId = user.Id,
            Username = user.Username,
            Email = user.Email,
            Token = token,
            TokenExpiresAtUtc = expiresAt
        };
    }

    public async Task ChangePasswordAsync(Guid userId, ChangePasswordDto request, CancellationToken cancellationToken = default)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId, cancellationToken);
        if (user == null)
        {
            throw new NotFoundException("User", userId);
        }

        if (!_passwordHasher.VerifyPassword(request.CurrentPassword, user.PasswordHash))
        {
            throw new ValidationException("Current password does not match.");
        }

        user.PasswordHash = _passwordHasher.HashPassword(request.NewPassword);
        user.UpdatedAtUtc = DateTime.UtcNow;

        _unitOfWork.Users.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Password changed successfully for user Id: {UserId}", userId);
    }

    public async Task<UserProfileDto> GetCurrentUserProfileAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId, cancellationToken);
        if (user == null)
        {
            throw new NotFoundException("User", userId);
        }

        var settings = await _unitOfWork.UserSettings.GetByIdAsync(userId, cancellationToken);

        return new UserProfileDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            CreatedAtUtc = user.CreatedAtUtc,
            Settings = settings != null
                ? new UserSettingsDto
                {
                    BoardTheme = settings.BoardTheme,
                    PieceStyle = settings.PieceStyle,
                    SoundEnabled = settings.SoundEnabled,
                    DarkTheme = settings.DarkTheme
                }
                : new UserSettingsDto()
        };
    }
}
