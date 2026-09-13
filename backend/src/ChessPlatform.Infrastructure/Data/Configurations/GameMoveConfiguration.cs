using ChessPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChessPlatform.Infrastructure.Data.Configurations;

public class GameMoveConfiguration : IEntityTypeConfiguration<GameMove>
{
    public void Configure(EntityTypeBuilder<GameMove> builder)
    {
        builder.ToTable("GameMoves");

        builder.HasKey(m => m.Id);

        builder.Property(m => m.FromSquare)
            .IsRequired()
            .HasMaxLength(4);

        builder.Property(m => m.ToSquare)
            .IsRequired()
            .HasMaxLength(4);

        builder.Property(m => m.San)
            .IsRequired()
            .HasMaxLength(16);

        builder.Property(m => m.FenAfter)
            .IsRequired()
            .HasMaxLength(128);

        builder.HasIndex(m => new { m.GameId, m.MoveNumber })
            .IsUnique();

        builder.HasOne(m => m.Player)
            .WithMany(u => u.Moves)
            .HasForeignKey(m => m.PlayerId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
