using ChessPlatform.Application.Common.Models;
using ChessPlatform.Application.DTOs.Game;

namespace ChessPlatform.Application.Interfaces;

public interface IGameQueryService
{
    Task<GameDetailsDto?> GetGameByInviteCodeAsync(string inviteCode, CancellationToken cancellationToken = default);
    Task<GameReplayDto?> GetGameReplayAsync(Guid gameId, CancellationToken cancellationToken = default);
    Task<PagedResult<GameHistoryItemDto>> GetUserGameHistoryAsync(
        Guid userId, 
        int pageNumber, 
        int pageSize, 
        CancellationToken cancellationToken = default);
}
