using ChessPlatform.Application.Common.Exceptions;
using ChessPlatform.Application.DTOs.User;
using ChessPlatform.Application.Interfaces;
using ChessPlatform.Domain.Entities;
using ChessPlatform.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace ChessPlatform.Infrastructure.Services;

public class UserSettingsService : IUserSettingsService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<UserSettingsService> _logger;

    public UserSettingsService(IUnitOfWork unitOfWork, ILogger<UserSettingsService> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<UserSettingsDto> GetSettingsByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var settingsList = await _unitOfWork.UserSettings.FindAsync(s => s.UserId == userId, cancellationToken);
        var settings = settingsList.FirstOrDefault();

        if (settings == null)
        {
            _logger.LogInformation("No user settings found for userId: {UserId}. Returning default settings.", userId);
            return new UserSettingsDto();
        }

        return new UserSettingsDto
        {
            BoardTheme = settings.BoardTheme,
            PieceStyle = settings.PieceStyle,
            SoundEnabled = settings.SoundEnabled,
            DarkTheme = settings.DarkTheme,
            MoveAnimationEnabled = settings.MoveAnimationEnabled
        };
    }

    public async Task<UserSettingsDto> UpdateSettingsAsync(Guid userId, UpdateSettingsDto dto, CancellationToken cancellationToken = default)
    {
        var settingsList = await _unitOfWork.UserSettings.FindAsync(s => s.UserId == userId, cancellationToken);
        var settings = settingsList.FirstOrDefault();

        if (settings == null)
        {
            settings = new UserSettings
            {
                UserId = userId,
                BoardTheme = dto.BoardTheme ?? "slate",
                PieceStyle = dto.PieceStyle ?? "classic",
                SoundEnabled = dto.SoundEnabled ?? true,
                DarkTheme = dto.DarkTheme ?? true,
                MoveAnimationEnabled = dto.MoveAnimationEnabled ?? true
            };
            await _unitOfWork.UserSettings.AddAsync(settings, cancellationToken);
        }
        else
        {
            if (!string.IsNullOrWhiteSpace(dto.BoardTheme)) settings.BoardTheme = dto.BoardTheme;
            if (!string.IsNullOrWhiteSpace(dto.PieceStyle)) settings.PieceStyle = dto.PieceStyle;
            if (dto.SoundEnabled.HasValue) settings.SoundEnabled = dto.SoundEnabled.Value;
            if (dto.DarkTheme.HasValue) settings.DarkTheme = dto.DarkTheme.Value;
            if (dto.MoveAnimationEnabled.HasValue) settings.MoveAnimationEnabled = dto.MoveAnimationEnabled.Value;
            settings.UpdatedAtUtc = DateTime.UtcNow;

            _unitOfWork.UserSettings.Update(settings);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new UserSettingsDto
        {
            BoardTheme = settings.BoardTheme,
            PieceStyle = settings.PieceStyle,
            SoundEnabled = settings.SoundEnabled,
            DarkTheme = settings.DarkTheme,
            MoveAnimationEnabled = settings.MoveAnimationEnabled
        };
    }
}
