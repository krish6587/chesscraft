import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Swords,
  Puzzle,
  Trophy,
  Zap,
  Award,
  ChevronRight,
  Bot,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Chess } from 'chess.js';
import { ChessPiece } from '../../components/chess/ChessPieces';
import './Home.css';

export const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [boardMatrix, setBoardMatrix] = useState([]);

  useEffect(() => {
    try {
      const chess = new Chess();
      // Tactical position with White Knight on e5
      chess.load('r1bqkbnr/pppp1ppp/2n5/4N3/4P3/8/PPPP1PPP/RNBQKB1R b KQkq - 0 3');
      setBoardMatrix(chess.board());
    } catch {
      const defaultChess = new Chess();
      setBoardMatrix(defaultChess.board());
    }
  }, []);

  return (
    <div className="chesscraft-home-wrapper animate-fade-in">
      {/* Top Hero Showcase Section */}
      <section className="chesscraft-hero-section">
        {/* Left: Visual Chessboard Showcase */}
        <div className="hero-board-column">
          <div className="hero-board-frame">
            <div className="hero-board-grid">
              {boardMatrix.map((row, rIdx) =>
                row.map((square, cIdx) => {
                  const isDark = (rIdx + cIdx) % 2 === 1;
                  const isBrilliantSquare = rIdx === 3 && cIdx === 4;

                  return (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      className={`hero-square ${isDark ? 'dark' : 'light'} ${
                        isBrilliantSquare ? 'highlight-move' : ''
                      }`}
                    >
                      {cIdx === 0 && <span className="hero-coord-rank">{8 - rIdx}</span>}
                      {rIdx === 7 && (
                        <span className="hero-coord-file">{String.fromCharCode(97 + cIdx)}</span>
                      )}

                      {square && (
                        <div className="hero-piece-container">
                          <ChessPiece type={square.type} color={square.color} />
                        </div>
                      )}

                      {isBrilliantSquare && (
                        <div className="brilliant-badge-icon" title="Tactical Strike">
                          <span>!</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right: Call to Action Banner */}
        <div className="hero-cta-column">
          <h1 className="hero-main-title">
            Master Every Move<br />
            with ChessCraft
          </h1>
          <p className="hero-player-count">
            Modern real-time multiplayer chess, curated tactical puzzles,<br />
            and interactive move-by-move match replays.
          </p>

          <button
            type="button"
            className="hero-get-started-btn"
            onClick={() => navigate(isAuthenticated ? '/play' : '/register')}
          >
            {isAuthenticated ? 'Play Online' : 'Get Started'}
          </button>

          <div className="hero-quick-action-cards">
            <div
              className="quick-card-btn"
              onClick={() => navigate('/play')}
            >
              <div className="quick-card-icon green">
                <Swords size={24} />
              </div>
              <div className="quick-card-meta">
                <span className="quick-card-title">Play Online</span>
                <span className="quick-card-sub">Create or join multiplayer game rooms</span>
              </div>
              <ChevronRight size={18} className="quick-card-arrow" />
            </div>

            <div
              className="quick-card-btn"
              onClick={() => navigate('/play/local')}
            >
              <div className="quick-card-icon cyan">
                <Bot size={24} />
              </div>
              <div className="quick-card-meta">
                <span className="quick-card-title">Pass & Play Local</span>
                <span className="quick-card-sub">Play with a friend on the same screen</span>
              </div>
              <ChevronRight size={18} className="quick-card-arrow" />
            </div>

            <div
              className="quick-card-btn"
              onClick={() => navigate('/puzzles')}
            >
              <div className="quick-card-icon orange">
                <Puzzle size={24} />
              </div>
              <div className="quick-card-meta">
                <span className="quick-card-title">Tactical Puzzles</span>
                <span className="quick-card-sub">Sharpen pattern recognition with tactical training</span>
              </div>
              <ChevronRight size={18} className="quick-card-arrow" />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Badges Showcase */}
      <section className="features-ribbon-grid">
        <div className="feature-pill-card" onClick={() => navigate('/play')}>
          <div className="feature-icon-box cyan">
            <Zap size={22} />
          </div>
          <div className="feature-info">
            <h4>SignalR Real-Time</h4>
            <p>Sub-millisecond WebSocket game synchronization</p>
          </div>
        </div>

        <div className="feature-pill-card" onClick={() => navigate('/history')}>
          <div className="feature-icon-box purple">
            <Trophy size={22} />
          </div>
          <div className="feature-info">
            <h4>Game Replay Archive</h4>
            <p>Step-by-step game analysis & FEN replay</p>
          </div>
        </div>

        <div className="feature-pill-card" onClick={() => navigate('/settings')}>
          <div className="feature-icon-box amber">
            <Award size={22} />
          </div>
          <div className="feature-info">
            <h4>Custom Aesthetics</h4>
            <p>Curated board themes, dark mode & acoustic cues</p>
          </div>
        </div>
      </section>
    </div>
  );
};
