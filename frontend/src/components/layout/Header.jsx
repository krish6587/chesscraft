import React from 'react';
import { Menu, Flame, Trophy } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

export const Header = ({ onOpenMobileMenu, title = 'Dashboard' }) => {
  const { user, isAuthenticated } = useAuth();

  const userRating = user?.settings?.rating || user?.rating || 1200;
  const puzzleStreak = Number(localStorage.getItem('chesscraft_puzzle_streak')) || 0;

  return (
    <header className="header-container">
      <div className="header-left">
        <button
          type="button"
          className="header-mobile-toggle"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
        >
          <Menu size={22} />
        </button>
        <h1 className="header-page-title">{title}</h1>
      </div>

      <div className="header-right">
        {isAuthenticated && (
          <>
            {puzzleStreak > 0 && (
              <div className="header-stat-pill" title="Current Puzzle Streak">
                <Flame size={16} className="stat-flame-icon" />
                <span className="stat-text">{puzzleStreak} Streak</span>
              </div>
            )}

            <div className="header-stat-pill trophy-pill" title="Player Rating">
              <Trophy size={16} className="stat-trophy-icon" />
              <span className="stat-text">{userRating}</span>
            </div>
          </>
        )}

        {/* Server status indicator */}
        <div className="header-connection-status" title="ChessCraft Server Connected">
          <span className="connection-indicator-dot" />
          <span className="connection-text">Online</span>
        </div>
      </div>
    </header>
  );
};
