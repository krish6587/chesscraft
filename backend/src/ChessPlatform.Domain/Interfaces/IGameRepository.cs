using ChessPlatform.Domain.Entities;

namespace ChessPlatform.Domain.Interfaces;

public interface IGameRepository : IRepository<Game>
{
    Task<Game?> GetByInviteCodeAsync(string inviteCode, CancellationToken cancellationToken = default);
    Task<Game?> GetWithMovesAndPlayersAsync(Guid id, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<Game> Games, int TotalCount)> GetUserGameHistoryAsync(
        Guid userId, 
        int pageNumber, 
        int pageSize, 
        CancellationToken cancellationToken = default);
}
