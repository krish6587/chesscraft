using ChessPlatform.Domain.Entities;

namespace ChessPlatform.Application.Interfaces;

public interface ITokenService
{
    string GenerateToken(User user);
    DateTime GetTokenExpiration();
}
