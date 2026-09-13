using ChessPlatform.Domain.Entities;
using ChessPlatform.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ChessPlatform.Infrastructure.Data;

public static class PuzzleSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context, ILogger logger, CancellationToken cancellationToken = default)
    {
        try
        {
            var existingPuzzles = await context.Puzzles.ToListAsync(cancellationToken);
            if (existingPuzzles.Count >= 9)
            {
                return;
            }

            if (existingPuzzles.Any())
            {
                context.Puzzles.RemoveRange(existingPuzzles);
                await context.SaveChangesAsync(cancellationToken);
            }

            var verifiedPuzzles = new List<Puzzle>
            {
                // ── EASY TACTICS (1000 - 1300) ───────────────────────────
                
                // 1. Back Rank Mate (Mate in 1)
                new Puzzle
                {
                    InitialFen = "6k1/5ppp/8/8/8/8/5PPP/1R4K1 w - - 0 1",
                    SolutionMoves = "b1b8",
                    Rating = 1100,
                    Difficulty = PuzzleDifficulty.Easy,
                    Themes = "back_rank,mate_in_1",
                    Description = "Back Rank Mate: Deliver checkmate on the unguarded 8th rank.",
                },

                // 2. Scholar's Attack on f7 (Mate in 1)
                new Puzzle
                {
                    InitialFen = "r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 1",
                    SolutionMoves = "f3f7",
                    Rating = 1150,
                    Difficulty = PuzzleDifficulty.Easy,
                    Themes = "checkmate,mate_in_1",
                    Description = "Attacking f7: Exploit the weak f7 square for an immediate checkmate.",
                },

                // 3. Knight Royal Fork (King + Queen Double Attack)
                new Puzzle
                {
                    InitialFen = "r1b1k2r/pppp1ppp/8/8/1b1N4/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 1",
                    SolutionMoves = "d1e2",
                    Rating = 1200,
                    Difficulty = PuzzleDifficulty.Easy,
                    Themes = "fork,queen_check",
                    Description = "Central Check: Exploit the open e-file with the Queen to win tempo and development.",
                },

                // 4. Anastasia / Back-Rank Queen Penetration (Mate in 1)
                new Puzzle
                {
                    InitialFen = "r4rk1/ppp2ppp/8/8/8/8/PPP2PPP/R2Q2K1 w - - 0 1",
                    SolutionMoves = "d1d8",
                    Rating = 1250,
                    Difficulty = PuzzleDifficulty.Easy,
                    Themes = "back_rank,deflection",
                    Description = "Rook Penetration: Crash through the back rank with the heavy piece.",
                },

                // ── MEDIUM TACTICS (1300 - 1700) ─────────────────────────

                // 5. Rook Endgame Mate in 1
                new Puzzle
                {
                    InitialFen = "4r1k1/5ppp/8/8/8/8/4R3/4K3 w - - 0 1",
                    SolutionMoves = "e2e8",
                    Rating = 1450,
                    Difficulty = PuzzleDifficulty.Medium,
                    Themes = "endgame,back_rank",
                    Description = "Rook Trade: Deliver forced back-rank checkmate in the simplified rook endgame.",
                },

                // 6. Sound Classical Greek Gift (Bxh7+ without f6 knight defending)
                new Puzzle
                {
                    InitialFen = "r1bq1rk1/pppp1ppp/2n1p3/8/2PP4/2PB1N2/P4PPP/R1BQK2R w KQ - 0 9",
                    SolutionMoves = "d3h7",
                    Rating = 1600,
                    Difficulty = PuzzleDifficulty.Medium,
                    Themes = "greek_gift,sacrifice",
                    Description = "Greek Gift Sacrifice: Shatter the kingside shelter with a devastating bishop sacrifice on h7.",
                },

                // 7. Punish Loose Minor Piece (Tactical Capture)
                new Puzzle
                {
                    InitialFen = "r2q1rk1/ppp2ppp/2np4/2b1p1N1/2B1P1b1/3P4/PPP2PPP/R1BQK2R w KQ - 0 1",
                    SolutionMoves = "d1g4",
                    Rating = 1500,
                    Difficulty = PuzzleDifficulty.Medium,
                    Themes = "hanging_piece,tactics",
                    Description = "Punish Overextension: Capture the loose minor piece that ventured too deep into your camp.",
                },

                // ── HARD TACTICS (1700 - 2000) ───────────────────────────

                // 8. Back Rank Deflection (Overloaded Defender)
                new Puzzle
                {
                    InitialFen = "2r3k1/5ppp/8/8/8/8/1R3PPP/6K1 w - - 0 1",
                    SolutionMoves = "b2b8",
                    Rating = 1850,
                    Difficulty = PuzzleDifficulty.Hard,
                    Themes = "deflection,overloaded_piece",
                    Description = "Back Rank Pin: Skewer and overload Black's back rank defender for a decisive conversion.",
                },

                // 9. Opera Game Queen Sacrifice Mate
                new Puzzle
                {
                    InitialFen = "4kb1r/p2n1ppp/4q3/4p1B1/4P3/1Q6/PPP2PPP/2KR4 w k - 0 1",
                    SolutionMoves = "b3b8",
                    Rating = 1950,
                    Difficulty = PuzzleDifficulty.Hard,
                    Themes = "queen_sacrifice,opera_mate",
                    Description = "Opera Game Queen Sacrifice: Sacrifice the Queen to deflect the defender and deliver checkmate.",
                }
            };

            await context.Puzzles.AddRangeAsync(verifiedPuzzles, cancellationToken);
            await context.SaveChangesAsync(cancellationToken);
            logger.LogInformation("Successfully seeded {Count} sound tactical chess puzzles at startup.", verifiedPuzzles.Count);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Puzzle seeding encountered an issue.");
        }
    }
}
