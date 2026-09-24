using System.Collections.Concurrent;

namespace ChessPlatform.API.Hubs;

/// <summary>
/// Thread-safe singleton that tracks active SignalR connections per user.
/// Enables disconnect detection and reconnection support.
/// </summary>
public class ConnectionTracker
{
    // UserId → set of ConnectionIds (a user may have multiple tabs open)
    private readonly ConcurrentDictionary<Guid, ConcurrentHashSet<string>> _userConnections = new();

    // ConnectionId → UserId (reverse lookup for OnDisconnected)
    private readonly ConcurrentDictionary<string, Guid> _connectionUsers = new();

    // UserId → set of GameIds the user is currently in
    private readonly ConcurrentDictionary<Guid, ConcurrentHashSet<Guid>> _userGames = new();

    public void AddConnection(Guid userId, string connectionId)
    {
        _userConnections.AddOrUpdate(
            userId,
            _ => new ConcurrentHashSet<string>(new[] { connectionId }),
            (_, set) => { set.Add(connectionId); return set; }
        );
        _connectionUsers[connectionId] = userId;
    }

    public Guid? RemoveConnection(string connectionId)
    {
        if (!_connectionUsers.TryRemove(connectionId, out var userId))
            return null;

        if (_userConnections.TryGetValue(userId, out var connections))
        {
            connections.Remove(connectionId);
            if (connections.Count == 0)
            {
                _userConnections.TryRemove(userId, out _);
            }
        }

        return userId;
    }

    public bool IsUserOnline(Guid userId)
    {
        return _userConnections.TryGetValue(userId, out var conns) && conns.Count > 0;
    }

    public IReadOnlyCollection<string> GetUserConnections(Guid userId)
    {
        return _userConnections.TryGetValue(userId, out var conns) 
            ? conns.ToList() 
            : Array.Empty<string>();
    }

    public void AddUserGame(Guid userId, Guid gameId)
    {
        _userGames.AddOrUpdate(
            userId,
            _ => new ConcurrentHashSet<Guid>(new[] { gameId }),
            (_, set) => { set.Add(gameId); return set; }
        );
    }

    public void RemoveUserGame(Guid userId, Guid gameId)
    {
        if (_userGames.TryGetValue(userId, out var games))
        {
            games.Remove(gameId);
            if (games.Count == 0)
            {
                _userGames.TryRemove(userId, out _);
            }
        }
    }

    public IReadOnlyCollection<Guid> GetUserGames(Guid userId)
    {
        return _userGames.TryGetValue(userId, out var games) 
            ? games.ToList() 
            : Array.Empty<Guid>();
    }
}

/// <summary>
/// Simple thread-safe hash set using ConcurrentDictionary internally.
/// </summary>
public class ConcurrentHashSet<T> where T : notnull
{
    private readonly ConcurrentDictionary<T, byte> _dict = new();

    public ConcurrentHashSet() { }

    public ConcurrentHashSet(IEnumerable<T> items)
    {
        foreach (var item in items)
            _dict[item] = 0;
    }

    public bool Add(T item) => _dict.TryAdd(item, 0);
    public bool Remove(T item) => _dict.TryRemove(item, out _);
    public bool Contains(T item) => _dict.ContainsKey(item);
    public int Count => _dict.Count;
    public List<T> ToList() => new(_dict.Keys);
}
