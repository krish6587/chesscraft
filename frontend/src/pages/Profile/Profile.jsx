import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Calendar,
  Shield,
  Trophy,
  Zap,
  Clock,
  Puzzle,
  Settings,
  Flame,
  Award,
  Swords,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { gamesApi } from '../../api/games';
import { puzzlesApi } from '../../api/puzzles';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import './Profile.css';

export const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [games, setGames] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [puzzleHistory, setPuzzleHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadProfileData = async () => {
      setLoading(true);
      try {
        if (user?.id) {
          const [gamesRes, puzzleRes] = await Promise.allSettled([
            gamesApi.getUserHistory(user.id, 1, 50),
            puzzlesApi.getUserPuzzleHistory(),
          ]);

          if (isMounted) {
            if (gamesRes.status === 'fulfilled' && gamesRes.value?.data) {
              setGames(gamesRes.value.data.items || []);
              setTotalCount(gamesRes.value.data.totalCount || 0);
            }
            if (puzzleRes.status === 'fulfilled' && puzzleRes.value?.data) {
              setPuzzleHistory(puzzleRes.value.data || []);
            }
          }
        }
      } catch (err) {
        console.warn('Profile data load error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProfileData();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // Derived real combat statistics
  const wins = games.filter((g) => g.userWon).length;
  const draws = games.filter((g) => g.result === 3 || g.result === 'Draw').length;
  const losses = games.filter((g) => {
    if (g.userWon) return false;
    if (g.result === 3 || g.result === 'Draw') return false;
    return g.status === 2 || g.status === 'Completed';
  }).length;

  const completedGames = wins + losses + draws;
  const winPercent = completedGames > 0 ? Math.round((wins / completedGames) * 100) : 0;
  const drawPercent = completedGames > 0 ? Math.round((draws / completedGames) * 100) : 0;
  const lossPercent = completedGames > 0 ? Math.max(0, 100 - winPercent - drawPercent) : 0;

  const currentRating = user?.settings?.rating || user?.rating || 1200;
  const puzzlesSolved = puzzleHistory.filter((p) => p.isSolved).length;
  const puzzleRating = Number(localStorage.getItem('chesscraft_puzzle_rating')) || 1500;

  const memberDateStr = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
    : 'Active Member';

  const achievements = [
    {
      title: 'First Blood',
      desc: 'Win your first rated online encounter',
      icon: <Swords size={18} />,
      unlocked: wins > 0,
      color: 'emerald',
    },
    {
      title: 'Tactical Mind',
      desc: 'Successfully solve 5 chess tactical puzzles',
      icon: <Puzzle size={18} />,
      unlocked: puzzlesSolved >= 5,
      color: 'cyan',
    },
    {
      title: 'Veteran Fighter',
      desc: 'Complete 10 multiplayer matches',
      icon: <Zap size={18} />,
      unlocked: completedGames >= 10,
      color: 'amber',
    },
    {
      title: 'Grandmaster Ascent',
      desc: 'Reach a peak rating of 1500 ELO',
      icon: <Trophy size={18} />,
      unlocked: currentRating >= 1500,
      color: 'purple',
    },
  ];

  return (
    <div className="profile-page-container animate-fade-in">
      {/* Profile Header Banner */}
      <div className="profile-header-banner">
        <div className="profile-header-left">
          <div className="profile-avatar-giant">
            {user?.username?.charAt(0).toUpperCase() || 'U'}
            <span className="profile-online-badge" />
          </div>

          <div className="profile-user-titles">
            <div className="profile-name-row">
              <h2 className="profile-username">{user?.username || 'Player'}</h2>
              <Badge variant="emerald">Player</Badge>
            </div>
            <div className="profile-details-row">
              <span className="profile-meta-item">
                <Mail size={14} /> {user?.email || 'player@chesscraft.com'}
              </span>
              <span className="profile-meta-item">
                <Calendar size={14} /> {memberDateStr}
              </span>
            </div>
          </div>
        </div>

        <div className="profile-header-right">
          <Button
            variant="secondary"
            size="md"
            leftIcon={<Settings size={16} />}
            onClick={() => navigate('/settings')}
          >
            Edit Settings
          </Button>
        </div>
      </div>

      {/* Ratings Grid */}
      <div className="profile-ratings-grid">
        <Card className="rating-discipline-card">
          <div className="rating-card-top">
            <span className="discipline-name">Standard</span>
            <Clock size={18} className="text-emerald" />
          </div>
          <span className="discipline-rating">{currentRating}</span>
          <span className="discipline-stats">{totalCount} Matches • {winPercent}% Win</span>
        </Card>

        <Card className="rating-discipline-card">
          <div className="rating-card-top">
            <span className="discipline-name">Tactics Rating</span>
            <Puzzle size={18} className="text-purple" />
          </div>
          <span className="discipline-rating">{puzzleRating}</span>
          <span className="discipline-stats">{puzzlesSolved} Solved</span>
        </Card>
      </div>

      {/* 2-Column: Performance Breakdown & Achievements */}
      <div className="profile-breakdown-grid">
        {/* Performance & Win Ratio */}
        <Card className="profile-stats-card">
          <CardHeader>
            <CardTitle>Combat Record</CardTitle>
            <p className="card-desc-custom">Lifetime match results breakdown</p>
          </CardHeader>
          <CardContent>
            {completedGames === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">
                No completed matches recorded yet. Play a game to see your battle statistics!
              </div>
            ) : (
              <>
                {/* Visual ratio bar */}
                <div className="win-ratio-bar">
                  <div className="ratio-segment win" style={{ width: `${winPercent}%` }} title={`Wins: ${winPercent}%`} />
                  <div className="ratio-segment draw" style={{ width: `${drawPercent}%` }} title={`Draws: ${drawPercent}%`} />
                  <div className="ratio-segment loss" style={{ width: `${lossPercent}%` }} title={`Losses: ${lossPercent}%`} />
                </div>

                <div className="ratio-legend">
                  <div className="legend-item">
                    <span className="legend-dot win" />
                    <span className="legend-label">{wins} Wins ({winPercent}%)</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot draw" />
                    <span className="legend-label">{draws} Draws ({drawPercent}%)</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot loss" />
                    <span className="legend-label">{losses} Losses ({lossPercent}%)</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Achievements Card */}
        <Card className="profile-achievements-card">
          <CardHeader>
            <div className="flex-between">
              <CardTitle>Trophies & Milestones</CardTitle>
              <Award size={20} className="text-amber" />
            </div>
            <p className="card-desc-custom">Accomplishments unlocked in gameplay</p>
          </CardHeader>
          <CardContent>
            <div className="achievements-list">
              {achievements.map((item) => (
                <div
                  key={item.title}
                  className={`achievement-item-row ${item.unlocked ? 'unlocked' : 'locked'}`}
                >
                  <div className={`achievement-icon-bubble ${item.color}`}>
                    {item.icon}
                  </div>
                  <div className="achievement-meta">
                    <span className="achievement-title">{item.title}</span>
                    <span className="achievement-desc">{item.desc}</span>
                  </div>
                  {item.unlocked ? (
                    <Badge variant="emerald" size="sm">Unlocked</Badge>
                  ) : (
                    <Badge variant="neutral" size="sm">Locked</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
