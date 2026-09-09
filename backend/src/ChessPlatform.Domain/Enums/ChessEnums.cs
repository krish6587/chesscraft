namespace ChessPlatform.Domain.Enums;

public enum GameStatus
{
    WaitingForPlayer = 0,
    InProgress = 1,
    Completed = 2,
    Aborted = 3
}

public enum GameResult
{
    None = 0,
    WhiteWins = 1,
    BlackWins = 2,
    Draw = 3
}

public enum TerminationReason
{
    None = 0,
    Checkmate = 1,
    Resignation = 2,
    Timeout = 3,
    Stalemate = 4,
    FiftyMoveRule = 5,
    ThreefoldRepetition = 6,
    InsufficientMaterial = 7,
    Agreement = 8
}

public enum PieceColor
{
    White = 0,
    Black = 1
}

public enum PuzzleDifficulty
{
    Easy = 1,
    Medium = 2,
    Hard = 3
}
