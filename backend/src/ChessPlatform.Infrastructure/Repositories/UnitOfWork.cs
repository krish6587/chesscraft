using ChessPlatform.Domain.Entities;
using ChessPlatform.Domain.Interfaces;
using ChessPlatform.Infrastructure.Data;

namespace ChessPlatform.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;
    private IGameRepository? _games;
    private IRepository<User>? _users;
    private IRepository<UserSettings>? _userSettings;
    private IRepository<Puzzle>? _puzzles;
    private IRepository<UserPuzzleAttempt>? _puzzleAttempts;

    public UnitOfWork(ApplicationDbContext context)
    {
        _context = context;
    }

    public IGameRepository Games => _games ??= new GameRepository(_context);
    public IRepository<User> Users => _users ??= new Repository<User>(_context);
    public IRepository<UserSettings> UserSettings => _userSettings ??= new Repository<UserSettings>(_context);
    public IRepository<Puzzle> Puzzles => _puzzles ??= new Repository<Puzzle>(_context);
    public IRepository<UserPuzzleAttempt> PuzzleAttempts => _puzzleAttempts ??= new Repository<UserPuzzleAttempt>(_context);

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }

    public void Dispose()
    {
        _context.Dispose();
        GC.SuppressFinalize(this);
    }
}
