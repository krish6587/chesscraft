import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Chess } from 'chess.js';
import {
  Puzzle as PuzzleIcon,
  Lightbulb,
  CheckCircle,
  XCircle,
  RotateCcw,
  ChevronRight,
  Flame,
  Award,
  Zap,
  Loader2,
  Sparkles,
  HelpCircle,
  History,
  Eye,
  ArrowRight,
} from 'lucide-react';
import { puzzlesApi } from '../../api/puzzles';
import { useAuth } from '../../context/AuthContext';
import { ChessBoard } from '../../components/chess/ChessBoard';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { EmptyState } from '../../components/ui/EmptyState';
import { soundService } from '../../services/soundService';
import './Puzzles.css';

export const Puzzles = () => {
  const { isAuthenticated } = useAuth();
  const [difficultyFilter, setDifficultyFilter] = useState(null); // null = All, 1 = Easy, 2 = Medium, 3 = Hard
  const [puzzlesList, setPuzzlesList] = useState([]);
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Timer refs to prevent memory leaks and cross-puzzle race conditions
  const opponentTimeoutRef = useRef(null);
  const solutionIntervalRef = useRef(null);

  const clearTimers = useCallback(() => {
    if (opponentTimeoutRef.current) {
      clearTimeout(opponentTimeoutRef.current);
      opponentTimeoutRef.current = null;
    }
    if (solutionIntervalRef.current) {
      clearInterval(solutionIntervalRef.current);
      solutionIntervalRef.current = null;
    }
  }, []);

  // Puzzle State with localStorage persistence
  const [puzzleState, setPuzzleState] = useState('active'); // 'active' | 'solved' | 'failed'
  const [showHint, setShowHint] = useState(false);
  const [streak, setStreak] = useState(() => Number(localStorage.getItem('chesscraft_puzzle_streak')) || 0);
  const [solvedCount, setSolvedCount] = useState(() => Number(localStorage.getItem('chesscraft_puzzle_solved')) || 0);
  const [userRating, setUserRating] = useState(() => Number(localStorage.getItem('chesscraft_puzzle_rating')) || 1500);
  const [puzzleHistory, setPuzzleHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('puzzle'); // 'puzzle' | 'history'

  // Persist rating & streak changes
  const updateStreak = useCallback((fn) => {
    setStreak((prev) => {
      const val = typeof fn === 'function' ? fn(prev) : fn;
      localStorage.setItem('chesscraft_puzzle_streak', String(val));
      return val;
    });
  }, []);

  const updateSolvedCount = useCallback((fn) => {
    setSolvedCount((prev) => {
      const val = typeof fn === 'function' ? fn(prev) : fn;
      localStorage.setItem('chesscraft_puzzle_solved', String(val));
      return val;
    });
  }, []);

  const updateUserRating = useCallback((fn) => {
    setUserRating((prev) => {
      const val = typeof fn === 'function' ? fn(prev) : fn;
      localStorage.setItem('chesscraft_puzzle_rating', String(val));
      return val;
    });
  }, []);

  // Clean up timers on unmount
  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  // Chessboard state
  const chessRef = useRef(new Chess());
  const [boardMatrix, setBoardMatrix] = useState(() => chessRef.current.board());
  const [turn, setTurn] = useState(() => chessRef.current.turn());
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [lastMove, setLastMove] = useState(null);
  const [solutionStep, setSolutionStep] = useState(0);

  // Fetch puzzles list
  useEffect(() => {
    let isMounted = true;
    const fetchPuzzles = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await puzzlesApi.getPuzzles(difficultyFilter);
        if (isMounted) {
          if (res?.data && res.data.length > 0) {
            setPuzzlesList(res.data);
            setCurrentPuzzleIndex(0);
          } else {
            setPuzzlesList([]);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || 'Failed to load puzzles.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPuzzles();
    return () => {
      isMounted = false;
    };
  }, [difficultyFilter]);

  // Fetch attempt history (for authenticated players)
  const loadHistory = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await puzzlesApi.getUserPuzzleHistory();
      if (res?.data) {
        setPuzzleHistory(res.data);
      }
    } catch (_) {}
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadHistory();
    }
  }, [loadHistory, isAuthenticated]);

  const currentPuzzle = useMemo(() => {
    return puzzlesList[currentPuzzleIndex] || null;
  }, [puzzlesList, currentPuzzleIndex]);

  // Solution moves array parsed from space-separated UCI strings e.g. "b1b8" or "e2e4 e7e5"
  const solutionMoves = useMemo(() => {
    if (!currentPuzzle?.solutionMoves) return [];
    return currentPuzzle.solutionMoves.trim().split(/\s+/);
  }, [currentPuzzle]);

  // Determine puzzle turn & orientation
  const puzzlePlayerColor = useMemo(() => {
    if (!currentPuzzle?.initialFen) return 'w';
    return currentPuzzle.initialFen.split(' ')[1] || 'w';
  }, [currentPuzzle]);

  const isFlipped = puzzlePlayerColor === 'b';

  // Setup chess engine whenever puzzle changes
  const resetPuzzlePosition = useCallback(() => {
    if (!currentPuzzle?.initialFen) return;

    try {
      chessRef.current.load(currentPuzzle.initialFen);
    } catch (_) {
      chessRef.current.reset();
    }

    setBoardMatrix(chessRef.current.board());
    setTurn(chessRef.current.turn());
    setSelectedSquare(null);
    setLegalMoves([]);
    setLastMove(null);
    setSolutionStep(0);
    setPuzzleState('active');
    setShowHint(false);
  }, [currentPuzzle]);

  useEffect(() => {
    resetPuzzlePosition();
  }, [resetPuzzlePosition]);

  // Handle user piece selection and move execution
  const handleSquareClick = useCallback(
    (square) => {
      if (puzzleState !== 'active') return;

      const engine = chessRef.current;
      const currentTurn = engine.turn();

      // STRICT CHECK: Only allow moving the puzzle player's color
      if (currentTurn !== puzzlePlayerColor) return;

      // Deselecting
      if (selectedSquare === square) {
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }

      // Move execution
      if (selectedSquare) {
        const isLegal = legalMoves.some((m) => m.to === square);
        if (isLegal) {
          // Construct UCI move string
          const movingPiece = engine.get(selectedSquare);
          let promotion = undefined;
          if (
            movingPiece?.type === 'p' &&
            ((movingPiece.color === 'w' && square[1] === '8') ||
              (movingPiece.color === 'b' && square[1] === '1'))
          ) {
            promotion = 'q';
          }

          const userUciMove = `${selectedSquare}${square}${promotion || ''}`.toLowerCase();
          const expectedUciMove = solutionMoves[solutionStep]?.toLowerCase();

          // Check if move matches solution
          if (userUciMove === expectedUciMove) {
            // Correct move!
            soundService.playMove();
            engine.move({ from: selectedSquare, to: square, promotion });
            setBoardMatrix(engine.board());
            setTurn(engine.turn());
            setLastMove({ from: selectedSquare, to: square });
            setSelectedSquare(null);
            setLegalMoves([]);

            const nextStep = solutionStep + 1;
            setSolutionStep(nextStep);

            if (nextStep >= solutionMoves.length) {
              // Puzzle Complete!
              soundService.playGameOver();
              setPuzzleState('solved');
              updateStreak((s) => s + 1);
              updateSolvedCount((c) => c + 1);
              updateUserRating((r) => r + 15);

              // Record attempt to backend if logged in
              if (isAuthenticated) {
                puzzlesApi.recordAttempt(currentPuzzle.id, true).then(() => {
                  loadHistory();
                }).catch(() => {});
              }
            } else {
              // Auto-play the opponent's response after brief delay
              const opponentMoveUci = solutionMoves[nextStep];
              if (opponentMoveUci) {
                clearTimers();
                opponentTimeoutRef.current = setTimeout(() => {
                  const from = opponentMoveUci.substring(0, 2);
                  const to = opponentMoveUci.substring(2, 4);
                  const promo = opponentMoveUci.length > 4 ? opponentMoveUci[4] : undefined;
                  try {
                    soundService.playMove();
                    engine.move({ from, to, promotion: promo });
                    setBoardMatrix(engine.board());
                    setTurn(engine.turn());
                    setLastMove({ from, to });
                    setSolutionStep(nextStep + 1);
                  } catch (_) {}
                }, 400);
              }
            }
          } else {
            // Incorrect move
            soundService.playCapture();
            setPuzzleState('failed');
            updateStreak(0);
            updateUserRating((r) => Math.max(1000, r - 10));

            // Record attempt to backend if logged in
            if (isAuthenticated) {
              puzzlesApi.recordAttempt(currentPuzzle.id, false).then(() => {
                loadHistory();
              }).catch(() => {});
            }
          }
          return;
        }
      }

      // Selecting own piece
      const piece = engine.get(square);
      if (piece && piece.color === puzzlePlayerColor) {
        setSelectedSquare(square);
        const moves = engine.moves({ square, verbose: true });
        setLegalMoves(moves);
      } else {
        setSelectedSquare(null);
        setLegalMoves([]);
      }
    },
    [puzzleState, puzzlePlayerColor, selectedSquare, legalMoves, solutionMoves, solutionStep, currentPuzzle, loadHistory, clearTimers, updateStreak, updateSolvedCount, updateUserRating, isAuthenticated]
  );

  const handleNextPuzzle = () => {
    clearTimers();
    if (currentPuzzleIndex < puzzlesList.length - 1) {
      setCurrentPuzzleIndex((idx) => idx + 1);
    } else {
      setCurrentPuzzleIndex(0);
    }
  };

  const handleShowSolution = () => {
    clearTimers();
    resetPuzzlePosition();
    // Play full solution sequentially
    let step = 0;
    const engine = chessRef.current;

    solutionIntervalRef.current = setInterval(() => {
      if (step >= solutionMoves.length) {
        clearTimers();
        setPuzzleState('failed');
        return;
      }

      const uci = solutionMoves[step];
      const from = uci.substring(0, 2);
      const to = uci.substring(2, 4);
      const promo = uci.length > 4 ? uci[4] : undefined;

      try {
        soundService.playMove();
        engine.move({ from, to, promotion: promo });
        setBoardMatrix(engine.board());
        setTurn(engine.turn());
        setLastMove({ from, to });
      } catch (_) {}

      step++;
    }, 800);
  };

  const getDifficultyLabel = (diff) => {
    switch (diff) {
      case 1:
      case 'Easy':
        return 'Easy';
      case 2:
      case 'Medium':
        return 'Medium';
      case 3:
      case 'Hard':
        return 'Hard';
      default:
        return 'Tactical';
    }
  };

  return (
    <div className="puzzles-page-container animate-fade-in">
      {/* Top Tactical Stats Banner */}
      <div className="puzzles-stats-banner">
        <div className="stat-box">
          <span className="stat-label">TACTICAL RATING</span>
          <span className="stat-number text-gradient-emerald">{userRating}</span>
          <span className="stat-trend">{solvedCount} puzzles solved</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">CURRENT STREAK</span>
          <div className="stat-streak-val">
            <Flame size={20} className="flame-gold" />
            <span>{streak} in a row</span>
          </div>
          <span className="stat-trend">{streak > 5 ? 'On Fire! 🔥' : 'Keep it up!'}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">PUZZLES ARCHIVE</span>
          <div className="stat-streak-val">
            <Award size={20} className="award-purple" />
            <span>{puzzlesList.length} Puzzles</span>
          </div>
          <span className="stat-trend">Tactical Trainer</span>
        </div>
      </div>

      {/* Difficulty Tabs & Navigation */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div className="history-filter-chips">
          <button
            type="button"
            className={`filter-chip ${difficultyFilter === null ? 'active' : ''}`}
            onClick={() => setDifficultyFilter(null)}
          >
            All Difficulties
          </button>
          <button
            type="button"
            className={`filter-chip ${difficultyFilter === 1 ? 'active' : ''}`}
            onClick={() => setDifficultyFilter(1)}
          >
            Easy (1100-1300)
          </button>
          <button
            type="button"
            className={`filter-chip ${difficultyFilter === 2 ? 'active' : ''}`}
            onClick={() => setDifficultyFilter(2)}
          >
            Medium (1400-1650)
          </button>
          <button
            type="button"
            className={`filter-chip ${difficultyFilter === 3 ? 'active' : ''}`}
            onClick={() => setDifficultyFilter(3)}
          >
            Hard (1700+)
          </button>
        </div>

        <div className="flex gap-2">
          <Button
            variant={activeTab === 'puzzle' ? 'primary' : 'secondary'}
            size="sm"
            leftIcon={<PuzzleIcon size={14} />}
            onClick={() => setActiveTab('puzzle')}
          >
            Trainer
          </Button>
          <Button
            variant={activeTab === 'history' ? 'primary' : 'secondary'}
            size="sm"
            leftIcon={<History size={14} />}
            onClick={() => setActiveTab('history')}
          >
            My Attempts ({puzzleHistory.length})
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 size={36} className="animate-spin text-primary-400" />
          <span className="text-sm text-slate-400">Loading tactical chess puzzles...</span>
        </div>
      ) : activeTab === 'history' ? (
        /* Puzzle Attempt History Table */
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>Your Tactical Solve History</CardTitle>
          </CardHeader>
          <CardContent>
            {puzzleHistory.length === 0 ? (
              <EmptyState
                icon={<History size={48} className="text-primary-400" />}
                title="No Puzzle Attempts Yet"
                description="Solve tactical puzzles in the Trainer tab to track your history and accuracy."
              />
            ) : (
              <div className="flex flex-col gap-2">
                {puzzleHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-3 bg-slate-900 border border-slate-800 rounded-lg text-sm"
                  >
                    <div className="flex items-center gap-3">
                      {item.solved ? (
                        <CheckCircle size={18} className="text-emerald-400" />
                      ) : (
                        <XCircle size={18} className="text-rose-400" />
                      )}
                      <div>
                        <span className="font-semibold text-white block">{item.description}</span>
                        <span className="text-xs text-slate-400">
                          {new Date(item.attemptedAtUtc).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="cyan">Rating: {item.rating}</Badge>
                      <Badge variant={item.solved ? 'emerald' : 'rose'}>
                        {item.solved ? 'Solved' : 'Failed'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : !currentPuzzle ? (
        <EmptyState
          icon={<PuzzleIcon size={48} className="text-primary-400" />}
          title="No Puzzles Found"
          description="No puzzles matched the selected difficulty filter."
        />
      ) : (
        /* Main Puzzle Arena */
        <div className="puzzle-content-grid animate-fade-in">
          {/* Left: Puzzle Chess Board */}
          <div className="puzzle-board-card">
            <div className="puzzle-board-header">
              <div className="puzzle-id-badge">
                <span className="puzzle-code">#{currentPuzzleIndex + 1}</span>
                <Badge variant="emerald">Rating: {currentPuzzle.rating}</Badge>
                <Badge variant="cyan">{getDifficultyLabel(currentPuzzle.difficulty)}</Badge>
              </div>
              <span className="puzzle-to-move font-semibold">
                {puzzlePlayerColor === 'w' ? '⚪ White to move and win' : '⚫ Black to move and win'}
              </span>
            </div>

            {/* Interactive Chess Board Component */}
            <ChessBoard
              board={boardMatrix}
              turn={turn}
              selectedSquare={selectedSquare}
              legalMoves={legalMoves}
              lastMove={lastMove}
              flipped={isFlipped}
              onSquareClick={handleSquareClick}
            />

            {/* Status Feedback Banner */}
            {puzzleState === 'solved' && (
              <Alert variant="success" className="w-full text-center">
                <div className="flex items-center justify-center gap-2 font-bold text-base">
                  <Sparkles size={20} />
                  <span>Brilliant! Puzzle solved successfully (+15 Rating).</span>
                </div>
              </Alert>
            )}

            {puzzleState === 'failed' && (
              <Alert variant="danger" className="w-full text-center">
                <div className="flex items-center justify-center gap-2 font-semibold">
                  <XCircle size={18} />
                  <span>Incorrect move. Try again or view the solution.</span>
                </div>
              </Alert>
            )}
          </div>

          {/* Right: Puzzle Sidebar & Controls */}
          <div className="puzzle-sidebar-card">
            <Card className="h-full">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Tactical Challenge</CardTitle>
                  <span className="text-xs text-slate-400">
                    Puzzle {currentPuzzleIndex + 1} of {puzzlesList.length}
                  </span>
                </div>
              </CardHeader>

              <CardContent>
                <div className="flex flex-col gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{currentPuzzle.description}</h3>
                    <div className="flex gap-1 flex-wrap mt-2">
                      {currentPuzzle.themes &&
                        currentPuzzle.themes.split(',').map((theme, i) => (
                          <span
                            key={i}
                            className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700"
                          >
                            #{theme.trim()}
                          </span>
                        ))}
                    </div>
                  </div>

                  {showHint && (
                    <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-lg text-amber-200 text-xs animate-fade-in flex items-start gap-2">
                      <Lightbulb size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="block mb-0.5">Hint:</strong>
                        <span>
                          Focus on key tactical motifs: {currentPuzzle.themes || 'Look for tactical sacrifices and checks'}.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col gap-2 mt-4">
                    {puzzleState === 'solved' ? (
                      <Button
                        variant="primary"
                        size="lg"
                        rightIcon={<ChevronRight size={18} />}
                        onClick={handleNextPuzzle}
                        className="w-full"
                      >
                        Next Puzzle
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="secondary"
                          size="md"
                          leftIcon={<RotateCcw size={16} />}
                          onClick={resetPuzzlePosition}
                          className="w-full"
                        >
                          Retry Position
                        </Button>

                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Lightbulb size={16} />}
                            onClick={() => setShowHint(!showHint)}
                            style={{ flex: 1 }}
                          >
                            {showHint ? 'Hide Hint' : 'Show Hint'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Eye size={16} />}
                            onClick={handleShowSolution}
                            style={{ flex: 1 }}
                          >
                            Solution
                          </Button>
                        </div>
                      </>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      rightIcon={<ArrowRight size={14} />}
                      onClick={handleNextPuzzle}
                      className="mt-2 text-slate-400 hover:text-white"
                    >
                      Skip Puzzle
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
