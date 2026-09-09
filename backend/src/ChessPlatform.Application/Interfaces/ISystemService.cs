using ChessPlatform.Application.DTOs.System;

namespace ChessPlatform.Application.Interfaces;

public interface ISystemService
{
    Task<HealthCheckDto> GetHealthStatusAsync(CancellationToken cancellationToken = default);
}
