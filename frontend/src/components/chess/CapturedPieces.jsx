import React from 'react';
import { ChessPiece } from './ChessPieces';
import './CapturedPieces.css';

const PIECE_VALUES = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

export const CapturedPieces = ({ capturedPieces, color }) => {
  // color is the player who OWNS the captured trophy pieces
  // (e.g. if White captured Black pieces, White owns Black captured pieces)
  const opponentColor = color === 'w' ? 'b' : 'w';
  const pieces = capturedPieces[opponentColor] || [];

  // Calculate material point differential
  const whitePoints = (capturedPieces.b || []).reduce(
    (sum, p) => sum + (PIECE_VALUES[p] || 0),
    0
  );
  const blackPoints = (capturedPieces.w || []).reduce(
    (sum, p) => sum + (PIECE_VALUES[p] || 0),
    0
  );

  const diff = color === 'w' ? whitePoints - blackPoints : blackPoints - whitePoints;

  // Order pieces by standard value: Q, R, B, N, P
  const sortOrder = { q: 1, r: 2, b: 3, n: 4, p: 5 };
  const sortedPieces = [...pieces].sort(
    (a, b) => (sortOrder[a] || 99) - (sortOrder[b] || 99)
  );

  return (
    <div className="captured-pieces-row">
      <div className="captured-icons-group">
        {sortedPieces.map((type, idx) => (
          <div key={`${type}-${idx}`} className="captured-mini-piece">
            <ChessPiece type={type} color={opponentColor} />
          </div>
        ))}
      </div>
      {diff > 0 && <span className="material-advantage-pill">+{diff}</span>}
    </div>
  );
};
