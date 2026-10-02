import React from 'react';
import { Trophy, RefreshCw, Eye, Flag, ShieldAlert } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import './GameOverModal.css';

export const GameOverModal = ({
  isOpen,
  status, // 'checkmate' | 'stalemate' | 'draw' | 'resigned'
  winner, // 'w' | 'b' | 'draw'
  statusMessage,
  onNewGame,
  onClose,
}) => {
  if (!isOpen) return null;

  const isCheckmate = status === 'checkmate';
  const isResigned = status === 'resigned';
  const isDraw = status === 'stalemate' || status === 'draw';

  return (
    <div className="gameover-modal-backdrop animate-fade-in">
      <div className="gameover-modal-dialog">
        <div className="gameover-icon-wrapper">
          {isDraw ? (
            <div className="gameover-icon-bubble draw">
              <ShieldAlert size={36} />
            </div>
          ) : isResigned ? (
            <div className="gameover-icon-bubble resign">
              <Flag size={36} />
            </div>
          ) : (
            <div className="gameover-icon-bubble win">
              <Trophy size={36} />
            </div>
          )}
        </div>

        <h3 className="gameover-title">
          {isDraw
            ? 'Stalemate / Draw'
            : `${winner === 'w' ? 'White' : 'Black'} Wins!`}
        </h3>

        <div className="gameover-badge-box">
          <Badge
            variant={isDraw ? 'amber' : 'emerald'}
            size="md"
          >
            {statusMessage}
          </Badge>
        </div>

        <p className="gameover-desc">
          {isCheckmate
            ? 'King has no legal moves and is in check. A decisive checkmate!'
            : isResigned
            ? 'Opponent conceded the match.'
            : 'Neither side can deliver checkmate. Match concluded in a draw.'}
        </p>

        <div className="gameover-actions-list">
          <Button
            variant="primary"
            size="lg"
            leftIcon={<RefreshCw size={18} />}
            onClick={onNewGame}
            className="w-full"
          >
            Start New Game
          </Button>

          <Button
            variant="secondary"
            size="md"
            leftIcon={<Eye size={16} />}
            onClick={onClose}
            className="w-full"
          >
            Review Board Position
          </Button>
        </div>
      </div>
    </div>
  );
};
