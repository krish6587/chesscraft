using ChessPlatform.Application.DTOs.System;
using ChessPlatform.Application.Interfaces;
using ChessPlatform.Infrastructure.Data;
using Microsoft.Extensions.Logging;

namespace ChessPlatform.Infrastructure.Services;

public class SystemService : ISystemService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<SystemService> _logger;

    public SystemService(
        ApplicationDbContext context, 
        ILogger<SystemService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<HealthCheckDto> GetHealthStatusAsync(CancellationToken cancellationToken = default)
    {
        var dbStatus = "Unknown";
        try
        {
            var canConnect = await _context.Database.CanConnectAsync(cancellationToken);
            dbStatus = canConnect ? "Connected" : "Disconnected";
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Database connectivity probe encountered an exception.");
            dbStatus = $"Unavailable ({ex.Message})";
        }

        return new HealthCheckDto
        {
            Status = "Healthy",
            Service = "ChessPlatform.API",
            Version = "1.0.0",
            Environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development",
            ServerTimeUtc = DateTime.UtcNow,
            DatabaseStatus = dbStatus
        };
    }
}
