using ChessPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChessPlatform.Infrastructure.Data.Configurations;

public class GameConfiguration : IEntityTypeConfiguration<Game>
{
    public void Configure(EntityTypeBuilder<Game> builder)
    {
        builder.ToTable("Games");

        builder.HasKey(g => g.Id);

        builder.Property(g => g.InviteCode)
            .IsRequired()
            .HasMaxLength(16);

        builder.HasIndex(g => g.InviteCode)
            .IsUnique();

        builder.Property(g => g.CurrentFen)
            .IsRequired()
            .HasMaxLength(128);

        builder.Property(g => g.Pgn)
            .HasMaxLength(4000);

        builder.Property(g => g.Status)
            .IsRequired();

        builder.Property(g => g.Result)
            .IsRequired();

        builder.Property(g => g.TerminationReason)
            .IsRequired();

        builder.Property(g => g.Version)
            .IsConcurrencyToken();

        // Foreign keys to User
        builder.HasOne(g => g.WhitePlayer)
            .WithMany(u => u.GamesAsWhite)
            .HasForeignKey(g => g.WhitePlayerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(g => g.BlackPlayer)
            .WithMany(u => u.GamesAsBlack)
            .HasForeignKey(g => g.BlackPlayerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(g => g.WinnerPlayer)
            .WithMany(u => u.WonGames)
            .HasForeignKey(g => g.WinnerPlayerId)
            .OnDelete(DeleteBehavior.Restrict);

        // 1-to-many Game -> GameMoves
        builder.HasMany(g => g.Moves)
            .WithOne(m => m.Game)
            .HasForeignKey(m => m.GameId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
