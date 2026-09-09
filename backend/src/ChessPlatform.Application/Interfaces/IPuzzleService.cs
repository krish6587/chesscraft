using ChessPlatform.Application.DTOs.Puzzle;
using ChessPlatform.Domain.Enums;

namespace ChessPlatform.Application.Interfaces;

public interface IPuzzleService
{
    Task<List<PuzzleDto>> GetPuzzlesAsync(PuzzleDifficulty? difficulty = null, CancellationToken ct = default);
    Task<PuzzleDto?> GetPuzzleByIdAsync(Guid puzzleId, CancellationToken ct = default);
    Task<PuzzleDto?> GetRandomPuzzleAsync(PuzzleDifficulty? difficulty = null, CancellationToken ct = default);
    Task<PuzzleAttemptResponseDto> RecordAttemptAsync(Guid userId, SubmitPuzzleAttemptDto dto, CancellationToken ct = default);
    Task<List<UserPuzzleHistoryItemDto>> GetUserPuzzleHistoryAsync(Guid userId, CancellationToken ct = default);
}
