import React, { useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ChessSquare } from './ChessSquare';
import './ChessBoard.css';

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

export const ChessBoard = ({
  board,
  turn,
  selectedSquare,
  legalMoves,
  lastMove,
  inCheck,
  flipped = false,
  theme,
  onSquareClick,
}) => {
  const { user } = useAuth();
  const activeTheme = theme || user?.settings?.boardTheme || 'slate';
  // Derive the king square for whichever side is in check
  const kingInCheckSquare = useMemo(() => {
    if (!inCheck) return null;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const cell = board[r][c];
        if (cell && cell.type === 'k' && cell.color === turn) {
          return FILES[c] + RANKS[r];
        }
      }
    }
    return null;
  }, [board, turn, inCheck]);

  // Build set of legal-move target squares for O(1) lookup
  const legalTargets = useMemo(() => {
    const set = new Set();
    legalMoves.forEach((m) => set.add(m.to));
    return set;
  }, [legalMoves]);

  // Generate ordered rows/cols based on flip state
  const rowOrder = flipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  const colOrder = flipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];

  return (
    <div className={`chess-board-frame theme-${activeTheme}`}>
      <div className="chess-board-grid">
        {rowOrder.map((rowIdx) =>
          colOrder.map((colIdx) => {
            const squareName = FILES[colIdx] + RANKS[rowIdx];
            const piece = board[rowIdx][colIdx]; // { type, color } | null
            const isLight = (rowIdx + colIdx) % 2 === 0;
            const isSelected = selectedSquare === squareName;
            const isLegalMove = legalTargets.has(squareName);
            const isLastMoveSquare =
              lastMove && (lastMove.from === squareName || lastMove.to === squareName);
            const isKingCheck = kingInCheckSquare === squareName;

            // Coordinate labels – show rank on leftmost column, file on bottom row
            const displayRow = flipped ? 7 - rowIdx : rowIdx;
            const displayCol = flipped ? 7 - colIdx : colIdx;
            const showRank = displayCol === 0;
            const showFile = displayRow === 7;

            return (
              <ChessSquare
                key={squareName}
                square={squareName}
                piece={piece}
                isLight={isLight}
                isSelected={isSelected}
                isLegalMove={isLegalMove}
                isLastMove={isLastMoveSquare}
                isInCheck={isKingCheck}
                showRankLabel={showRank}
                showFileLabel={showFile}
                rankLabel={RANKS[rowIdx]}
                fileLabel={FILES[colIdx]}
                onClick={() => onSquareClick(squareName)}
              />
            );
          })
        )}
      </div>
    </div>
  );
};
