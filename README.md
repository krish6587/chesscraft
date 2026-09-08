# ChessCraft — Modern Real-Time Chess Platform

A production-grade, full-stack chess platform engineered with .NET 8 (Clean Architecture, SignalR, EF Core) and React 19 + Vite.

---

## 🌟 Key Features

- **Real-Time Multiplayer**: Instant matchmaking and private room invites (`CRAFT-XXXXXX`) powered by ASP.NET Core SignalR.
- **Server-Side Rule & Move Validation**: Full FEN synchronization, move verification, castling, pawn promotions, en passant, and Threefold Repetition tracking.
- **Server Clock Enforcement**: Authoritative server-side clocks with timeout forfeits.
- **Tactical Chess Puzzles**: Curated chess puzzles with forced tactical combinations (Mate-in-1, Mate-in-2, Deflections, Sacrifices).
- **Procedural Sound Engine**: Ultra-low-latency Web Audio API synthesizer for acoustic move cues (moves, captures, checks, victory).
- **Custom Board Themes**: Dynamic board styling (`Slate & Ice`, `Emerald Arena`, `Obsidian Night`, `Vintage Timber`).
- **Interactive Match Replay**: Step-by-step game replay engine with move history and board state reproduction.
- **Security & Integrity**: JWT-based authentication, bcrypt password hashing, case-insensitive normalized usernames, and concurrency control tokens.

---

## 🏗️ Architecture Overview

```
ChessPlatform/
├── backend/
│   ├── src/
│   │   ├── ChessPlatform.Domain/          # Core Domain Entities, Enums & Rules
│   │   ├── ChessPlatform.Application/     # CQRS/Services, DTOs & Interfaces
│   │   ├── ChessPlatform.Infrastructure/  # EF Core, Migrations, Repositories & Engine
│   │   └── ChessPlatform.API/             # Controllers, SignalR Hubs & Middleware
│   └── tests/
│       └── ChessPlatform.UnitTests/       # xUnit Unit Test Suite
│
├── frontend/
│   ├── src/
│   │   ├── api/                           # Axios REST API Client & Interceptors
│   │   ├── components/                    # UI Design System & ChessBoard Components
│   │   ├── context/                       # AuthContext & Session Management
│   │   ├── hooks/                         # useMultiplayerGame & useChessGame Hooks
│   │   ├── pages/                         # Lazy-loaded Route Views
│   │   └── services/                      # SignalR & Procedural Sound Services
│   └── index.html
```

---

## 🚀 Getting Started

### Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/)

### 1. Run Backend API
```bash
cd backend/src/ChessPlatform.API
dotnet run
```
- API Base URL: `http://localhost:5080`
- SignalR Hub: `http://localhost:5080/hubs/chess`
- Swagger UI (Development): `http://localhost:5080/swagger`

### 2. Run Frontend Client
```bash
cd frontend
npm install
npm run dev
```
- Client URL: `http://localhost:5173`

---

## 🧪 Running Unit Tests

```bash
dotnet test backend/tests/ChessPlatform.UnitTests/ChessPlatform.UnitTests.csproj
```

---

## 🔒 Security Best Practices

- **Normalized Username Checks**: Unique case-insensitive usernames across registration and authentication.
- **SignalR Scope Protection**: Room-scoped message isolation preventing game interception.
- **Anti-Cheat Verification**: Server-side move verification and hidden puzzle solution vectors.
