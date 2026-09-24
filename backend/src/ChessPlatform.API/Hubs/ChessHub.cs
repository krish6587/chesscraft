using System.Security.Claims;
using ChessPlatform.Application.DTOs.Game;
using ChessPlatform.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace ChessPlatform.API.Hubs;

/// <summary>
/// SignalR hub for real-time chess gameplay.
/// All methods require JWT authentication.
/// Uses SignalR Groups to scope broadcasts to individual game rooms.
/// </summary>
[Authorize]
public class ChessHub : Hub
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ConnectionTracker _tracker;
    private readonly ILogger<ChessHub> _logger;

    public ChessHub(
        IServiceScopeFactory scopeFactory,
        ConnectionTracker tracker,
        ILogger<ChessHub> logger)
    {
        _scopeFactory = scopeFactory;
        _tracker = tracker;
        _logger = logger;
    }

    // ── CONNECTION LIFECYCLE ──────────────────────────────────────────

    public override async Task OnConnectedAsync()
    {
        var userId = GetUserId();
        _tracker.AddConnection(userId, Context.ConnectionId);

        _logger.LogInformation("User {UserId} connected. ConnectionId: {ConnectionId}",
            userId, Context.ConnectionId);

        // Rejoin any active game rooms on reconnection
        var activeGames = _tracker.GetUserGames(userId);
        foreach (var gameId in activeGames)
        {
            var groupName = GetGroupName(gameId);
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);

            // Notify the opponent that this player reconnected
            await Clients.OthersInGroup(groupName).SendAsync("PlayerReconnected", new PlayerConnectionDto
            {
                GameId = gameId,
                Username = GetUsername(),
                Connected = true,
            });

            _logger.LogInformation("User {UserId} reconnected to game {GameId}.", userId, gameId);
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = _tracker.RemoveConnection(Context.ConnectionId);

        if (userId.HasValue && !_tracker.IsUserOnline(userId.Value))
        {
            // User has no more active connections — notify game rooms
            var activeGames = _tracker.GetUserGames(userId.Value);
            foreach (var gameId in activeGames)
            {
                var groupName = GetGroupName(gameId);
                await Clients.Group(groupName).SendAsync("PlayerDisconnected", new PlayerConnectionDto
                {
                    GameId = gameId,
                    Username = GetUsername(),
                    Connected = false,
                });

                _logger.LogInformation("User {UserId} disconnected from game {GameId}.", userId.Value, gameId);
            }
        }

        _logger.LogInformation("Connection {ConnectionId} disconnected.", Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }

    // ── CREATE GAME ───────────────────────────────────────────────────

    public async Task CreateGame(CreateGameDto dto)
    {
        var userId = GetUserId();
        using var scope = _scopeFactory.CreateScope();
        var gameService = scope.ServiceProvider.GetRequiredService<IGameService>();

        try
        {
            var result = await gameService.CreateGameAsync(userId, dto);

            // Add creator to the game's SignalR group
            var groupName = GetGroupName(result.GameId);
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
            _tracker.AddUserGame(userId, result.GameId);

            await Clients.Caller.SendAsync("GameCreated", result);

            _logger.LogInformation("User {UserId} created game {GameId} with code {InviteCode}.",
                userId, result.GameId, result.InviteCode);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "CreateGame failed for user {UserId}.", userId);
            await Clients.Caller.SendAsync("Error", new { message = ex.Message });
        }
    }

    // ── JOIN GAME ─────────────────────────────────────────────────────

    public async Task JoinGame(JoinGameDto dto)
    {
        var userId = GetUserId();
        using var scope = _scopeFactory.CreateScope();
        var gameService = scope.ServiceProvider.GetRequiredService<IGameService>();

        try
        {
            var result = await gameService.JoinGameAsync(userId, dto.InviteCode);

            // Add joiner to the game's SignalR group
            var groupName = GetGroupName(result.GameId);
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
            _tracker.AddUserGame(userId, result.GameId);

            // Notify the joiner with full game state
            await Clients.Caller.SendAsync("GameJoined", result);

            // Notify the creator that an opponent has joined
            var joinerUsername = GetUsername();
            await Clients.OthersInGroup(groupName).SendAsync("OpponentJoined", new OpponentJoinedDto
            {
                GameId = result.GameId,
                OpponentUsername = joinerUsername,
                Fen = result.Fen,
                Status = result.Status,
            });

            // Broadcast GameStarted to all members in the game room
            await Clients.Group(groupName).SendAsync("GameStarted", new
            {
                GameId = result.GameId,
                Fen = result.Fen,
                Status = result.Status,
                OpponentUsername = joinerUsername,
            });

            _logger.LogInformation("User {UserId} joined game {GameId}.", userId, result.GameId);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "JoinGame failed for user {UserId}.", userId);
            await Clients.Caller.SendAsync("Error", new { message = ex.Message });
        }
    }

    // ── MAKE MOVE ─────────────────────────────────────────────────────

    public async Task MakeMove(MakeMoveDto dto)
    {
        var userId = GetUserId();
        using var scope = _scopeFactory.CreateScope();
        var gameService = scope.ServiceProvider.GetRequiredService<IGameService>();

        try
        {
            var result = await gameService.MakeMoveAsync(userId, dto);
            var groupName = GetGroupName(dto.GameId);

            // Broadcast validated move to all players in the game room
            await Clients.Group(groupName).SendAsync("MoveMade", result);

            // If game ended (checkmate, stalemate, draw), broadcast game over
            if (result.IsCheckmate || result.IsStalemate || result.IsDraw)
            {
                var gameState = await gameService.GetGameStateAsync(userId, dto.GameId);
                _tracker.RemoveUserGame(userId, dto.GameId);

                await Clients.Group(groupName).SendAsync("GameOver", new GameOverDto
                {
                    GameId = dto.GameId,
                    Result = gameState.Result ?? "draw",
                    Reason = gameState.TerminationReason ?? "unknown",
                    Fen = result.Fen,
                    WinnerUsername = result.IsCheckmate
                        ? GetUsername()
                        : null,
                });
            }

            _logger.LogInformation("Move {From}{To} made in game {GameId} by user {UserId}.",
                dto.From, dto.To, dto.GameId, userId);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "MakeMove failed for user {UserId} in game {GameId}.", userId, dto.GameId);
            await Clients.Caller.SendAsync("Error", new { message = GetSafeErrorMessage(ex) });
        }
    }

    // ── RESIGN ────────────────────────────────────────────────────────

    public async Task Resign(ResignGameDto dto)
    {
        var userId = GetUserId();
        using var scope = _scopeFactory.CreateScope();
        var gameService = scope.ServiceProvider.GetRequiredService<IGameService>();

        try
        {
            var result = await gameService.ResignAsync(userId, dto.GameId);
            var groupName = GetGroupName(dto.GameId);
            _tracker.RemoveUserGame(userId, dto.GameId);

            await Clients.Group(groupName).SendAsync("GameOver", result);

            _logger.LogInformation("User {UserId} resigned game {GameId}.", userId, dto.GameId);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Resign failed for user {UserId} in game {GameId}.", userId, dto.GameId);
            await Clients.Caller.SendAsync("Error", new { message = GetSafeErrorMessage(ex) });
        }
    }

    // ── GET GAME STATE (reconnection support) ─────────────────────────

    public async Task GetGameState(Guid gameId)
    {
        var userId = GetUserId();
        using var scope = _scopeFactory.CreateScope();
        var gameService = scope.ServiceProvider.GetRequiredService<IGameService>();

        try
        {
            var state = await gameService.GetGameStateAsync(userId, gameId);

            // Add caller to the game's SignalR group and connection tracker for active session
            var groupName = GetGroupName(gameId);
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
            _tracker.AddUserGame(userId, gameId);

            // Check if opponent is currently connected
            var opponentId = state.WhitePlayerId == userId 
                ? state.BlackPlayerId 
                : state.WhitePlayerId;
            state.OpponentConnected = opponentId.HasValue && _tracker.IsUserOnline(opponentId.Value);

            await Clients.Caller.SendAsync("GameState", state);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "GetGameState failed for user {UserId} in game {GameId}.", userId, gameId);
            await Clients.Caller.SendAsync("Error", new { message = GetSafeErrorMessage(ex) });
        }
    }

    // ── Helpers ────────────────────────────────────────────────────────

    private static string GetSafeErrorMessage(Exception ex) => ex switch
    {
        ChessPlatform.Application.Common.Exceptions.NotFoundException nfEx => nfEx.Message,
        ChessPlatform.Application.Common.Exceptions.ValidationException valEx => valEx.Message,
        ChessPlatform.Application.Common.Exceptions.ConflictException confEx => confEx.Message,
        ChessPlatform.Application.Common.Exceptions.InvalidCredentialsException credEx => credEx.Message,
        InvalidOperationException invEx => invEx.Message,
        ArgumentException argEx => argEx.Message,
        _ => "An error occurred while processing your request."
    };

    // ── Helpers ────────────────────────────────────────────────────────

    private Guid GetUserId()
    {
        var userIdClaim = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? Context.User?.FindFirst("sub")?.Value;

        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            throw new HubException("User authentication failed.");

        return userId;
    }

    private string GetUsername()
    {
        return Context.User?.FindFirst(ClaimTypes.Name)?.Value
            ?? Context.User?.FindFirst("username")?.Value
            ?? "Unknown";
    }

    private static string GetGroupName(Guid gameId) => $"game_{gameId}";
}
