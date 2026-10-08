import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flag, RotateCcw, RefreshCw, FlipVertical, ChevronLeft,
  Cpu, Play as PlayIcon,
} from 'lucide-react';
import { useChessGame } from './useChessGame';
import { ChessBoard } from './ChessBoard';
import { MoveHistory } from './MoveHistory';
import { CapturedPieces } from './CapturedPieces';
import { PromotionModal } from './PromotionModal';
import { GameOverModal } from './GameOverModal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import './ChessGame.css';

// ── Bot Setup Screen ─────────────────────────────────────────────────────────
const DIFFICULTIES = [
  { id: 'easy',   label: 'Easy',   desc: 'Blunders often — great for beginners.', color: '#10b981' },
  { id: 'medium', label: 'Medium', desc: 'Plays solidly — a real challenge.',      color: '#f59e0b' },
  { id: 'hard',   label: 'Hard',   desc: 'Sharp tactics and deep calculation.',    color: '#ef4444' },
];

function BotSetupScreen({ onStart, onBack }) {
  const [difficulty, setDifficulty] = useState('medium');
  const [playerColor, setPlayerColor] = useState('w');

  return (
    <div className="bot-setup-container animate-fade-in">
      <div className="bot-setup-card">
        <div className="bot-setup-header">
          <button className="bot-back-btn" onClick={onBack}>
            <ChevronLeft size={18} />
          </button>
          <div className="bot-setup-title-block">
            <div className="bot-icon-wrap"><Cpu size={28} /></div>
            <div>
              <h2 className="bot-setup-title">Play vs Computer</h2>
              <p className="bot-setup-subtitle">Configure your AI opponent</p>
            </div>
          </div>
        </div>

        <div className="bot-setup-section">
          <label className="bot-section-label">Difficulty</label>
          <div className="bot-difficulty-grid">
            {DIFFICULTIES.map((d) => (
              <button
                key={d.id}
                className={"bot-diff-card " + (difficulty === d.id ? 'active' : '')}
                style={{ '--diff-color': d.color }}
                onClick={() => setDifficulty(d.id)}
              >
                <span className="bot-diff-dot" style={{ background: d.color }} />
                <span className="bot-diff-label">{d.label}</span>
                <span className="bot-diff-desc">{d.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bot-setup-section">
          <label className="bot-section-label">Play as</label>
          <div className="bot-color-row">
            {[
              { v: 'w', glyph: '\u2659', name: 'White' },
              { v: 'random', glyph: '\u2684', name: 'Random' },
              { v: 'b', glyph: '\u265F', name: 'Black' },
            ].map(({ v, glyph, name }) => (
              <button
                key={v}
                className={"bot-color-btn " + (playerColor === v ? 'active' : '')}
                onClick={() => setPlayerColor(v)}
              >
                <span className="piece-icon">{glyph}</span> {name}
              </button>
            ))}
          </div>
        </div>

        <button
          className="bot-start-btn"
          onClick={() => {
            const resolved =
              playerColor === 'random'
                ? Math.random() < 0.5 ? 'w' : 'b'
                : playerColor;
            onStart({ difficulty, playerColor: resolved });
          }}
        >
          <PlayIcon size={18} /> Start Game
        </button>
      </div>
    </div>
  );
}

// ── Active Game Board ─────────────────────────────────────────────────────────
function ActiveGame({ botColor, difficulty, isBotGame, onRestartSetup }) {
  const navigate = useNavigate();
  // Flip board so the player always sits at the bottom
  const [flipped, setFlipped] = useState(botColor === 'b');
  const [showGameOver, setShowGameOver] = useState(false);

  const onGameOver = useCallback(() => setShowGameOver(true), []);
  const game = useChessGame({ onGameOver, botColor, difficulty });

  const {
    board, turn, selectedSquare, legalMoves, lastMove,
    history, capturedPieces, pendingPromotion,
    gameStatus, winner, statusMessage, inCheck,
    selectSquare, confirmPromotion, cancelPromotion,
    resign, resetGame, undoMove,
  } = game;

  const isGameOver = gameStatus !== 'in_progress';
  const topColor    = flipped ? 'w' : 'b';
  const bottomColor = flipped ? 'b' : 'w';
  const isTopBot    = isBotGame && topColor    === botColor;
  const isBottomBot = isBotGame && bottomColor === botColor;

  const handleNewGame      = useCallback(() => { resetGame(); setShowGameOver(false); }, [resetGame]);
  const handleCloseGameOver = useCallback(() => setShowGameOver(false), []);
  const handleResign       = useCallback(() => resign(turn), [resign, turn]);

  const diffLabel = difficulty
    ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
    : null;

  return (
    <div className="chess-game-container animate-fade-in">
      {/* Top bar */}
      <div className="chess-game-top-bar">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ChevronLeft size={16} />}
          onClick={isBotGame ? onRestartSetup : () => navigate('/play')}
        >
          {isBotGame ? 'Change Difficulty' : 'Back to Lobby'}
        </Button>
        <div className="game-status-badge-row">
          {isBotGame && (
            <Badge variant="violet" size="sm">
              <Cpu size={11} style={{ marginRight: 4 }} />
              vs Bot &middot; {diffLabel}
            </Badge>
          )}
          <Badge
            variant={inCheck ? 'rose' : isGameOver ? 'amber' : 'emerald'}
            size="md"
          >
            {statusMessage}
          </Badge>
        </div>
      </div>

      <div className="chess-game-layout">
        {/* Board column */}
        <div className="chess-game-board-section">
          {/* Top player bar */}
          <div className="board-player-bar">
            <div className="player-info-block">
              <div className={"player-avatar " + (isTopBot ? 'bot-avatar' : 'opponent-avatar')}>
                {isTopBot ? <Cpu size={16} /> : (topColor === 'w' ? 'W' : 'B')}
              </div>
              <div className="player-details">
                <span className="player-label">
                  {isTopBot
                    ? `ChessCraft Bot (${diffLabel})`
                    : (topColor === 'w' ? 'White' : 'Black')}
                </span>
                <CapturedPieces capturedPieces={capturedPieces} color={topColor} />
              </div>
            </div>
            {!isGameOver && turn === topColor && (
              <div className={"turn-indicator-dot active" + (isTopBot ? ' bot-thinking' : '')} />
            )}
          </div>

          <ChessBoard
            board={board}
            turn={turn}
            selectedSquare={selectedSquare}
            legalMoves={legalMoves}
            lastMove={lastMove}
            inCheck={inCheck}
            flipped={flipped}
            onSquareClick={selectSquare}
          />

          {/* Bottom player bar */}
          <div className="board-player-bar">
            <div className="player-info-block">
              <div className={"player-avatar " + (isBottomBot ? 'bot-avatar' : 'self-avatar-game')}>
                {isBottomBot ? <Cpu size={16} /> : (bottomColor === 'w' ? 'W' : 'B')}
              </div>
              <div className="player-details">
                <span className="player-label">
                  {isBottomBot
                    ? `ChessCraft Bot (${diffLabel})`
                    : 'You'}
                </span>
                <CapturedPieces capturedPieces={capturedPieces} color={bottomColor} />
              </div>
            </div>
            {!isGameOver && turn === bottomColor && (
              <div className="turn-indicator-dot active" />
            )}
          </div>
        </div>

        {/* Right panel */}
        <div className="chess-game-side-panel">
          <div className="game-actions-card">
            <div className="actions-grid">
              <Button variant="secondary" size="sm" leftIcon={<FlipVertical size={14} />}
                onClick={() => setFlipped((f) => !f)} className="action-btn">
                Flip Board
              </Button>
              <Button variant="secondary" size="sm" leftIcon={<RotateCcw size={14} />}
                onClick={undoMove} disabled={isGameOver || history.length === 0} className="action-btn">
                Undo Move
              </Button>
              <Button variant="danger" size="sm" leftIcon={<Flag size={14} />}
                onClick={handleResign} disabled={isGameOver} className="action-btn">
                Resign
              </Button>
              <Button variant="primary" size="sm" leftIcon={<RefreshCw size={14} />}
                onClick={handleNewGame} className="action-btn">
                New Game
              </Button>
            </div>
          </div>
          <MoveHistory history={history} />
        </div>
      </div>

      {pendingPromotion && (
        <PromotionModal
          color={turn}
          onSelect={confirmPromotion}
          onCancel={cancelPromotion}
        />
      )}

      <GameOverModal
        isOpen={showGameOver && isGameOver}
        status={gameStatus}
        winner={winner}
        statusMessage={statusMessage}
        onNewGame={handleNewGame}
        onClose={handleCloseGameOver}
      />
    </div>
  );
}

// ── Public exports ────────────────────────────────────────────────────────────

/** Pass-and-play: two humans on same screen, no bot */
export const ChessGame = () => (
  <ActiveGame botColor={null} difficulty={null} isBotGame={false} onRestartSetup={null} />
);

/** Bot game with setup screen */
export const BotGame = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState(null);

  if (!config) {
    return (
      <BotSetupScreen
        onBack={() => navigate('/play')}
        onStart={(cfg) => setConfig(cfg)}
      />
    );
  }

  // botColor is opposite of the player's chosen color
  const botColor = config.playerColor === 'w' ? 'b' : 'w';

  return (
    <ActiveGame
      botColor={botColor}
      difficulty={config.difficulty}
      isBotGame
      onRestartSetup={() => setConfig(null)}
    />
  );
};
