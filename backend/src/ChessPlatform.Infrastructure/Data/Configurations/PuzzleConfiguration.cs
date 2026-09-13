using ChessPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChessPlatform.Infrastructure.Data.Configurations;

public class PuzzleConfiguration : IEntityTypeConfiguration<Puzzle>
{
    public void Configure(EntityTypeBuilder<Puzzle> builder)
    {
        builder.ToTable("Puzzles");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.InitialFen)
            .IsRequired()
            .HasMaxLength(128);

        builder.Property(p => p.SolutionMoves)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(p => p.Difficulty)
            .IsRequired();

        builder.Property(p => p.Themes)
            .HasMaxLength(128);

        builder.Property(p => p.Description)
            .HasMaxLength(256);
    }
}
