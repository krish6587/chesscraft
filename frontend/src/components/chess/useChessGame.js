import { useState, useCallback, useRef, useEffect } from 'react';
import { Chess } from 'chess.js';
import { soundService } from '../../services/soundService';
import { getBotMove } from '../../services/chessBot';

export const useChessGame = (options = {}) => {
  const { onMoveMade, onGameOver, botColor = null, difficulty = 'medium' } = options;
  // botColor: 'w' | 'b' | null (null = no bot / pass-and-play)
  const botTimerRef = useRef(null);

  // Persistent Chess instance reference
  const chessRef = useRef(new Chess());
  const chess = chessRef.current;

  // React state synchronized with the Chess instance
  const [fen, setFen] = useState(chess.fen());
  const [board, setBoard] = useState(chess.board());
  const [turn, setTurn] = useState(chess.turn());
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]); // array of 'to' squares e.g. ['e3', 'e4']
  const [lastMove, setLastMove] = useState(null); // { from, to }
  const [history, setHistory] = useState([]);
  const [capturedPieces, setCapturedPieces] = useState({ w: [], b: [] });
  const [pendingPromotion, setPendingPromotion] = useState(null); // { from, to }

  const [gameStatus, setGameStatus] = useState('in_progress'); // 'in_progress' | 'checkmate' | 'stalemate' | 'draw' | 'resigned'
  const [winner, setWinner] = useState(null); // 'w' | 'b' | 'draw' | null
  const [statusMessage, setStatusMessage] = useState('Game in progress');

  // Helper to re-derive captured pieces by tallying from history
  const calculateCaptured = useCallback(() => {
    const moves = chess.history({ verbose: true });
    const captured = { w: [], b: [] }; // captured pieces grouped by their color
    moves.forEach((m) => {
      if (m.captured) {
        // if White captured a piece, that piece belonged to Black
        const pieceColor = m.color === 'w' ? 'b' : 'w';
        captured[pieceColor].push(m.captured);
      }
    });
    return captured;
  }, [chess]);

  // Update game state flags from chess engine
  const updateGameState = useCallback(() => {
    setFen(chess.fen());
    setBoard(chess.board());
    setTurn(chess.turn());
    setHistory(chess.history({ verbose: true }));
    setCapturedPieces(calculateCaptured());

    if (chess.isCheckmate()) {
      const winningColor = chess.turn() === 'w' ? 'b' : 'w';
      setGameStatus('checkmate');
      setWinner(winningColor);
      const msg = `Checkmate! ${winningColor === 'w' ? 'White' : 'Black'} wins.`;
      setStatusMessage(msg);
      if (onGameOver) onGameOver({ result: 'checkmate', winner: winningColor, message: msg });
    } else if (chess.isStalemate()) {
      setGameStatus('stalemate');
      setWinner('draw');
      const msg = 'Stalemate! Game is a draw.';
      setStatusMessage(msg);
      if (onGameOver) onGameOver({ result: 'stalemate', winner: 'draw', message: msg });
    } else if (chess.isThreefoldRepetition()) {
      setGameStatus('draw');
      setWinner('draw');
      const msg = 'Draw by Threefold Repetition.';
      setStatusMessage(msg);
      if (onGameOver) onGameOver({ result: 'draw', reason: 'threefold', message: msg });
    } else if (chess.isInsufficientMaterial()) {
      setGameStatus('draw');
      setWinner('draw');
      const msg = 'Draw by Insufficient Material.';
      setStatusMessage(msg);
      if (onGameOver) onGameOver({ result: 'draw', reason: 'insufficient_material', message: msg });
    } else if (chess.isDraw()) {
      setGameStatus('draw');
      setWinner('draw');
      const msg = 'Game drawn.';
      setStatusMessage(msg);
      if (onGameOver) onGameOver({ result: 'draw', message: msg });
    } else if (chess.inCheck()) {
      setStatusMessage(`${chess.turn() === 'w' ? 'White' : 'Black'} is in check!`);
    } else {
      setStatusMessage(`${chess.turn() === 'w' ? 'White' : 'Black'} to move`);
    }
  }, [chess, calculateCaptured, onGameOver]);

  // Trigger bot move after a human move
  const scheduleBotMove = useCallback(
    (currentChess) => {
      if (!botColor) return;
      if (currentChess.turn() !== botColor) return;
      if (currentChess.isGameOver()) return;

      // Clear any pending bot timer
      if (botTimerRef.current) clearTimeout(botTimerRef.current);

      botTimerRef.current = setTimeout(() => {
        // Re-check — game might have ended by the time timer fires
        if (currentChess.isGameOver()) return;
        if (currentChess.turn() !== botColor) return;

        const move = getBotMove(currentChess, difficulty);
        if (move) {
          try {
            const result = currentChess.move(move);
            if (result) {
              setLastMove({ from: result.from, to: result.to });
              setSelectedSquare(null);
              setLegalMoves([]);
              updateGameState();

              if (result.captured) soundService.playCapture();
              else if (currentChess.inCheck()) soundService.playCheck();
              else if (currentChess.isGameOver()) soundService.playGameOver();
              else soundService.playMove();
            }
          } catch (e) {
            console.warn('Bot move error:', e);
          }
        }
      }, 350); // small delay feels more natural
    },
    [botColor, difficulty, updateGameState]
  );

  // Execute move on the engine
  const executeMove = useCallback(
    (from, to, promotion = 'q', isBot = false) => {
      try {
        const moveResult = chess.move({ from, to, promotion });
        if (moveResult) {
          setLastMove({ from, to });
          setSelectedSquare(null);
          setLegalMoves([]);
          setPendingPromotion(null);
          updateGameState();

          if (moveResult.captured) {
            soundService.playCapture();
          } else if (chess.inCheck()) {
            soundService.playCheck();
          } else if (chess.isGameOver()) {
            soundService.playGameOver();
          } else {
            soundService.playMove();
          }

          if (onMoveMade) {
            onMoveMade({
              move: moveResult,
              fen: chess.fen(),
              turn: chess.turn(),
              isBot,
            });
          }
          return moveResult;
        }
      } catch (err) {
        console.warn('Invalid move attempted:', err);
      }
      return null;
    },
    [chess, updateGameState, onMoveMade]
  );

  // Select square and compute legal moves
  const selectSquare = useCallback(
    (square) => {
      if (gameStatus !== 'in_progress') return;
      // Block clicks when it's the bot's turn
      if (botColor && chess.turn() === botColor) return;

      const piece = chess.get(square);

      // If user clicks on an already selected square, deselect
      if (selectedSquare === square) {
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }

      // If already selected a piece, check if target square is a legal destination
      if (selectedSquare) {
        const isDestination = legalMoves.some((m) => m.to === square);
        if (isDestination) {
          // Check if move is a pawn promotion
          const selectedPiece = chess.get(selectedSquare);
          const isPromotion =
            selectedPiece &&
            selectedPiece.type === 'p' &&
            ((selectedPiece.color === 'w' && square[1] === '8') ||
              (selectedPiece.color === 'b' && square[1] === '1'));

          if (isPromotion) {
            setPendingPromotion({ from: selectedSquare, to: square });
            return;
          }

          // Execute normal move then schedule bot response
          const result = executeMove(selectedSquare, square);
          if (result) scheduleBotMove(chess);
          return;
        }
      }

      // If clicking own piece, select it and display legal moves
      if (piece && piece.color === chess.turn()) {
        setSelectedSquare(square);
        const moves = chess.moves({ square, verbose: true });
        setLegalMoves(moves);
      } else {
        setSelectedSquare(null);
        setLegalMoves([]);
      }
    },
    [chess, gameStatus, selectedSquare, legalMoves, botColor, executeMove, scheduleBotMove]
  );

  // Complete pawn promotion
  const confirmPromotion = useCallback(
    (promotionPiece) => {
      if (!pendingPromotion) return;
      const result = executeMove(pendingPromotion.from, pendingPromotion.to, promotionPiece);
      if (result) scheduleBotMove(chess);
    },
    [pendingPromotion, executeMove, scheduleBotMove, chess]
  );

  const cancelPromotion = useCallback(() => {
    setPendingPromotion(null);
    setSelectedSquare(null);
    setLegalMoves([]);
  }, []);

  // Resign match
  const resign = useCallback(
    (resigningColor) => {
      if (gameStatus !== 'in_progress') return;
      const winningColor = resigningColor === 'w' ? 'b' : 'w';
      setGameStatus('resigned');
      setWinner(winningColor);
      const msg = `${resigningColor === 'w' ? 'White' : 'Black'} resigned. ${
        winningColor === 'w' ? 'White' : 'Black'
      } wins!`;
      setStatusMessage(msg);
      if (onGameOver) onGameOver({ result: 'resigned', winner: winningColor, message: msg });
    },
    [gameStatus, onGameOver]
  );

  // Start new game
  const resetGame = useCallback(() => {
    if (botTimerRef.current) clearTimeout(botTimerRef.current);
    chess.reset();
    setSelectedSquare(null);
    setLegalMoves([]);
    setLastMove(null);
    setPendingPromotion(null);
    setGameStatus('in_progress');
    setWinner(null);
    updateGameState();
    // If bot plays white, trigger its opening move
    if (botColor === 'w') {
      scheduleBotMove(chess);
    }
  }, [chess, updateGameState, botColor, scheduleBotMove]);

  // Undo move (undoes bot move too so player always gets their turn back)
  const undoMove = useCallback(() => {
    if (gameStatus !== 'in_progress') return;
    if (botTimerRef.current) clearTimeout(botTimerRef.current);
    // If playing vs bot, undo two plies (bot + player) so it's the human's turn again
    const undoCount = botColor ? 2 : 1;
    let undone = false;
    for (let i = 0; i < undoCount; i++) {
      const u = chess.undo();
      if (u) undone = true;
    }
    if (undone) {
      const hist = chess.history({ verbose: true });
      const prevMove = hist.length > 0 ? hist[hist.length - 1] : null;
      setLastMove(prevMove ? { from: prevMove.from, to: prevMove.to } : null);
      setSelectedSquare(null);
      setLegalMoves([]);
      updateGameState();
    }
  }, [chess, gameStatus, botColor, updateGameState]);

  // Initial load + bot opening move if bot plays white
  useEffect(() => {
    updateGameState();
    if (botColor === 'w') scheduleBotMove(chess);
    return () => { if (botTimerRef.current) clearTimeout(botTimerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally only on mount

  return {
    chess,
    fen,
    board,
    turn,
    selectedSquare,
    legalMoves,
    lastMove,
    history,
    capturedPieces,
    pendingPromotion,
    gameStatus,
    winner,
    statusMessage,
    inCheck: chess.inCheck(),
    selectSquare,
    makeMove: executeMove,
    confirmPromotion,
    cancelPromotion,
    resign,
    resetGame,
    undoMove,
  };
};
