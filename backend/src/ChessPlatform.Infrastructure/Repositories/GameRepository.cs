using ChessPlatform.Domain.Entities;
using ChessPlatform.Domain.Interfaces;
using ChessPlatform.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ChessPlatform.Infrastructure.Repositories;

public class GameRepository : Repository<Game>, IGameRepository
{
    public GameRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<Game?> GetByInviteCodeAsync(string inviteCode, CancellationToken cancellationToken = default)
    {
        return await _context.Games
            .Include(g => g.WhitePlayer)
            .Include(g => g.BlackPlayer)
            .FirstOrDefaultAsync(g => g.InviteCode == inviteCode, cancellationToken);
    }

    public async Task<Game?> GetWithMovesAndPlayersAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Games
            .Include(g => g.WhitePlayer)
            .Include(g => g.BlackPlayer)
            .Include(g => g.WinnerPlayer)
            .Include(g => g.Moves.OrderBy(m => m.MoveNumber))
            .FirstOrDefaultAsync(g => g.Id == id, cancellationToken);
    }

    public async Task<(IReadOnlyList<Game> Games, int TotalCount)> GetUserGameHistoryAsync(
        Guid userId, 
        int pageNumber, 
        int pageSize, 
        CancellationToken cancellationToken = default)
    {
        var query = _context.Games
            .AsNoTracking()
            .Where(g => g.WhitePlayerId == userId || g.BlackPlayerId == userId)
            .Include(g => g.WhitePlayer)
            .Include(g => g.BlackPlayer)
            .OrderByDescending(g => g.EndedAtUtc ?? g.CreatedAtUtc);

        var totalCount = await query.CountAsync(cancellationToken);

        var games = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (games, totalCount);
    }
}
