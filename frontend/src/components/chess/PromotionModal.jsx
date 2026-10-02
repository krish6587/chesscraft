import React from 'react';
import { ChessPiece } from './ChessPieces';
import { X } from 'lucide-react';
import './PromotionModal.css';

export const PromotionModal = ({ color, onSelect, onCancel }) => {
  const pieces = [
    { type: 'q', name: 'Queen' },
    { type: 'r', name: 'Rook' },
    { type: 'b', name: 'Bishop' },
    { type: 'n', name: 'Knight' },
  ];

  return (
    <div className="promotion-modal-backdrop" onClick={onCancel}>
      <div
        className="promotion-modal-dialog animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="promotion-header">
          <span className="promotion-title">Promote Pawn</span>
          <button
            type="button"
            className="promotion-close-btn"
            onClick={onCancel}
            aria-label="Cancel promotion"
          >
            <X size={16} />
          </button>
        </div>

        <p className="promotion-subtitle">Choose promotion piece:</p>

        <div className="promotion-options-grid">
          {pieces.map((p) => (
            <button
              key={p.type}
              type="button"
              className="promotion-choice-btn"
              onClick={() => onSelect(p.type)}
            >
              <div className="promotion-piece-preview">
                <ChessPiece type={p.type} color={color} />
              </div>
              <span className="promotion-piece-name">{p.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
