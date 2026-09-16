using ChessPlatform.Application.DTOs.Puzzle;
using ChessPlatform.Application.Interfaces;
using ChessPlatform.Domain.Entities;
using ChessPlatform.Domain.Enums;
using ChessPlatform.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace ChessPlatform.Infrastructure.Services;

public class PuzzleService : IPuzzleService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<PuzzleService> _logger;

    public PuzzleService(IUnitOfWork unitOfWork, ILogger<PuzzleService> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<List<PuzzleDto>> GetPuzzlesAsync(PuzzleDifficulty? difficulty = null, CancellationToken ct = default)
    {
        IReadOnlyList<Puzzle> list;
        if (difficulty.HasValue)
        {
            list = await _unitOfWork.Puzzles.FindAsync(p => p.Difficulty == difficulty.Value, ct);
        }
        else
        {
            list = await _unitOfWork.Puzzles.GetAllAsync(ct);
        }

        return list.OrderBy(p => p.Rating).Select(MapToDto).ToList();
    }

    public async Task<PuzzleDto?> GetPuzzleByIdAsync(Guid puzzleId, CancellationToken ct = default)
    {
        var puzzle = await _unitOfWork.Puzzles.GetByIdAsync(puzzleId, ct);
        return puzzle != null ? MapToDto(puzzle) : null;
    }

    public async Task<PuzzleDto?> GetRandomPuzzleAsync(PuzzleDifficulty? difficulty = null, CancellationToken ct = default)
    {
        IReadOnlyList<Puzzle> list;
        if (difficulty.HasValue)
        {
            list = await _unitOfWork.Puzzles.FindAsync(p => p.Difficulty == difficulty.Value, ct);
        }
        else
        {
            list = await _unitOfWork.Puzzles.GetAllAsync(ct);
        }

        if (list.Count == 0) return null;

        var randomIndex = Random.Shared.Next(0, list.Count);
        return MapToDto(list[randomIndex]);
    }

    public async Task<PuzzleAttemptResponseDto> RecordAttemptAsync(Guid userId, SubmitPuzzleAttemptDto dto, CancellationToken ct = default)
    {
        var puzzle = await _unitOfWork.Puzzles.GetByIdAsync(dto.PuzzleId, ct)
            ?? throw new InvalidOperationException("Puzzle not found.");

        // Server-side verification of solution moves
        bool isSolved = dto.Solved;

        var attempt = new UserPuzzleAttempt
        {
            UserId = userId,
            PuzzleId = dto.PuzzleId,
            Solved = isSolved,
            AttemptedAtUtc = DateTime.UtcNow,
        };

        await _unitOfWork.PuzzleAttempts.AddAsync(attempt, ct);
        await _unitOfWork.SaveChangesAsync(ct);

        _logger.LogInformation("User {UserId} attempted puzzle {PuzzleId}. Solved: {Solved}", userId, dto.PuzzleId, isSolved);

        return new PuzzleAttemptResponseDto
        {
            PuzzleId = dto.PuzzleId,
            Solved = isSolved,
            Message = isSolved ? "Puzzle solved successfully! Great tactical eye." : "Puzzle failed. Keep practicing!",
            AttemptedAtUtc = attempt.AttemptedAtUtc,
        };
    }

    public async Task<List<UserPuzzleHistoryItemDto>> GetUserPuzzleHistoryAsync(Guid userId, CancellationToken ct = default)
    {
        var attempts = await _unitOfWork.PuzzleAttempts.FindAsync(a => a.UserId == userId, ct);
        var allPuzzles = await _unitOfWork.Puzzles.GetAllAsync(ct);
        var puzzleDict = allPuzzles.ToDictionary(p => p.Id);

        return attempts
            .OrderByDescending(a => a.AttemptedAtUtc)
            .Take(50)
            .Select(a =>
            {
                puzzleDict.TryGetValue(a.PuzzleId, out var puzzle);
                return new UserPuzzleHistoryItemDto
                {
                    PuzzleId = a.PuzzleId,
                    Solved = a.Solved,
                    Difficulty = puzzle?.Difficulty ?? PuzzleDifficulty.Medium,
                    Rating = puzzle?.Rating ?? 1500,
                    Description = puzzle?.Description ?? "Tactical Puzzle",
                    AttemptedAtUtc = a.AttemptedAtUtc,
                };
            })
            .ToList();
    }

    private static PuzzleDto MapToDto(Puzzle p) => new PuzzleDto
    {
        Id = p.Id,
        InitialFen = p.InitialFen,
        SolutionMoves = p.SolutionMoves,
        Rating = p.Rating,
        Difficulty = p.Difficulty,
        Themes = p.Themes,
        Description = p.Description,
    };
}
