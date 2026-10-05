import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Copy,
  Check,
  Flag,
  ArrowLeft,
  Share2,
  Clock,
  Wifi,
  WifiOff,
  Users,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { ChessBoard } from './ChessBoard';
import { MoveHistory } from './MoveHistory';
import { CapturedPieces } from './CapturedPieces';
import { PromotionModal } from './PromotionModal';
import { GameOverModal } from './GameOverModal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Alert } from '../ui/Alert';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import './MultiplayerGame.css';

import { copyToClipboard } from '../../utils/clipboard';

export const MultiplayerGame = ({ game, onLeave }) => {
  const navigate = useNavigate();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const {
    chess,
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
    connectionStatus,
    errorMessage,
    gameOver,
    showGameOverModal,
    inCheck,
    selectSquare,
    confirmPromotion,
    cancelPromotion,
    resign,
    leaveGame,
    setShowGameOverModal,
  } = game;

  // Board is flipped if user plays as Black
  const isFlipped = myColor === 'b';

  // Format seconds to mm:ss
  const formatTime = useCallback((totalSeconds) => {
    const mins = Math.floor((totalSeconds || 0) / 60);
    const secs = (totalSeconds || 0) % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const handleCopyCode = useCallback(async () => {
    if (inviteCode) {
      const ok = await copyToClipboard(inviteCode);
      if (ok) {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      }
    }
  }, [inviteCode]);

  const shareUrl = useMemo(() => {
    if (!inviteCode) return '';
    return `${window.location.origin}/join/${inviteCode}`;
  }, [inviteCode]);

  const handleCopyLink = useCallback(async () => {
    if (shareUrl) {
      const ok = await copyToClipboard(shareUrl);
      if (ok) {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
    }
  }, [shareUrl]);

  const handleResignClick = useCallback(() => {
    if (window.confirm('Are you sure you want to resign the game?')) {
      resign();
    }
  }, [resign]);

  const handleLeave = useCallback(() => {
    leaveGame();
    if (onLeave) onLeave();
    else navigate('/play');
  }, [leaveGame, onLeave, navigate]);

  // Determine active turn badge
  const turnBadgeText = useMemo(() => {
    if (gameStatus === 'completed') return 'Game Finished';
    if (isMyTurn) return 'Your Turn';
    return `${opponentUsername || 'Opponent'}'s Turn`;
  }, [gameStatus, isMyTurn, opponentUsername]);

  const turnBadgeVariant = useMemo(() => {
    if (gameStatus === 'completed') return 'amber';
    if (inCheck) return 'rose';
    if (isMyTurn) return 'emerald';
    return 'neutral';
  }, [gameStatus, inCheck, isMyTurn]);

  // White and Black time formatted
  const whiteClockText = useMemo(() => formatTime(whiteTime), [formatTime, whiteTime]);
  const blackClockText = useMemo(() => formatTime(blackTime), [formatTime, blackTime]);

  // Top player (Opponent if not flipped, or You if flipped)
  const topPlayerColor = isFlipped ? 'w' : 'b';
  const bottomPlayerColor = isFlipped ? 'b' : 'w';

  const topPlayerName = isFlipped ? 'You' : opponentUsername || 'Opponent';
  const bottomPlayerName = isFlipped ? opponentUsername || 'Opponent' : 'You';

  const topPlayerClock = isFlipped ? whiteClockText : blackClockText;
  const bottomPlayerClock = isFlipped ? blackClockText : whiteClockText;

  const isTopActive = turn === topPlayerColor && gameStatus === 'in_progress';
  const isBottomActive = turn === bottomPlayerColor && gameStatus === 'in_progress';

  // Game over status message calculation
  const gameOverDetails = useMemo(() => {
    if (!gameOver) return null;
    const reasonLower = (gameOver.reason || '').toLowerCase();
    const isCheckmate = reasonLower === 'checkmate';
    const isResignation = reasonLower === 'resignation' || reasonLower === 'resigned';
    const isDraw = reasonLower === 'stalemate' || reasonLower === 'draw' || reasonLower.includes('draw');

    const status = isCheckmate ? 'checkmate' : isResignation ? 'resigned' : 'draw';
    const winner =
      gameOver.result === 'white_wins'
        ? 'w'
        : gameOver.result === 'black_wins'
        ? 'b'
        : 'draw';

    let statusMessage = '';
    if (isCheckmate) {
      statusMessage = `Checkmate! ${gameOver.winnerUsername || (winner === 'w' ? 'White' : 'Black')} wins!`;
    } else if (isResignation) {
      statusMessage = `Game ended by resignation. ${gameOver.winnerUsername || (winner === 'w' ? 'White' : 'Black')} wins!`;
    } else {
      statusMessage = `Game drawn: ${gameOver.reason || 'Draw'}`;
    }

    return { status, winner, statusMessage };
  }, [gameOver]);

  // ── 1. WAITING ROOM VIEW (Creator waiting for challenger) ──
  // Note: All hooks execute above before this conditional return
  if (gameStatus === 'waiting') {
    return (
      <div className="mp-waiting-card animate-fade-in">
        <div className="mp-waiting-icon">
          <Loader2 size={36} />
        </div>
        <h2 className="mp-waiting-title">Waiting for Opponent</h2>
        <p className="mp-waiting-subtitle">
          Share your room code or invite link with a friend to begin real-time play.
        </p>

        <div className="mp-invite-box">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Room Invite Code
          </span>
          <div className="mp-invite-code-display">{inviteCode}</div>
          <Button
            variant={copiedCode ? 'primary' : 'secondary'}
            size="sm"
            leftIcon={copiedCode ? <Check size={14} /> : <Copy size={14} />}
            onClick={handleCopyCode}
          >
            {copiedCode ? 'Code Copied' : 'Copy Room Code'}
          </Button>

          <div className="mp-invite-link-row">
            <input readOnly value={shareUrl} className="mp-invite-input" />
            <Button
              variant={copiedLink ? 'primary' : 'secondary'}
              size="sm"
              leftIcon={copiedLink ? <Check size={14} /> : <Share2 size={14} />}
              onClick={handleCopyLink}
            >
              {copiedLink ? 'Copied' : 'Copy Link'}
            </Button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <Button variant="ghost" size="md" leftIcon={<ArrowLeft size={16} />} onClick={handleLeave}>
            Cancel and Return to Lobby
          </Button>
        </div>
      </div>
    );
  }

  // ── 2. ACTIVE MATCH PLAY VIEW ──
  return (
    <div className="mp-game-container animate-fade-in">
      {/* Disconnect Alert */}
      {!opponentConnected && (
        <div className="mp-disconnect-banner animate-fade-in">
          <WifiOff size={18} />
          <span>Opponent has disconnected. Waiting for them to reconnect...</span>
        </div>
      )}

      {errorMessage && (
        <Alert variant="error" onClose={() => {}}>
          {errorMessage}
        </Alert>
      )}

      {/* Top Header Bar */}
      <div className="mp-top-bar">
        <div className="mp-room-info">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={16} />} onClick={handleLeave}>
            Exit Match
          </Button>
          <div className="mp-code-pill">
            <span>ROOM:</span>
            <span>{inviteCode}</span>
          </div>
          <span className={`mp-status-pill ${opponentConnected ? 'online' : 'offline'}`}>
            <span className="pulse-dot" />
            {opponentConnected ? 'Opponent Online' : 'Opponent Offline'}
          </span>
        </div>

        <div className="mp-actions-row">
          <Badge variant={turnBadgeVariant} size="md">
            {turnBadgeText} {inCheck ? '(CHECK!)' : ''}
          </Badge>

          {gameStatus === 'in_progress' && (
            <Button
              variant="danger"
              size="sm"
              leftIcon={<Flag size={14} />}
              onClick={handleResignClick}
            >
              Resign
            </Button>
          )}
        </div>
      </div>

      {/* Main Chess Arena */}
      <div className="mp-game-layout">
        {/* Left: Chess Board Section */}
        <div className="mp-board-section">
          {/* Opponent Bar (Top) */}
          <div className={`mp-player-bar ${isTopActive ? 'active-turn' : ''}`}>
            <div className="mp-player-info">
              <div className={`mp-avatar ${topPlayerColor === 'w' ? 'white-player' : 'black-player'}`}>
                {topPlayerColor.toUpperCase()}
              </div>
              <div className="mp-player-meta">
                <span className="mp-player-name">{topPlayerName}</span>
                <span className="mp-player-tag">
                  {topPlayerColor === 'w' ? 'White' : 'Black'}
                </span>
              </div>
            </div>
            <CapturedPieces capturedPieces={capturedPieces} color={topPlayerColor} />
            <div className={`mp-clock ${isTopActive ? 'active' : ''}`}>
              {topPlayerClock}
            </div>
          </div>

          {/* Interactive Chess Board Component */}
          <ChessBoard
            board={board}
            turn={turn}
            selectedSquare={selectedSquare}
            legalMoves={legalMoves}
            lastMove={lastMove}
            flipped={isFlipped}
            onSquareClick={selectSquare}
          />

          {/* Player Bar (Bottom) */}
          <div className={`mp-player-bar ${isBottomActive ? 'active-turn' : ''}`}>
            <div className="mp-player-info">
              <div className={`mp-avatar ${bottomPlayerColor === 'w' ? 'white-player' : 'black-player'}`}>
                {bottomPlayerColor.toUpperCase()}
              </div>
              <div className="mp-player-meta">
                <span className="mp-player-name">{bottomPlayerName} (You)</span>
                <span className="mp-player-tag">
                  {bottomPlayerColor === 'w' ? 'White' : 'Black'}
                </span>
              </div>
            </div>
            <CapturedPieces capturedPieces={capturedPieces} color={bottomPlayerColor} />
            <div className={`mp-clock ${isBottomActive ? 'active' : ''}`}>
              {bottomPlayerClock}
            </div>
          </div>
        </div>

        {/* Right: Sidebar Controls and Notation */}
        <div className="mp-side-section">
          <MoveHistory history={history} />

          <Card>
            <CardHeader>
              <CardTitle>Match Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: 'var(--text-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>You Play As:</span>
                  <span style={{ fontWeight: 600 }}>{myColor === 'w' ? 'White' : 'Black'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Opponent:</span>
                  <span style={{ fontWeight: 600 }}>{opponentUsername || 'Opponent'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
                  <Badge variant={gameStatus === 'in_progress' ? 'emerald' : 'amber'} size="sm">
                    {gameStatus}
                  </Badge>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>SignalR:</span>
                  <span style={{ color: connectionStatus === 'connected' ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
                    {connectionStatus}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Pawn Promotion Dialog */}
      {pendingPromotion && (
        <PromotionModal
          color={myColor}
          onSelect={confirmPromotion}
          onCancel={cancelPromotion}
        />
      )}

      {/* Game Over Dialog */}
      {showGameOverModal && gameOver && gameOverDetails && (
        <GameOverModal
          isOpen={showGameOverModal}
          status={gameOverDetails.status}
          winner={gameOverDetails.winner}
          statusMessage={gameOverDetails.statusMessage}
          onNewGame={handleLeave}
          onClose={() => setShowGameOverModal(false)}
        />
      )}
    </div>
  );
};
