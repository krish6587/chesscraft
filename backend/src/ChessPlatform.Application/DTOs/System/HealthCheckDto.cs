namespace ChessPlatform.Application.DTOs.System;

public class HealthCheckDto
{
    public string Status { get; set; } = "Healthy";
    public string Service { get; set; } = "ChessPlatform.API";
    public string Version { get; set; } = "1.0.0";
    public string Environment { get; set; } = "Development";
    public DateTime ServerTimeUtc { get; set; } = DateTime.UtcNow;
    public string DatabaseStatus { get; set; } = "Unknown";
}
