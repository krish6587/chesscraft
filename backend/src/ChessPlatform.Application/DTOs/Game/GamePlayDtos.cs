namespace ChessPlatform.Application.DTOs.Game;

// ── Request DTOs ──────────────────────────────────────────────

public class MakeMoveDto
{
    public Guid GameId { get; set; }
    public string From { get; set; } = string.Empty;
    public string To { get; set; } = string.Empty;
    public string? Promotion { get; set; }
}

public class JoinGameDto
{
    public string InviteCode { get; set; } = string.Empty;
}

public class ResignGameDto
{
    public Guid GameId { get; set; }
}

// ── Response DTOs ─────────────────────────────────────────────

public class GameCreatedDto
{
    public Guid GameId { get; set; }
    public string InviteCode { get; set; } = string.Empty;
    public string PlayerColor { get; set; } = string.Empty; // "w" or "b"
    public string Fen { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int TimeControlSeconds { get; set; }
}

public class GameJoinedDto
{
    public Guid GameId { get; set; }
    public string PlayerColor { get; set; } = string.Empty;
    public string OpponentUsername { get; set; } = string.Empty;
    public string Fen { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int TimeControlSeconds { get; set; }
    public List<MovePlayedDto> MoveHistory { get; set; } = new();
}

public class OpponentJoinedDto
{
    public Guid GameId { get; set; }
    public string OpponentUsername { get; set; } = string.Empty;
    public string Fen { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}

public class MovePlayedDto
{
    public string From { get; set; } = string.Empty;
    public string To { get; set; } = string.Empty;
    public string? Promotion { get; set; }
    public string San { get; set; } = string.Empty;
    public string Fen { get; set; } = string.Empty;
    public string Turn { get; set; } = string.Empty; // "w" or "b"
    public bool IsCheck { get; set; }
    public bool IsCheckmate { get; set; }
    public bool IsStalemate { get; set; }
    public bool IsDraw { get; set; }
    public int MoveNumber { get; set; }
}

public class GameOverDto
{
    public Guid GameId { get; set; }
    public string Result { get; set; } = string.Empty; // "white_wins", "black_wins", "draw"
    public string Reason { get; set; } = string.Empty;  // "checkmate", "resignation", "stalemate", etc.
    public string Fen { get; set; } = string.Empty;
    public string? WinnerUsername { get; set; }
}

public class GameStateDto
{
    public Guid GameId { get; set; }
    public string InviteCode { get; set; } = string.Empty;
    public string Fen { get; set; } = string.Empty;
    public string Turn { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? WhiteUsername { get; set; }
    public string? BlackUsername { get; set; }
    public Guid? WhitePlayerId { get; set; }
    public Guid? BlackPlayerId { get; set; }
    public string PlayerColor { get; set; } = string.Empty;
    public int TimeControlSeconds { get; set; }
    public string? Result { get; set; }
    public string? TerminationReason { get; set; }
    public List<MovePlayedDto> MoveHistory { get; set; } = new();
    public bool OpponentConnected { get; set; }
}

public class PlayerConnectionDto
{
    public Guid GameId { get; set; }
    public string Username { get; set; } = string.Empty;
    public bool Connected { get; set; }
}
