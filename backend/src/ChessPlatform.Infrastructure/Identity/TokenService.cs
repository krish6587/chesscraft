using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ChessPlatform.Application.Interfaces;
using ChessPlatform.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;

namespace ChessPlatform.Infrastructure.Identity;

public class TokenService : ITokenService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<TokenService> _logger;

    public TokenService(IConfiguration configuration, ILogger<TokenService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public string GenerateToken(User user)
    {
        var secret = _configuration["Jwt:Secret"]
            ?? throw new InvalidOperationException("JWT secret key is not configured. Set 'Jwt:Secret' in appsettings or environment variables.");

        var issuer = _configuration["Jwt:Issuer"] ?? "ChessPlatform";
        var audience = _configuration["Jwt:Audience"] ?? "ChessPlatformClient";

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new(JwtRegisteredClaimNames.UniqueName, user.Username),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64),
            new("uid", user.Id.ToString())
        };

        var expiration = GetTokenExpiration();

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: expiration,
            signingCredentials: credentials
        );

        _logger.LogInformation("JWT issued for user {Username} (Id: {UserId}), expires at {Expiration}",
            user.Username, user.Id, expiration);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public DateTime GetTokenExpiration()
    {
        var expirationMinutes = _configuration.GetValue<int>("Jwt:ExpirationMinutes", 1440); // Default 24 hours
        return DateTime.UtcNow.AddMinutes(expirationMinutes);
    }
}
