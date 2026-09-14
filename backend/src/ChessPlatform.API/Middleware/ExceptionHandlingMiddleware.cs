using System.Net;
using System.Text.Json;
using ChessPlatform.Application.Common.Exceptions;
using ChessPlatform.Application.Common.Models;
using Microsoft.AspNetCore.Mvc;

namespace ChessPlatform.API.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;
    private readonly IHostEnvironment _env;

    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger,
        IHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var statusCode = HttpStatusCode.InternalServerError;
        var message = "An unexpected error occurred while processing your request.";
        IDictionary<string, string[]>? errors = null;

        switch (exception)
        {
            case NotFoundException notFoundEx:
                statusCode = HttpStatusCode.NotFound;
                message = notFoundEx.Message;
                _logger.LogWarning(exception, "Resource not found: {Message}", message);
                break;

            case ValidationException valEx:
                statusCode = HttpStatusCode.BadRequest;
                message = valEx.Message;
                errors = valEx.Errors;
                _logger.LogWarning(exception, "Validation error occurred: {Message}", message);
                break;

            case ConflictException conflictEx:
                statusCode = HttpStatusCode.Conflict;
                message = conflictEx.Message;
                _logger.LogWarning(exception, "Conflict occurred: {Message}", message);
                break;

            case InvalidCredentialsException credEx:
                statusCode = HttpStatusCode.Unauthorized;
                message = credEx.Message;
                _logger.LogWarning(exception, "Authentication failed: {Message}", message);
                break;

            case UnauthorizedAccessException unAuthEx:
                statusCode = HttpStatusCode.Unauthorized;
                message = !string.IsNullOrWhiteSpace(unAuthEx.Message) && unAuthEx.Message != "Attempted to perform an unauthorized operation."
                    ? unAuthEx.Message
                    : "You are not authorized to access this resource.";
                _logger.LogWarning(exception, "Unauthorized access attempt: {Message}", message);
                break;

            default:
                _logger.LogError(exception, "Unhandled system exception: {Message}", exception.Message);
                if (_env.IsDevelopment())
                {
                    message = $"{exception.Message} ({exception.GetType().Name})";
                }
                break;
        }

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;

        var response = ApiResponse<object>.Fail(message, errors);
        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        await context.Response.WriteAsync(JsonSerializer.Serialize(response, jsonOptions));
    }
}
