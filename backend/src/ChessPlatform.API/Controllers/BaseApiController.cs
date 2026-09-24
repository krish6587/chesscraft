using ChessPlatform.Application.Common.Models;
using Microsoft.AspNetCore.Mvc;

namespace ChessPlatform.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public abstract class BaseApiController : ControllerBase
{
    protected ActionResult<ApiResponse<T>> HandleResult<T>(T? data, string message = "Success")
    {
        if (data == null)
        {
            return NotFound(ApiResponse<T>.Fail("Requested resource was not found."));
        }

        return Ok(ApiResponse<T>.Ok(data, message));
    }
}
