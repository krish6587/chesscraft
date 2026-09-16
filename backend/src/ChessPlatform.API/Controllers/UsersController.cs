using ChessPlatform.Application.Common.Models;
using ChessPlatform.Application.DTOs.User;
using ChessPlatform.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChessPlatform.API.Controllers;

[Authorize]
public class UsersController : BaseApiController
{
    private readonly IUserSettingsService _settingsService;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<UsersController> _logger;

    public UsersController(
        IUserSettingsService settingsService,
        ICurrentUserService currentUserService,
        ILogger<UsersController> logger)
    {
        _settingsService = settingsService;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    /// <summary>
    /// Gets preferences for the currently logged-in user.
    /// </summary>
    [HttpGet("me/settings")]
    [ProducesResponseType(typeof(ApiResponse<UserSettingsDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ApiResponse<UserSettingsDto>>> GetMySettings(CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return Unauthorized(ApiResponse<UserSettingsDto>.Fail("Unauthorized"));
        }

        var settings = await _settingsService.GetSettingsByUserIdAsync(userId.Value, cancellationToken);
        return Ok(ApiResponse<UserSettingsDto>.Ok(settings));
    }

    /// <summary>
    /// Updates preferences for the currently logged-in user.
    /// </summary>
    [HttpPut("me/settings")]
    [ProducesResponseType(typeof(ApiResponse<UserSettingsDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ApiResponse<UserSettingsDto>>> UpdateMySettings(
        [FromBody] UpdateSettingsDto dto,
        CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return Unauthorized(ApiResponse<UserSettingsDto>.Fail("Unauthorized"));
        }

        var updated = await _settingsService.UpdateSettingsAsync(userId.Value, dto, cancellationToken);
        return Ok(ApiResponse<UserSettingsDto>.Ok(updated, "Preferences updated successfully."));
    }
}
