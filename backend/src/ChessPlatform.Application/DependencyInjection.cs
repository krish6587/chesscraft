using Microsoft.Extensions.DependencyInjection;

namespace ChessPlatform.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // Application layer service registrations (validators, mappers, orchestrators)
        return services;
    }
}
