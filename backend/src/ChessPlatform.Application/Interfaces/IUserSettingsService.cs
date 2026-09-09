using ChessPlatform.Application.DTOs.User;

namespace ChessPlatform.Application.Interfaces;

public interface IUserSettingsService
{
    Task<UserSettingsDto> GetSettingsByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<UserSettingsDto> UpdateSettingsAsync(Guid userId, UpdateSettingsDto dto, CancellationToken cancellationToken = default);
}
