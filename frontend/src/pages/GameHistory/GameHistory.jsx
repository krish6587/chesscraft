import React, { useState, useEffect, useMemo } from 'react';
import {
  History,
  Search,
  Filter,
  Trophy,
  ArrowUpRight,
  Eye,
  Calendar,
  Clock,
  Swords,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Play,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { gamesApi } from '../../api/games';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { EmptyState } from '../../components/ui/EmptyState';
import { Alert } from '../../components/ui/Alert';
import { GameReplayModal } from '../../components/chess/GameReplayModal';
import './GameHistory.css';

export const GameHistory = () => {
  const { user } = useAuth();
  const [games, setGames] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterResult, setFilterResult] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGameId, setSelectedGameId] = useState(null);

  // Fetch games from backend
  useEffect(() => {
    let isMounted = true;
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await gamesApi.getUserHistory(user?.id, pageNumber, pageSize);
        if (isMounted) {
          if (res?.data) {
            setGames(res.data.items || []);
            setTotalCount(res.data.totalCount || 0);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || 'Failed to load game history.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchHistory();
    return () => {
      isMounted = false;
    };
  }, [user?.id, pageNumber, pageSize]);

  // Helper to determine accurate result status
  const isLossGame = (game) => {
    if (game.userWon) return false;
    const isDraw = game.result === 3 || game.result === 'Draw';
    if (isDraw) return false;
    const isCompletedDecisive =
      game.result === 1 ||
      game.result === 'WhiteWins' ||
      game.result === 2 ||
      game.result === 'BlackWins' ||
      game.status === 2 ||
      game.status === 'Completed';
    return Boolean(isCompletedDecisive);
  };

  // Client-side filtering on active page
  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const isWin = Boolean(game.userWon);
      const isDraw = game.result === 3 || game.result === 'Draw';
      const isLoss = isLossGame(game);

      const matchesFilter =
        filterResult === 'ALL' ||
        (filterResult === 'WIN' && isWin) ||
        (filterResult === 'LOSS' && isLoss) ||
        (filterResult === 'DRAW' && isDraw);

      const matchesSearch =
        (game.opponentUsername && game.opponentUsername.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (game.inviteCode && game.inviteCode.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesFilter && matchesSearch;
    });
  }, [games, filterResult, searchQuery]);

  // Computed summary metrics
  const stats = useMemo(() => {
    const wins = games.filter((g) => g.userWon).length;
    const draws = games.filter((g) => g.result === 3 || g.result === 'Draw').length;
    const losses = games.filter(isLossGame).length;
    const completedMatches = wins + losses + draws;
    const winRate = completedMatches > 0 ? Math.round((wins / completedMatches) * 100) : 0;

    return { total: totalCount || games.length, wins, losses, draws, winRate };
  }, [games, totalCount]);

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const getTerminationLabel = (reason) => {
    switch (reason) {
      case 1:
      case 'Checkmate':
        return 'Checkmate';
      case 2:
      case 'Resignation':
        return 'Resignation';
      case 3:
      case 'Timeout':
        return 'Timeout';
      case 4:
      case 'Stalemate':
        return 'Stalemate';
      case 5:
      case 'FiftyMoveRule':
        return '50-Move Rule';
      case 6:
      case 'ThreefoldRepetition':
        return 'Repetition';
      default:
        return 'Finished';
    }
  };

  return (
    <div className="history-page-container animate-fade-in">
      {/* Top Banner & Stats Overview */}
      <div className="history-header">
        <div>
          <h1 className="history-title">Game History & Replay Archive</h1>
          <p className="history-subtitle">
            Review past multiplayer showdowns and study your games move-by-move.
          </p>
        </div>

        <div className="history-stats-ribbon">
          <div className="stat-pill">
            <span className="stat-val">{stats.total}</span>
            <span className="stat-lbl">Matches</span>
          </div>
          <div className="stat-pill win-pill">
            <span className="stat-val">{stats.wins}</span>
            <span className="stat-lbl">Won</span>
          </div>
          <div className="stat-pill loss-pill">
            <span className="stat-val">{stats.losses}</span>
            <span className="stat-lbl">Lost</span>
          </div>
          <div className="stat-pill winrate-pill">
            <span className="stat-val">{stats.winRate}%</span>
            <span className="stat-lbl">Win Rate</span>
          </div>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Filter and Search Bar */}
      <div className="history-controls-row">
        <div className="history-search-input">
          <Input
            placeholder="Search opponent or room code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="history-filter-chips">
          {['ALL', 'WIN', 'LOSS', 'DRAW'].map((tab) => (
            <button
              key={tab}
              type="button"
              className={`filter-chip ${filterResult === tab ? 'active' : ''}`}
              onClick={() => setFilterResult(tab)}
            >
              {tab === 'ALL' ? 'All Results' : tab + 'S'}
            </button>
          ))}
        </div>
      </div>

      {/* Games List Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 size={36} className="animate-spin text-primary-400" />
          <span className="text-sm text-slate-400">Loading game archive...</span>
        </div>
      ) : filteredGames.length === 0 ? (
        <EmptyState
          icon={<History size={48} className="text-primary-400" />}
          title="No Match History Found"
          description={
            searchQuery || filterResult !== 'ALL'
              ? 'No games match your search criteria.'
              : 'You have not played any multiplayer matches yet. Jump into a match to build your history!'
          }
        />
      ) : (
        <div className="history-cards-grid">
          {filteredGames.map((game) => {
            const isWin = Boolean(game.userWon);
            const isDraw = game.result === 3 || game.result === 'Draw';
            const isLoss = isLossGame(game);
            const userColorStr = game.userColor === 0 || game.userColor === 'White' ? 'White' : 'Black';

            return (
              <Card key={game.id} className="history-match-card animate-fade-in">
                <div className="history-card-left">
                  <div className={`match-result-indicator ${isWin ? 'win' : isDraw ? 'draw' : isLoss ? 'loss' : 'active'}`}>
                    {isWin ? 'WIN' : isDraw ? 'DRAW' : isLoss ? 'LOSS' : 'ACTIVE'}
                  </div>

                  <div className="match-meta-block">
                    <div className="match-opponent-row">
                      <span className="vs-label">vs</span>
                      <span className="opponent-username font-bold text-white">
                        {game.opponentUsername}
                      </span>
                      <Badge variant="cyan" size="sm">
                        ROOM: {game.inviteCode}
                      </Badge>
                    </div>

                    <div className="match-sub-details">
                      <span className="sub-item">
                        <span className={`color-dot ${userColorStr === 'White' ? 'white-dot' : 'black-dot'}`} />
                        Played as {userColorStr}
                      </span>
                      <span className="sub-divider">•</span>
                      <span className="sub-item">{getTerminationLabel(game.terminationReason)}</span>
                      <span className="sub-divider">•</span>
                      <span className="sub-item">{game.totalMoves} moves</span>
                      <span className="sub-divider">•</span>
                      <span className="sub-item">
                        {new Date(game.playedAtUtc).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="history-card-right">
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<Eye size={14} />}
                    onClick={() => setSelectedGameId(game.id)}
                  >
                    Interactive Replay
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-6">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<ChevronLeft size={16} />}
            disabled={pageNumber <= 1}
            onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-sm font-semibold text-slate-400">
            Page {pageNumber} of {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            rightIcon={<ChevronRight size={16} />}
            disabled={pageNumber >= totalPages}
            onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      )}

      {/* Interactive Game Replay Modal */}
      {selectedGameId && (
        <GameReplayModal
          gameId={selectedGameId}
          onClose={() => setSelectedGameId(null)}
        />
      )}
    </div>
  );
};
