# Stage 1: Build the .NET solution
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files and restore dependencies
COPY ["backend/src/ChessPlatform.Domain/ChessPlatform.Domain.csproj", "backend/src/ChessPlatform.Domain/"]
COPY ["backend/src/ChessPlatform.Application/ChessPlatform.Application.csproj", "backend/src/ChessPlatform.Application/"]
COPY ["backend/src/ChessPlatform.Infrastructure/ChessPlatform.Infrastructure.csproj", "backend/src/ChessPlatform.Infrastructure/"]
COPY ["backend/src/ChessPlatform.API/ChessPlatform.API.csproj", "backend/src/ChessPlatform.API/"]

RUN dotnet restore "backend/src/ChessPlatform.API/ChessPlatform.API.csproj"

# Copy full source and build release
COPY backend/ backend/
WORKDIR "/src/backend/src/ChessPlatform.API"
RUN dotnet publish "ChessPlatform.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 8080
EXPOSE 80

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "ChessPlatform.API.dll"]
