import { useState, useEffect, useRef, useCallback } from 'react';
import { Chess } from 'chess.js';
import {
  startConnection,
  invokeHub,
  onHub,
  onReconnected,
  onClose,
} from '../../services/signalrService';
import { soundService } from '../../services/soundService';

export const useMultiplayerGame = ({ initialGameId = null, initialInviteCode = null } = {}) => {
  // Persistent Chess instance reference
  const chessRef = useRef(null);
  if (!chessRef.current) {
    chessRef.current = new Chess();
  }

  // Connection & Room state
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // 'connecting' | 'connected' | 'disconnected'
  const [gameId, setGameId] = useState(initialGameId);
  const [inviteCode, setInviteCode] = useState(initialInviteCode || '');
  const [myColor, setMyColor] = useState(null); // 'w' | 'b'
  const [opponentUsername, setOpponentUsername] = useState('Opponent');
  const [opponentConnected, setOpponentConnected] = useState(true);
  const [timeControlSeconds, setTimeControlSeconds] = useState(600);
  const [whiteTime, setWhiteTime] = useState(600);
  const [blackTime, setBlackTime] = useState(600);

  // Game play state
  const [gameStatus, setGameStatus] = useState('idle'); // 'idle' | 'waiting' | 'in_progress' | 'completed'
  const [fen, setFen] = useState(() => chessRef.current.fen());
  const [board, setBoard] = useState(() => chessRef.current.board());
  const [turn, setTurn] = useState(() => chessRef.current.turn());
  const [inCheck, setInCheck] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [lastMove, setLastMove] = useState(null);
  const [history, setHistory] = useState([]);
  const [capturedPieces, setCapturedPieces] = useState({ w: [], b: [] });
  const [pendingPromotion, setPendingPromotion] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Game over state
  const [gameOver, setGameOver] = useState(null); // { result, reason, winnerUsername }
  const [showGameOverModal, setShowGameOverModal] = useState(false);

  // Refs to avoid stale closures in event handlers
  const gameIdRef = useRef(gameId);
  gameIdRef.current = gameId;

  const timerRef = useRef(null);

  // Derive captured pieces from chess.js verbose move history
  const calculateCaptured = useCallback(() => {
    const engine = chessRef.current;
    if (!engine) return { w: [], b: [] };
    const moves = engine.history({ verbose: true });
    const captured = { w: [], b: [] };
    moves.forEach((m) => {
      if (m.captured) {
        const victimColor = m.color === 'w' ? 'b' : 'w';
        captured[victimColor].push(m.captured);
      }
    });
    return captured;
  }, []);

  // Sync React state from chess engine
  const syncWithEngine = useCallback(() => {
    const engine = chessRef.current;
    if (!engine) return;
    setFen(engine.fen());
    setBoard(engine.board());
    setTurn(engine.turn());
    setInCheck(engine.inCheck());
    setHistory(engine.history({ verbose: true }));
    setCapturedPieces(calculateCaptured());
  }, [calculateCaptured]);

  // Clock countdown timer
  useEffect(() => {
    if (gameStatus === 'in_progress') {
      timerRef.current = setInterval(() => {
        const engine = chessRef.current;
        const currentTurn = engine ? engine.turn() : 'w';
        if (currentTurn === 'w') {
          setWhiteTime((t) => Math.max(0, t - 1));
        } else {
          setBlackTime((t) => Math.max(0, t - 1));
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameStatus]);

  // Replay move history into chess engine
  const loadMoveHistory = useCallback((moveHistory, fallbackFen) => {
    const engine = chessRef.current;
    if (!engine) return;

    if (moveHistory && Array.isArray(moveHistory) && moveHistory.length > 0) {
      engine.reset();
      for (const m of moveHistory) {
        try {
          engine.move({
            from: m.from,
            to: m.to,
            promotion: m.promotion || undefined,
          });
        } catch (_) {
          if (m.san) {
            try { engine.move(m.san); } catch (e) {}
          }
        }
      }
      const last = moveHistory[moveHistory.length - 1];
      if (last) {
        setLastMove({ from: last.from, to: last.to });
      }
    } else if (fallbackFen) {
      try {
        engine.load(fallbackFen);
      } catch (e) {
        engine.reset();
      }
    } else {
      engine.reset();
    }
  }, []);

  // Initialize SignalR and subscribe to hub events (ONCE on mount)
  useEffect(() => {
    const unsubs = [];

    const initConnection = async () => {
      setConnectionStatus('connecting');
      const conn = await startConnection();
      if (!conn) {
        setConnectionStatus('disconnected');
        setErrorMessage('Unable to connect to chess server. Please make sure you are logged in.');
        return;
      }

      setConnectionStatus('connected');

      // ── GameCreated Event ──
      unsubs.push(
        onHub('GameCreated', (data) => {
          setGameId(data.gameId);
          setInviteCode(data.inviteCode);
          setMyColor(data.playerColor);
          setTimeControlSeconds(data.timeControlSeconds || 600);
          setWhiteTime(data.timeControlSeconds || 600);
          setBlackTime(data.timeControlSeconds || 600);
          setGameStatus('waiting');
          if (chessRef.current) {
            chessRef.current.reset();
          }
          syncWithEngine();
        })
      );

      // ── GameJoined Event (Joiner receives this) ──
      unsubs.push(
        onHub('GameJoined', (data) => {
          setGameId(data.gameId);
          setMyColor(data.playerColor);
          setOpponentUsername(data.opponentUsername || 'Host');
          setTimeControlSeconds(data.timeControlSeconds || 600);
          setWhiteTime(data.timeControlSeconds || 600);
          setBlackTime(data.timeControlSeconds || 600);
          setGameStatus('in_progress');

          loadMoveHistory(data.moveHistory, data.fen);
          syncWithEngine();
        })
      );

      // ── OpponentJoined Event (Creator receives this) ──
      unsubs.push(
        onHub('OpponentJoined', (data) => {
          setOpponentUsername(data.opponentUsername || 'Challenger');
          setGameStatus('in_progress');
          if (chessRef.current && data.fen) {
            chessRef.current.load(data.fen);
          }
          syncWithEngine();
        })
      );

      // ── GameStarted Event (Broadcast to all room members when game begins) ──
      unsubs.push(
        onHub('GameStarted', (data) => {
          setGameStatus('in_progress');
          if (chessRef.current && data.fen) {
            chessRef.current.load(data.fen);
          }
          syncWithEngine();
        })
      );

      // ── MoveMade Event (Both players receive authoritative move) ──
      unsubs.push(
        onHub('MoveMade', (data) => {
          const engine = chessRef.current;
          if (engine) {
            try {
              const moveResult = engine.move({
                from: data.from,
                to: data.to,
                promotion: data.promotion || undefined,
              });

              if (!moveResult && data.fen) {
                engine.load(data.fen);
              }
            } catch (e) {
              if (data.fen) {
                engine.load(data.fen);
              }
            }
          }

          setLastMove({ from: data.from, to: data.to });
          setSelectedSquare(null);
          setLegalMoves([]);
          syncWithEngine();

          if (data.isCapture) {
            soundService.playCapture();
          } else if (data.isInCheck) {
            soundService.playCheck();
          } else {
            soundService.playMove();
          }
        })
      );

      // ── GameOver Event ──
      unsubs.push(
        onHub('GameOver', (data) => {
          setGameStatus('completed');
          setGameOver(data);
          setShowGameOverModal(true);
          soundService.playGameOver();
          if (data.fen) {
            try {
              chessRef.current.load(data.fen);
              syncWithEngine();
            } catch (_) {}
          }
        })
      );

      // ── Opponent Disconnect / Reconnect ──
      unsubs.push(
        onHub('PlayerDisconnected', () => {
          setOpponentConnected(false);
        })
      );

      unsubs.push(
        onHub('PlayerReconnected', () => {
          setOpponentConnected(true);
        })
      );

      // ── GameState Reconnection Sync ──
      unsubs.push(
        onHub('GameState', (state) => {
          setGameId(state.gameId);
          setInviteCode(state.inviteCode);
          setMyColor(state.playerColor);
          setOpponentConnected(state.opponentConnected);
          setTimeControlSeconds(state.timeControlSeconds || 600);

          if (state.playerColor === 'w') {
            setOpponentUsername(state.blackUsername || 'Black');
          } else {
            setOpponentUsername(state.whiteUsername || 'White');
          }

          loadMoveHistory(state.moveHistory, state.fen);

          if (state.status === 'InProgress') {
            setGameStatus('in_progress');
          } else if (state.status === 'Completed') {
            setGameStatus('completed');
            setGameOver({
              result: state.result,
              reason: state.terminationReason,
              winnerUsername: state.result === 'white_wins' ? state.whiteUsername : state.blackUsername,
            });
          } else if (state.status === 'WaitingForPlayer') {
            setGameStatus('waiting');
          }

          syncWithEngine();
        })
      );

      // ── Server Error Event ──
      unsubs.push(
        onHub('Error', (err) => {
          setErrorMessage(err.message || 'Server error occurred.');
          setTimeout(() => setErrorMessage(null), 6000);
        })
      );

      // If initialGameId was provided, request game state
      if (initialGameId) {
        invokeHub('GetGameState', initialGameId);
      }
    };

    initConnection();

    // Register lifecycle listeners
    const unsubReconnected = onReconnected(() => {
      setConnectionStatus('connected');
      if (gameIdRef.current) {
        invokeHub('GetGameState', gameIdRef.current);
      }
    });

    const unsubClose = onClose(() => {
      setConnectionStatus('disconnected');
    });

    return () => {
      unsubs.forEach((unsub) => unsub && unsub());
      if (unsubReconnected) unsubReconnected();
      if (unsubClose) unsubClose();
    };
  }, [initialGameId, loadMoveHistory, syncWithEngine]);

  // Create match with safety timeout and Error listener
  const createGame = useCallback(
    async ({ timeControlSeconds = 600, preferredColor = 'white' } = {}) => {
      setErrorMessage(null);
      await startConnection();

      // Convert preferredColor to backend enum: White = 0, Black = 1
      let colorEnum = 0;
      if (preferredColor === 'black') colorEnum = 1;
      else if (preferredColor === 'random') colorEnum = Math.random() > 0.5 ? 0 : 1;

      return new Promise(async (resolve) => {
        let isDone = false;
        let cleanupCreated = null;
        let cleanupError = null;
        let timer = null;

        const complete = (result) => {
          if (isDone) return;
          isDone = true;
          if (timer) clearTimeout(timer);
          if (cleanupCreated) cleanupCreated();
          if (cleanupError) cleanupError();
          resolve(result);
        };

        // 10s safety timeout to prevent infinite loading
        timer = setTimeout(() => {
          setErrorMessage('Match creation timed out. Please check your connection.');
          complete(null);
        }, 10000);

        cleanupCreated = onHub('GameCreated', (data) => {
          complete(data);
        });

        cleanupError = onHub('Error', (err) => {
          setErrorMessage(err.message || 'Failed to create game room.');
          complete(null);
        });

        const success = await invokeHub('CreateGame', {
          timeControlSeconds,
          preferredColor: colorEnum,
        });

        if (!success) {
          setErrorMessage('Failed to contact game server. Please verify your connection.');
          complete(null);
        }
      });
    },
    []
  );

  // Join match with safety timeout and Error listener
  const joinGame = useCallback(
    async (code) => {
      if (!code || !code.trim()) return null;
      setErrorMessage(null);
      await startConnection();

      return new Promise(async (resolve) => {
        let isDone = false;
        let cleanupJoined = null;
        let cleanupError = null;
        let timer = null;

        const complete = (result) => {
          if (isDone) return;
          isDone = true;
          if (timer) clearTimeout(timer);
          if (cleanupJoined) cleanupJoined();
          if (cleanupError) cleanupError();
          resolve(result);
        };

        timer = setTimeout(() => {
          setErrorMessage('Joining match timed out. Please try again.');
          complete(null);
        }, 10000);

        cleanupJoined = onHub('GameJoined', (data) => {
          complete(data);
        });

        cleanupError = onHub('Error', (err) => {
          setErrorMessage(err.message || 'Failed to join match room.');
          complete(null);
        });

        const success = await invokeHub('JoinGame', {
          inviteCode: code.trim().toUpperCase(),
        });

        if (!success) {
          setErrorMessage('Failed to send join request. Please verify the room code.');
          complete(null);
        }
      });
    },
    []
  );

  // User square selection & move logic with strict validation
  const selectSquare = useCallback(
    (square) => {
      if (gameStatus !== 'in_progress') return;
      const engine = chessRef.current;
      if (!engine) return;

      // STRICT VALIDATION: Only allow moves on user's turn
      const currentTurn = engine.turn();
      if (myColor !== currentTurn) {
        return;
      }

      // If deselecting
      if (selectedSquare === square) {
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }

      // If a piece is already selected, check if square is a legal destination
      if (selectedSquare) {
        const isLegal = legalMoves.some((m) => m.to === square);
        if (isLegal) {
          const piece = engine.get(selectedSquare);
          // Check for pawn promotion
          const isPromotion =
            piece &&
            piece.type === 'p' &&
            ((piece.color === 'w' && square[1] === '8') ||
              (piece.color === 'b' && square[1] === '1'));

          if (isPromotion) {
            setPendingPromotion({ from: selectedSquare, to: square });
            return;
          }

          // Execute authoritative move on server
          invokeHub('MakeMove', {
            gameId,
            from: selectedSquare,
            to: square,
            promotion: null,
          });

          setSelectedSquare(null);
          setLegalMoves([]);
          return;
        }
      }

      // Clicking own piece
      const piece = engine.get(square);
      if (piece && piece.color === myColor) {
        setSelectedSquare(square);
        const moves = engine.moves({ square, verbose: true });
        setLegalMoves(moves);
      } else {
        setSelectedSquare(null);
        setLegalMoves([]);
      }
    },
    [gameStatus, myColor, selectedSquare, legalMoves, gameId]
  );

  // Confirm pawn promotion
  const confirmPromotion = useCallback(
    (promoPiece) => {
      if (!pendingPromotion || !gameId) return;

      invokeHub('MakeMove', {
        gameId,
        from: pendingPromotion.from,
        to: pendingPromotion.to,
        promotion: promoPiece,
      });

      setPendingPromotion(null);
      setSelectedSquare(null);
      setLegalMoves([]);
    },
    [pendingPromotion, gameId]
  );

  const cancelPromotion = useCallback(() => {
    setPendingPromotion(null);
    setSelectedSquare(null);
    setLegalMoves([]);
  }, []);

  // Resign match
  const resign = useCallback(() => {
    if (!gameId || gameStatus !== 'in_progress') return;
    invokeHub('Resign', { gameId });
  }, [gameId, gameStatus]);

  // Reset / Leave room
  const leaveGame = useCallback(() => {
    setGameId(null);
    setInviteCode('');
    setGameStatus('idle');
    setGameOver(null);
    setShowGameOverModal(false);
    setSelectedSquare(null);
    setLegalMoves([]);
    setLastMove(null);
    if (chessRef.current) {
      chessRef.current.reset();
    }
    syncWithEngine();
  }, [syncWithEngine]);

  const isMyTurn = gameStatus === 'in_progress' && turn === myColor;

  return {
    chess: chessRef.current,
    fen,
    board,
    turn,
    myColor,
    isMyTurn,
    selectedSquare,
    legalMoves,
    lastMove,
    history,
    capturedPieces,
    pendingPromotion,
    gameId,
    inviteCode,
    gameStatus,
    opponentUsername,
    opponentConnected,
    whiteTime,
    blackTime,
    timeControlSeconds,
    connectionStatus,
    errorMessage,
    gameOver,
    showGameOverModal,
    inCheck,
    createGame,
    joinGame,
    selectSquare,
    confirmPromotion,
    cancelPromotion,
    resign,
    leaveGame,
    setShowGameOverModal,
  };
};
