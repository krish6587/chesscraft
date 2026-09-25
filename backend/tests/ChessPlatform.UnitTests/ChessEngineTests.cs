using Chess;
using Xunit;

namespace ChessPlatform.UnitTests;

public class ChessEngineTests
{
    [Fact]
    public void InitialBoard_AllowsStandardOpeningMoves()
    {
        var board = new ChessBoard();
        
        // e2 to e4
        var m1 = new Move(new Position("e2"), new Position("e4"));
        Assert.True(board.IsValidMove(m1));
        board.Move(m1);
        Assert.Equal("e4", board.ExecutedMoves.Last().San);

        // Black responds e7 to e5
        var m2 = new Move(new Position("e7"), new Position("e5"));
        Assert.True(board.IsValidMove(m2));
        board.Move(m2);
        Assert.Equal("e5", board.ExecutedMoves.Last().San);

        // White responds g1 to f3 (Nf3)
        var m3 = new Move(new Position("g1"), new Position("f3"));
        Assert.True(board.IsValidMove(m3));
        board.Move(m3);
        Assert.Equal("Nf3", board.ExecutedMoves.Last().San);
    }

    [Fact]
    public void PawnPromotion_AppliesCorrectPromotionPiece()
    {
        // Position where white pawn is on e7, white to move
        var fen = "8/4P3/8/8/8/8/8/4K2k w - - 0 1";
        var board = ChessBoard.LoadFromFen(fen);

        // Promote to Queen
        var move = new Move(new Position("e7"), new Position("e8"));
        Assert.True(board.IsValidMove(move));
        board.Move(move);
        var lastMove = board.ExecutedMoves.Last();
        Assert.Contains("Q", lastMove.San);
        Assert.Contains("Q", board.ToFen());
    }

    [Fact]
    public void Castling_KingsideAndQueenside_Allowed()
    {
        // White can castle kingside, Black can castle queenside
        var fen = "r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1";
        var board = ChessBoard.LoadFromFen(fen);

        // White castles kingside: e1g1
        var whiteCastle = new Move(new Position("e1"), new Position("g1"));
        Assert.True(board.IsValidMove(whiteCastle));
        board.Move(whiteCastle);
        Assert.Equal("O-O", board.ExecutedMoves.Last().San);

        // Black castles queenside: e8c8
        var blackCastle = new Move(new Position("e8"), new Position("c8"));
        Assert.True(board.IsValidMove(blackCastle));
        board.Move(blackCastle);
        Assert.Equal("O-O-O", board.ExecutedMoves.Last().San);
    }

    [Fact]
    public void EnPassant_CapturesCorrectly()
    {
        // White pawn on e5, Black pawn on d7, Black to move
        var fen = "rnbqkbnr/pppp1ppp/8/4P3/8/8/PPPP1PPP/RNBQKBNR b KQkq - 0 2";
        var board = ChessBoard.LoadFromFen(fen);

        var d7d5 = new Move(new Position("d7"), new Position("d5"));
        Assert.True(board.IsValidMove(d7d5));
        board.Move(d7d5);
        Assert.Contains("d6", board.ToFen());

        // White takes en passant: e5d6
        var e5d6 = new Move(new Position("e5"), new Position("d6"));
        Assert.True(board.IsValidMove(e5d6));
        board.Move(e5d6);
        Assert.Equal("exd6", board.ExecutedMoves.Last().San);
    }

    [Fact]
    public void ThreefoldRepetition_ExtractsPositionKeyCorrectly()
    {
        var fen1 = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
        var fen2 = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 15 20";

        // Helper to get position key (first 4 tokens of FEN)
        string GetPositionKey(string fen)
        {
            var parts = fen.Split(' ');
            return parts.Length >= 4 ? string.Join(" ", parts.Take(4)) : fen;
        }

        var key1 = GetPositionKey(fen1);
        var key2 = GetPositionKey(fen2);

        // Even with different halfmove/fullmove counts, position keys are identical
        Assert.Equal(key1, key2);
    }

    [Fact]
    public void IllegalMove_ReturnsFalseForIsValidMove()
    {
        var board = new ChessBoard();
        
        // Cannot jump pawn over pieces illegally or move opponent piece
        Assert.False(board.IsValidMove(new Move(new Position("e2"), new Position("e5"))));
        Assert.False(board.IsValidMove(new Move(new Position("e7"), new Position("e5"))));
    }
}
