import React from 'react';
import { ChessPiece } from './ChessPieces';
import './ChessSquare.css';

export const ChessSquare = ({
  square,
  piece,
  isLight,
  isSelected,
  isLegalMove,
  isLastMove,
  isInCheck,
  showRankLabel,
  showFileLabel,
  rankLabel,
  fileLabel,
  onClick,
}) => {
  const hasEnemyPiece = Boolean(piece && isLegalMove);

  return (
    <div
      className={`chess-square-cell ${isLight ? 'cell-light' : 'cell-dark'} ${
        isSelected ? 'cell-selected' : ''
      } ${isLastMove ? 'cell-last-move' : ''} ${isInCheck ? 'cell-in-check' : ''}`}
      onClick={onClick}
      data-square={square}
    >
      {/* Coordinate Labels */}
      {showRankLabel && <span className="cell-coord-rank">{rankLabel}</span>}
      {showFileLabel && <span className="cell-coord-file">{fileLabel}</span>}

      {/* Piece SVG */}
      {piece && (
        <div className="chess-piece-wrapper">
          <ChessPiece type={piece.type} color={piece.color} />
        </div>
      )}

      {/* Legal Move Indicators */}
      {isLegalMove && !hasEnemyPiece && (
        <div className="legal-move-marker-dot" />
      )}

      {isLegalMove && hasEnemyPiece && (
        <div className="legal-move-capture-ring" />
      )}
    </div>
  );
};
