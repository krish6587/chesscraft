import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Chess } from 'chess.js';
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Play,
  Pause,
  X,
  Loader2,
  Trophy,
  Clock,
  Swords,
} from 'lucide-react';
import { gamesApi } from '../../api/games';
import { ChessBoard } from './ChessBoard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Alert } from '../ui/Alert';
import './GameReplayModal.css';

const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export const GameReplayModal = ({ gameId, onClose }) => {
  const [replayData, setReplayData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1); // -1 = start position
  const [isPlaying, setIsPlaying] = useState(false);

  const playTimerRef = useRef(null);
  const chessRef = useRef(new Chess());

  // Fetch full game replay data
  useEffect(() => {
    if (!gameId) return;

    let isMounted = true;
    const fetchReplay = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await gamesApi.getGameReplay(gameId);
        if (isMounted) {
          if (res?.data) {
            setReplayData(res.data);
            setCurrentMoveIndex(-1);
          } else {
            setError('Could not load replay for this match.');
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || 'Failed to load game replay.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchReplay();
    return () => {
      isMounted = false;
    };
  }, [gameId]);

  const moves = useMemo(() => replayData?.moves || [], [replayData]);

  // Derive active FEN and last move highlights
  const currentFen = useMemo(() => {
    if (currentMoveIndex === -1 || !moves.length) return START_FEN;
    const move = moves[currentMoveIndex];
    return move?.fenAfter || START_FEN;
  }, [currentMoveIndex, moves]);

  const currentLastMove = useMemo(() => {
    if (currentMoveIndex === -1 || !moves.length) return null;
    const move = moves[currentMoveIndex];
    if (!move) return null;
    return { from: move.fromSquare, to: move.toSquare };
  }, [currentMoveIndex, moves]);

  // Synchronize chess instance to get board matrix
  const boardMatrix = useMemo(() => {
    try {
      chessRef.current.load(currentFen);
      return chessRef.current.board();
    } catch (_) {
      chessRef.current.reset();
      return chessRef.current.board();
    }
  }, [currentFen]);

  const currentTurn = useMemo(() => {
    return currentFen.split(' ')[1] || 'w';
  }, [currentFen]);

  // Navigation handlers
  const handleFirstMove = () => setCurrentMoveIndex(-1);
  const handlePrevMove = () => setCurrentMoveIndex((idx) => Math.max(-1, idx - 1));
  const handleNextMove = () => setCurrentMoveIndex((idx) => Math.min(moves.length - 1, idx + 1));
  const handleLastMove = () => setCurrentMoveIndex(moves.length - 1);

  // Auto-play interval
  useEffect(() => {
    if (isPlaying) {
      playTimerRef.current = setInterval(() => {
        setCurrentMoveIndex((prev) => {
          if (prev >= moves.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1200);
    } else {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    }

    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying, moves.length]);

  // Group moves into pairs for notation table
  const movePairs = useMemo(() => {
    const pairs = [];
    for (let i = 0; i < moves.length; i += 2) {
      pairs.push({
        num: Math.floor(i / 2) + 1,
        white: moves[i],
        whiteIndex: i,
        black: moves[i + 1] || null,
        blackIndex: i + 1,
      });
    }
    return pairs;
  }, [moves]);

  return (
    <div className="replay-modal-overlay animate-fade-in" onClick={onClose}>
      <div className="replay-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="replay-modal-header">
          <div className="flex items-center gap-2">
            <Swords size={20} className="text-primary-400" />
            <span className="font-bold text-lg text-white">Interactive Game Replay</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 size={36} className="animate-spin text-primary-400" />
            <span className="text-sm text-slate-400">Loading full move history...</span>
          </div>
        ) : error ? (
          <div className="p-8">
            <Alert variant="danger">{error}</Alert>
          </div>
        ) : (
          <div className="replay-modal-body">
            {/* Left: Chessboard & Controls */}
            <div className="replay-board-section">
              <ChessBoard
                board={boardMatrix}
                turn={currentTurn}
                selectedSquare={null}
                legalMoves={[]}
                lastMove={currentLastMove}
                flipped={false}
                onSquareClick={() => {}}
              />

              {/* Controls */}
              <div className="replay-controls">
                <button
                  type="button"
                  className="replay-btn"
                  onClick={handleFirstMove}
                  disabled={currentMoveIndex === -1}
                  title="First Move"
                >
                  <ChevronsLeft size={18} />
                </button>
                <button
                  type="button"
                  className="replay-btn"
                  onClick={handlePrevMove}
                  disabled={currentMoveIndex === -1}
                  title="Previous Move"
                >
                  <ChevronLeft size={18} />
                </button>

                <button
                  type="button"
                  className="replay-btn"
                  onClick={() => setIsPlaying(!isPlaying)}
                  title={isPlaying ? 'Pause' : 'Auto Play'}
                >
                  {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                </button>

                <button
                  type="button"
                  className="replay-btn"
                  onClick={handleNextMove}
                  disabled={currentMoveIndex === moves.length - 1}
                  title="Next Move"
                >
                  <ChevronRight size={18} />
                </button>
                <button
                  type="button"
                  className="replay-btn"
                  onClick={handleLastMove}
                  disabled={currentMoveIndex === moves.length - 1}
                  title="Last Move"
                >
                  <ChevronsRight size={18} />
                </button>

                <div className="replay-counter-badge">
                  {currentMoveIndex === -1
                    ? 'Start'
                    : `${currentMoveIndex + 1} / ${moves.length}`}
                </div>
              </div>
            </div>

            {/* Right: Metadata & Move History List */}
            <div className="replay-sidebar">
              <div className="replay-match-meta">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">White:</span>
                  <span className="font-bold text-white">{replayData?.whitePlayerUsername}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Black:</span>
                  <span className="font-bold text-white">{replayData?.blackPlayerUsername}</span>
                </div>
                <div className="flex justify-between items-center text-xs mt-1">
                  <span className="text-slate-400">Result:</span>
                  <Badge variant="cyan" size="sm">
                    {replayData?.result === 1
                      ? 'White Won'
                      : replayData?.result === 2
                      ? 'Black Won'
                      : 'Draw'}
                  </Badge>
                </div>
              </div>

              {/* Move Table */}
              <div className="replay-moves-list">
                {movePairs.map((pair) => (
                  <div key={pair.num} className="replay-move-row">
                    <span className="text-slate-500">{pair.num}.</span>
                    <span
                      className={`replay-move-cell ${
                        currentMoveIndex === pair.whiteIndex ? 'active' : ''
                      }`}
                      onClick={() => setCurrentMoveIndex(pair.whiteIndex)}
                    >
                      {pair.white.san}
                    </span>
                    {pair.black ? (
                      <span
                        className={`replay-move-cell ${
                          currentMoveIndex === pair.blackIndex ? 'active' : ''
                        }`}
                        onClick={() => setCurrentMoveIndex(pair.blackIndex)}
                      >
                        {pair.black.san}
                      </span>
                    ) : (
                      <span />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
