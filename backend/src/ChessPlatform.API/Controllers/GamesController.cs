using ChessPlatform.Application.Common.Models;
using ChessPlatform.Application.DTOs.Game;
using ChessPlatform.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChessPlatform.API.Controllers;

public class GamesController : BaseApiController
{
    private readonly IGameService _gameService;
    private readonly IGameQueryService _gameQueryService;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<GamesController> _logger;

    public GamesController(
        IGameService gameService,
        IGameQueryService gameQueryService,
        ICurrentUserService currentUserService,
        ILogger<GamesController> logger)
    {
        _gameService = gameService;
        _gameQueryService = gameQueryService;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    /// <summary>
    /// Creates a new game room and returns invite details.
    /// </summary>
    [HttpPost]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<GameCreatedDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ApiResponse<GameCreatedDto>>> CreateGame(
        [FromBody] CreateGameDto dto,
        CancellationToken cancellationToken)
    {
        if (!_currentUserService.UserId.HasValue)
        {
            return Unauthorized(ApiResponse<object>.Fail("User is not authenticated."));
        }

        _logger.LogInformation("Creating game for user {UserId}", _currentUserService.UserId.Value);
        var result = await _gameService.CreateGameAsync(_currentUserService.UserId.Value, dto, cancellationToken);
        return Ok(ApiResponse<GameCreatedDto>.Ok(result, "Game room created successfully."));
    }

    /// <summary>
    /// Joins an existing game using an invite code.
    /// </summary>
    [HttpPost("join")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<GameJoinedDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ApiResponse<GameJoinedDto>>> JoinGame(
        [FromBody] JoinGameDto dto,
        CancellationToken cancellationToken)
    {
        if (!_currentUserService.UserId.HasValue)
        {
            return Unauthorized(ApiResponse<object>.Fail("User is not authenticated."));
        }

        try
        {
            _logger.LogInformation("User {UserId} joining game with invite code: {InviteCode}",
                _currentUserService.UserId.Value, dto.InviteCode);
            var result = await _gameService.JoinGameAsync(_currentUserService.UserId.Value, dto.InviteCode, cancellationToken);
            return Ok(ApiResponse<GameJoinedDto>.Ok(result, "Joined game room successfully."));
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Join game failed for invite code {InviteCode}", dto.InviteCode);
            return BadRequest(ApiResponse<object>.Fail(ex.Message));
        }
    }

    /// <summary>
    /// Gets active game details and board state using an invite code.
    /// </summary>
    [HttpGet("{inviteCode}")]
    [ProducesResponseType(typeof(ApiResponse<GameDetailsDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<GameDetailsDto>>> GetGameByInviteCode(
        [FromRoute] string inviteCode, 
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("Looking up game state by invite code: {InviteCode}", inviteCode);
        var game = await _gameQueryService.GetGameByInviteCodeAsync(inviteCode, cancellationToken);
        if (game == null)
        {
            return NotFound(ApiResponse<GameDetailsDto>.Fail($"Game with invite code '{inviteCode}' was not found."));
        }

        return Ok(ApiResponse<GameDetailsDto>.Ok(game));
    }

    /// <summary>
    /// Gets the move history and metadata required to replay a completed chess game.
    /// </summary>
    [HttpGet("{gameId:guid}/replay")]
    [ProducesResponseType(typeof(ApiResponse<GameReplayDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<GameReplayDto>>> GetGameReplay(
        [FromRoute] Guid gameId, 
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("Retrieving replay log for game: {GameId}", gameId);
        var replay = await _gameQueryService.GetGameReplayAsync(gameId, cancellationToken);
        if (replay == null)
        {
            return NotFound(ApiResponse<GameReplayDto>.Fail($"Game replay for ID '{gameId}' was not found."));
        }

        return Ok(ApiResponse<GameReplayDto>.Ok(replay));
    }

    /// <summary>
    /// Gets paginated history of games played by the authenticated user.
    /// </summary>
    [HttpGet("history")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<GameHistoryItemDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ApiResponse<PagedResult<GameHistoryItemDto>>>> GetUserHistory(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        if (!_currentUserService.UserId.HasValue)
        {
            return Unauthorized(ApiResponse<object>.Fail("User is not authenticated."));
        }

        var userId = _currentUserService.UserId.Value;
        if (pageNumber < 1) pageNumber = 1;
        if (pageSize is < 1 or > 50) pageSize = 10;

        _logger.LogInformation("Fetching game history for user {UserId} (Page: {PageNumber}, Size: {PageSize})", userId, pageNumber, pageSize);
        var history = await _gameQueryService.GetUserGameHistoryAsync(userId, pageNumber, pageSize, cancellationToken);
        return Ok(ApiResponse<PagedResult<GameHistoryItemDto>>.Ok(history));
    }
}
