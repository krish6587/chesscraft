using ChessPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChessPlatform.Infrastructure.Data.Configurations;

public class UserPuzzleAttemptConfiguration : IEntityTypeConfiguration<UserPuzzleAttempt>
{
    public void Configure(EntityTypeBuilder<UserPuzzleAttempt> builder)
    {
        builder.ToTable("UserPuzzleAttempts");

        builder.HasKey(a => a.Id);

        builder.HasOne(a => a.User)
            .WithMany(u => u.PuzzleAttempts)
            .HasForeignKey(a => a.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(a => a.Puzzle)
            .WithMany(p => p.Attempts)
            .HasForeignKey(a => a.PuzzleId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(a => new { a.UserId, a.PuzzleId });
    }
}
