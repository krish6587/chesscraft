using ChessPlatform.Application.Interfaces;
using ChessPlatform.Domain.Interfaces;
using ChessPlatform.Infrastructure.Data;
using ChessPlatform.Infrastructure.Identity;
using ChessPlatform.Infrastructure.Repositories;
using ChessPlatform.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ChessPlatform.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(
        this IServiceCollection services, 
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection") 
            ?? configuration["DATABASE_URL"]
            ?? "Data Source=chessplatform.db";

        services.AddDbContext<ApplicationDbContext>(options =>
        {
            if (connectionString.StartsWith("Host=", StringComparison.OrdinalIgnoreCase) ||
                connectionString.StartsWith("Server=", StringComparison.OrdinalIgnoreCase) ||
                connectionString.StartsWith("User Id=", StringComparison.OrdinalIgnoreCase) ||
                connectionString.StartsWith("Username=", StringComparison.OrdinalIgnoreCase) ||
                connectionString.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) ||
                connectionString.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase) ||
                connectionString.Contains("Port=5432", StringComparison.OrdinalIgnoreCase))
            {
                var npgsqlConnectionString = ParsePostgreSqlConnectionString(connectionString);
                options.UseNpgsql(npgsqlConnectionString, npgsqlOptions =>
                {
                    npgsqlOptions.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName);
                    npgsqlOptions.EnableRetryOnFailure(
                        maxRetryCount: 5,
                        maxRetryDelay: TimeSpan.FromSeconds(30),
                        errorCodesToAdd: null);
                });
            }
            else if (connectionString.Contains("Data Source=", StringComparison.OrdinalIgnoreCase) || 
                     connectionString.EndsWith(".db", StringComparison.OrdinalIgnoreCase))
            {
                options.UseSqlite(connectionString);
            }
            else
            {
                options.UseSqlServer(connectionString, sqlOptions =>
                {
                    sqlOptions.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName);
                    sqlOptions.EnableRetryOnFailure(
                        maxRetryCount: 5,
                        maxRetryDelay: TimeSpan.FromSeconds(30),
                        errorNumbersToAdd: null);
                });
            }
        });

        // Register Unit of Work and Repositories
        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
        services.AddScoped<IGameRepository, GameRepository>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // Register Identity & Auth Services
        services.AddScoped<IPasswordHasher, PasswordHasher>();
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IAuthService, AuthService>();

        // Register Business Services
        services.AddScoped<ISystemService, SystemService>();
        services.AddScoped<IUserSettingsService, UserSettingsService>();
        services.AddScoped<IGameQueryService, GameQueryService>();
        services.AddScoped<IGameService, GameService>();
        services.AddScoped<IPuzzleService, PuzzleService>();

        return services;
    }

    private static string ParsePostgreSqlConnectionString(string connectionString)
    {
        if (connectionString.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) ||
            connectionString.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
        {
            try
            {
                var uri = new Uri(connectionString);
                var userInfo = uri.UserInfo.Split(':');
                var username = userInfo.Length > 0 ? Uri.UnescapeDataString(userInfo[0]) : "";
                var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "";
                var port = uri.Port > 0 ? uri.Port : 5432;
                var database = uri.AbsolutePath.TrimStart('/');

                return $"Host={uri.Host};Port={port};Database={database};Username={username};Password={password};SSL Mode=Require;Trust Server Certificate=true;";
            }
            catch
            {
                return connectionString;
            }
        }

        return connectionString;
    }
}
