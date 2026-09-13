using ChessPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChessPlatform.Infrastructure.Data.Configurations;

public class UserSettingsConfiguration : IEntityTypeConfiguration<UserSettings>
{
    public void Configure(EntityTypeBuilder<UserSettings> builder)
    {
        builder.ToTable("UserSettings");

        builder.HasKey(s => s.UserId);

        builder.Property(s => s.BoardTheme)
            .IsRequired()
            .HasMaxLength(32)
            .HasDefaultValue("slate");

        builder.Property(s => s.PieceStyle)
            .IsRequired()
            .HasMaxLength(32)
            .HasDefaultValue("classic");

        builder.Property(s => s.SoundEnabled)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(s => s.DarkTheme)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(s => s.MoveAnimationEnabled)
            .IsRequired()
            .HasDefaultValue(true);
    }
}
