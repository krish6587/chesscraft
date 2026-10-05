import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import {
  Swords,
  Clock,
  Copy,
  Check,
  Share2,
  Sparkles,
  Shield,
  Zap,
  Play as PlayIcon,
  ArrowRight,
  Info,
  Monitor,
  Loader2,
  Cpu,
  Brain,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Alert';
import { MultiplayerGame } from '../../components/chess/MultiplayerGame';
import { useMultiplayerGame } from '../../components/chess/useMultiplayerGame';
import { InviteFriendModal } from '../../components/chess/InviteFriendModal';
import { ChessPiece } from '../../components/chess/ChessPieces';
import './Play.css';

export const Play = () => {
  const navigate = useNavigate();
  const { gameId: paramGameId } = useParams();
  const [searchParams] = useSearchParams();
  const joinParam = searchParams.get('join');
  const gameIdParam = searchParams.get('gameId') || paramGameId;

  const [selectedTimeControl, setSelectedTimeControl] = useState('10 min');
  const [selectedColor, setSelectedColor] = useState('random');
  const [joinCodeInput, setJoinCodeInput] = useState(joinParam || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const game = useMultiplayerGame({
    initialGameId: gameIdParam || null,
    initialInviteCode: joinParam || null,
  });

  const timeControlSecondsMap = {
    '1 min': 60,
    '3 min': 180,
    '5 min': 300,
    '10 min': 600,
    '15 min': 900,
    '30 min': 1800,
  };

  const timeControls = [
    { name: '1 min', type: 'Bullet', icon: <Zap size={14} /> },
    { name: '3 min', type: 'Blitz', icon: <Zap size={14} /> },
    { name: '5 min', type: 'Blitz', icon: <Clock size={14} /> },
    { name: '10 min', type: 'Rapid', icon: <Clock size={14} /> },
    { name: '15 min', type: 'Rapid', icon: <Clock size={14} /> },
    { name: '30 min', type: 'Classical', icon: <Clock size={14} /> },
  ];

  // Board preview unicode pieces for the lobby
  const initialBoard = [
    ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
    ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
    ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖'],
  ];

  // Auto-fill from ?join= query param
  useEffect(() => {
    if (joinParam) {
      setJoinCodeInput(joinParam.toUpperCase());
    }
  }, [joinParam]);

  const handleCreateGame = async () => {
    setIsSubmitting(true);
    const seconds = timeControlSecondsMap[selectedTimeControl] || 600;
    await game.createGame({
      timeControlSeconds: seconds,
      preferredColor: selectedColor,
    });
    setIsSubmitting(false);
  };

  const handleCreateFromModal = async ({ timeControlSeconds, preferredColor }) => {
    setIsSubmitting(true);
    const res = await game.createGame({
      timeControlSeconds,
      preferredColor,
    });
    setIsSubmitting(false);
    return res;
  };

  const handleJoinGame = async (codeToJoin) => {
    const code = codeToJoin || joinCodeInput;
    if (!code || !code.trim()) return;
    setIsSubmitting(true);
    await game.joinGame(code.trim());
    setIsSubmitting(false);
  };

  // If match has been created or joined, render active Multiplayer match!
  if (game.gameStatus !== 'idle') {
    return <MultiplayerGame game={game} onLeave={game.leaveGame} />;
  }

  return (
    <div className="play-page-container animate-fade-in">
      {/* Notice Banner */}
      <Alert variant="info" className="play-phase-notice">
        <strong>Real-time Multiplayer Active:</strong> Powered by ASP.NET Core SignalR with authoritative server-side move validation, turn synchronization, and live reconnection!
      </Alert>

      {game.errorMessage && (
        <Alert variant="danger" className="mb-4">
          {game.errorMessage}
        </Alert>
      )}

      <div className="play-layout-grid">
        {/* Left: Chess Board Visual Preview */}
        <div className="play-board-panel">
          <div className="board-top-status">
            <div className="board-player-card opponent">
              <div className="board-avatar">?</div>
              <div className="board-player-meta">
                <span className="player-name">Online Challenger</span>
                <span className="player-rating">Real-Time SignalR</span>
              </div>
              <div className="board-clock">10:00</div>
            </div>
          </div>

          {/* 8x8 Board Container with authentic vector pieces */}
          <div className="chess-board-frame">
            <div className="chess-board-grid">
              {initialBoard.map((row, rIdx) =>
                row.map((pieceGlyph, cIdx) => {
                  const isLight = (rIdx + cIdx) % 2 === 0;
                  const isHighlighted = (rIdx === 6 && cIdx === 4) || (rIdx === 4 && cIdx === 4);
                  
                  // Map initial piece layout
                  let pieceObj = null;
                  if (rIdx === 0) {
                    const types = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
                    pieceObj = { type: types[cIdx], color: 'b' };
                  } else if (rIdx === 1) {
                    pieceObj = { type: 'p', color: 'b' };
                  } else if (rIdx === 6) {
                    pieceObj = { type: 'p', color: 'w' };
                  } else if (rIdx === 7) {
                    const types = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
                    pieceObj = { type: types[cIdx], color: 'w' };
                  }

                  return (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      className={`chess-square ${isLight ? 'light-square' : 'dark-square'} ${
                        isHighlighted ? 'highlighted-square' : ''
                      }`}
                    >
                      {cIdx === 0 && <span className="coord-rank">{8 - rIdx}</span>}
                      {rIdx === 7 && (
                        <span className="coord-file">{String.fromCharCode(97 + cIdx)}</span>
                      )}
                      {pieceObj && (
                        <div className="chess-piece-wrapper">
                          <ChessPiece type={pieceObj.type} color={pieceObj.color} />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="board-bottom-status">
            <div className="board-player-card self">
              <div className="board-avatar self-avatar">YOU</div>
              <div className="board-player-meta">
                <span className="player-name">Ready to play</span>
                <span className="player-rating">Rating: Active</span>
              </div>
              <div className="board-clock active-clock">10:00</div>
            </div>
          </div>
        </div>

        {/* Right: Game Lobby Controls */}
        <div className="play-controls-panel">
          {/* Create Match Card */}
          <Card className="play-lobby-card">
            <CardHeader>
              <div className="card-header-badge-row">
                <CardTitle>Create Online Game</CardTitle>
                <Badge variant="emerald">SignalR PvP</Badge>
              </div>
              <p className="card-desc-custom">
                Configure your match settings and receive a shareable invite code for a friend.
              </p>
            </CardHeader>

            <CardContent>
              {/* Time Control Options */}
              <div className="control-group">
                <label className="control-label">
                  <Clock size={16} /> Time Control
                </label>
                <div className="time-control-chips">
                  {timeControls.map((tc) => (
                    <button
                      key={tc.name}
                      type="button"
                      className={`tc-chip ${selectedTimeControl === tc.name ? 'active' : ''}`}
                      onClick={() => setSelectedTimeControl(tc.name)}
                    >
                      <span className="tc-name">{tc.name}</span>
                      <span className="tc-type">{tc.type}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div className="control-group">
                <label className="control-label">Your Preferred Color</label>
                <div className="color-selection-row">
                  <button
                    type="button"
                    className={`color-choice-btn ${selectedColor === 'white' ? 'active' : ''}`}
                    onClick={() => setSelectedColor('white')}
                  >
                    <span className="color-icon white-circle" /> White
                  </button>
                  <button
                    type="button"
                    className={`color-choice-btn ${selectedColor === 'random' ? 'active' : ''}`}
                    onClick={() => setSelectedColor('random')}
                  >
                    <span className="color-icon split-circle" /> Random
                  </button>
                  <button
                    type="button"
                    className={`color-choice-btn ${selectedColor === 'black' ? 'active' : ''}`}
                    onClick={() => setSelectedColor('black')}
                  >
                    <span className="color-icon black-circle" /> Black
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <Button
                  variant="primary"
                  size="lg"
                  leftIcon={isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <PlayIcon size={18} />}
                  onClick={handleCreateGame}
                  disabled={isSubmitting}
                  style={{ flex: 1 }}
                >
                  {isSubmitting ? 'Creating...' : 'Create Match'}
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  leftIcon={<Share2 size={18} />}
                  onClick={() => setIsInviteModalOpen(true)}
                  disabled={isSubmitting}
                  style={{ flex: 1 }}
                >
                  Invite Friend
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Join Match Card */}
          <Card className="play-lobby-card mt-4">
            <CardHeader>
              <CardTitle>Join via Invite Code</CardTitle>
              <p className="card-desc-custom">
                Received a match code or invite link from an opponent? Enter it below.
              </p>
            </CardHeader>
            <CardContent>
              <div className="join-form-row">
                <Input
                  placeholder="e.g. CHESS-A94F12"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                />
                <Button
                  variant="secondary"
                  size="md"
                  rightIcon={isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                  disabled={!joinCodeInput.trim() || isSubmitting}
                  onClick={() => handleJoinGame(joinCodeInput)}
                >
                  Join
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Local Play Card */}
          <Card className="play-lobby-card mt-4">
            <CardHeader>
              <div className="card-header-badge-row">
                <CardTitle>Pass & Play Locally</CardTitle>
                <Badge variant="cyan">Same Screen</Badge>
              </div>
              <p className="card-desc-custom">
                Play on this device without network connection — two players take turns on the same screen.
              </p>
            </CardHeader>
            <CardContent>
              <Button
                variant="secondary"
                size="lg"
                leftIcon={<Monitor size={18} />}
                onClick={() => navigate('/play/local')}
                className="w-full"
              >
                Start Local Game
              </Button>
            </CardContent>
          </Card>

          {/* Play vs Bot Card */}
          <Card className="play-lobby-card mt-4">
            <CardHeader>
              <div className="card-header-badge-row">
                <CardTitle>Play vs Computer</CardTitle>
                <Badge variant="violet">AI Bot</Badge>
              </div>
              <p className="card-desc-custom">
                Challenge our built-in AI engine — choose Easy, Medium, or Hard
                difficulty and pick your color.
              </p>
            </CardHeader>
            <CardContent>
              <div className="bot-difficulty-preview">
                <span className="bot-prev-chip" style={{ '--chip-color': '#10b981' }}>
                  <Shield size={13} /> Easy
                </span>
                <span className="bot-prev-chip" style={{ '--chip-color': '#f59e0b' }}>
                  <Zap size={13} /> Medium
                </span>
                <span className="bot-prev-chip" style={{ '--chip-color': '#ef4444' }}>
                  <Brain size={13} /> Hard
                </span>
              </div>
              <Button
                variant="primary"
                size="lg"
                leftIcon={<Cpu size={18} />}
                onClick={() => navigate('/play/bot')}
                className="w-full"
                style={{ marginTop: '12px' }}
              >
                Play vs Bot
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Invite Friend Modal */}
      <InviteFriendModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onCreateGame={handleCreateFromModal}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
