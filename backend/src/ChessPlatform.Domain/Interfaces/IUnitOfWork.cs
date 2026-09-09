namespace ChessPlatform.Domain.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IGameRepository Games { get; }
    IRepository<Entities.User> Users { get; }
    IRepository<Entities.UserSettings> UserSettings { get; }
    IRepository<Entities.Puzzle> Puzzles { get; }
    IRepository<Entities.UserPuzzleAttempt> PuzzleAttempts { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
