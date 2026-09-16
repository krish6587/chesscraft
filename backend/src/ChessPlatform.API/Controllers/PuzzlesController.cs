using ChessPlatform.Application.Common.Models;
using ChessPlatform.Application.DTOs.Puzzle;
using ChessPlatform.Application.Interfaces;
using ChessPlatform.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChessPlatform.API.Controllers;

public class PuzzlesController : BaseApiController
{
    private readonly IPuzzleService _puzzleService;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<PuzzlesController> _logger;

    public PuzzlesController(
        IPuzzleService puzzleService,
        ICurrentUserService currentUserService,
        ILogger<PuzzlesController> logger)
    {
        _puzzleService = puzzleService;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    /// <summary>
    /// Gets list of available tactical puzzles, optionally filtered by difficulty.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<PuzzleDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<List<PuzzleDto>>>> GetPuzzles(
        [FromQuery] PuzzleDifficulty? difficulty,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("Fetching puzzles list with difficulty filter: {Difficulty}", difficulty);
        var puzzles = await _puzzleService.GetPuzzlesAsync(difficulty, cancellationToken);
        return Ok(ApiResponse<List<PuzzleDto>>.Ok(puzzles));
    }

    /// <summary>
    /// Gets a random tactical chess puzzle.
    /// </summary>
    [HttpGet("random")]
    [ProducesResponseType(typeof(ApiResponse<PuzzleDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<PuzzleDto>>> GetRandomPuzzle(
        [FromQuery] PuzzleDifficulty? difficulty,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("Fetching random puzzle with difficulty filter: {Difficulty}", difficulty);
        var puzzle = await _puzzleService.GetRandomPuzzleAsync(difficulty, cancellationToken);
        if (puzzle == null)
        {
            return NotFound(ApiResponse<PuzzleDto>.Fail("No puzzles available for the specified criteria."));
        }

        return Ok(ApiResponse<PuzzleDto>.Ok(puzzle));
    }

    /// <summary>
    /// Gets a single puzzle by ID.
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<PuzzleDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<PuzzleDto>>> GetPuzzleById(
        [FromRoute] Guid id,
        CancellationToken cancellationToken)
    {
        var puzzle = await _puzzleService.GetPuzzleByIdAsync(id, cancellationToken);
        if (puzzle == null)
        {
            return NotFound(ApiResponse<PuzzleDto>.Fail($"Puzzle with ID '{id}' was not found."));
        }

        return Ok(ApiResponse<PuzzleDto>.Ok(puzzle));
    }

    /// <summary>
    /// Records a user's puzzle solve attempt.
    /// </summary>
    [HttpPost("attempt")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<PuzzleAttemptResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ApiResponse<PuzzleAttemptResponseDto>>> RecordAttempt(
        [FromBody] SubmitPuzzleAttemptDto dto,
        CancellationToken cancellationToken)
    {
        if (!_currentUserService.UserId.HasValue)
        {
            return Unauthorized(ApiResponse<object>.Fail("User is not authenticated."));
        }

        try
        {
            var result = await _puzzleService.RecordAttemptAsync(_currentUserService.UserId.Value, dto, cancellationToken);
            return Ok(ApiResponse<PuzzleAttemptResponseDto>.Ok(result));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<object>.Fail(ex.Message));
        }
    }

    /// <summary>
    /// Gets the authenticated user's puzzle solve history.
    /// </summary>
    [HttpGet("history")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<List<UserPuzzleHistoryItemDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ApiResponse<List<UserPuzzleHistoryItemDto>>>> GetUserPuzzleHistory(
        CancellationToken cancellationToken)
    {
        if (!_currentUserService.UserId.HasValue)
        {
            return Unauthorized(ApiResponse<object>.Fail("User is not authenticated."));
        }

        var history = await _puzzleService.GetUserPuzzleHistoryAsync(_currentUserService.UserId.Value, cancellationToken);
        return Ok(ApiResponse<List<UserPuzzleHistoryItemDto>>.Ok(history));
    }
}
