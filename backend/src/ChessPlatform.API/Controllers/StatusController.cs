using ChessPlatform.Application.Common.Models;
using ChessPlatform.Application.DTOs.System;
using ChessPlatform.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ChessPlatform.API.Controllers;

public class StatusController : BaseApiController
{
    private readonly ISystemService _systemService;
    private readonly ILogger<StatusController> _logger;

    public StatusController(ISystemService systemService, ILogger<StatusController> logger)
    {
        _systemService = systemService;
        _logger = logger;
    }

    /// <summary>
    /// Checks API health and infrastructure dependencies.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<HealthCheckDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<HealthCheckDto>>> GetStatus(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Processing health status check probe.");
        var status = await _systemService.GetHealthStatusAsync(cancellationToken);
        return Ok(ApiResponse<HealthCheckDto>.Ok(status, "System is operational."));
    }
}
