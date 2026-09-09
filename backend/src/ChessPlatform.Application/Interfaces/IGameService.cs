using ChessPlatform.Application.DTOs.Game;

namespace ChessPlatform.Application.Interfaces;

/// <summary>
/// Service responsible for all game lifecycle operations:
/// creation, joining, move execution with server-side validation, resignation, and state queries.
/// </summary>
public interface IGameService
{
    Task<GameCreatedDto> CreateGameAsync(Guid userId, CreateGameDto dto, CancellationToken ct = default);
    Task<GameJoinedDto> JoinGameAsync(Guid userId, string inviteCode, CancellationToken ct = default);
    Task<MovePlayedDto> MakeMoveAsync(Guid userId, MakeMoveDto dto, CancellationToken ct = default);
    Task<GameOverDto> ResignAsync(Guid userId, Guid gameId, CancellationToken ct = default);
    Task<GameStateDto> GetGameStateAsync(Guid userId, Guid gameId, CancellationToken ct = default);
}
