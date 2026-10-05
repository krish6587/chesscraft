import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Swords,
  Clock,
  User,
  Shield,
  ArrowRight,
  Loader2,
  LogIn,
  AlertCircle,
  CheckCircle2,
  Play,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { gamesApi } from '../../api/games';
import { useMultiplayerGame } from '../../components/chess/useMultiplayerGame';
import { MultiplayerGame } from '../../components/chess/MultiplayerGame';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { Input } from '../../components/ui/Input';
import './JoinGame.css';

export const JoinGame = () => {
  const { inviteCode: paramCode } = useParams();
  const [searchParams] = useSearchParams();
  const queryCode = searchParams.get('code');
  const initialCode = (paramCode || queryCode || '').toUpperCase();

  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [code, setCode] = useState(initialCode);
  const [gameInfo, setGameInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [joining, setJoining] = useState(false);

  const game = useMultiplayerGame({
    initialInviteCode: initialCode || null,
  });

  // Fetch match details when code is present
  useEffect(() => {
    if (!initialCode) return;

    let isMounted = true;
    const fetchGame = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const res = await gamesApi.getGameByInviteCode(initialCode);
        if (isMounted) {
          if (res?.data) {
            setGameInfo(res.data);
          } else {
            setFetchError('Match not found with this invite code.');
          }
        }
      } catch (err) {
        if (isMounted) {
          setFetchError(err.response?.data?.message || 'Failed to find match. Please check the invite code.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchGame();
    return () => {
      isMounted = false;
    };
  }, [initialCode]);

  const handleJoin = async () => {
    if (!code || !code.trim()) return;

    if (!isAuthenticated) {
      // Save target url and redirect to login
      navigate(`/login?redirect=/join/${code.trim()}`);
      return;
    }

    setJoining(true);
    await game.joinGame(code.trim());
    setJoining(false);
  };

  // If match has started or joined, render Multiplayer match!
  if (game.gameStatus !== 'idle') {
    return <MultiplayerGame game={game} onLeave={() => navigate('/play')} />;
  }

  // Derive host and joiner colors
  const hostPlayerName = gameInfo?.whitePlayerUsername || gameInfo?.blackPlayerUsername || 'Unknown Host';
  const joinerColor = gameInfo?.whitePlayerId ? 'Black' : 'White';
  const isMatchJoinable = gameInfo && (gameInfo.status === 0 || gameInfo.status === 'WaitingForPlayer');

  return (
    <div className="join-page-container animate-fade-in">
      <div className="join-hero-card">
        <div className="join-icon-avatar">
          <Swords size={32} />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Multiplayer Match Invitation</h1>
        <p className="text-sm text-slate-400 mb-6">
          You've been challenged to a real-time chess showdown!
        </p>

        {loading && (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <Loader2 size={32} className="animate-spin text-primary-400" />
            <span className="text-sm text-slate-400">Loading match details...</span>
          </div>
        )}

        {fetchError && (
          <Alert variant="danger" className="mb-6 text-left">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} />
              <span>{fetchError}</span>
            </div>
          </Alert>
        )}

        {gameInfo && !loading && (
          <div className="join-match-details animate-fade-in">
            <div className="join-detail-row">
              <span className="join-detail-label">Challenger (Host):</span>
              <span className="join-detail-val flex items-center gap-2">
                <User size={14} className="text-primary-400" /> {hostPlayerName}
              </span>
            </div>

            <div className="join-detail-row">
              <span className="join-detail-label">Time Control:</span>
              <span className="join-detail-val flex items-center gap-2">
                <Clock size={14} className="text-amber-400" /> {gameInfo.timeControlSeconds / 60} Minutes
              </span>
            </div>

            <div className="join-detail-row">
              <span className="join-detail-label">You Play As:</span>
              <span className="join-detail-val font-bold">
                {joinerColor === 'White' ? '⚪ White' : '⚫ Black'}
              </span>
            </div>

            <div className="join-detail-row">
              <span className="join-detail-label">Room Code:</span>
              <Badge variant="cyan">{gameInfo.inviteCode}</Badge>
            </div>

            <div className="join-detail-row">
              <span className="join-detail-label">Status:</span>
              <Badge variant={isMatchJoinable ? 'emerald' : 'amber'}>
                {isMatchJoinable ? 'Waiting for You' : 'Unavailable'}
              </Badge>
            </div>
          </div>
        )}

        {/* If no initial code provided */}
        {!paramCode && !gameInfo && !loading && (
          <div className="mb-6 flex flex-col gap-3 text-left">
            <label className="text-sm text-slate-300 font-semibold">Enter Room Code:</label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. CHESS-A94F12"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
              />
              <Button
                variant="primary"
                onClick={() => {
                  if (code.trim()) navigate(`/join/${code.trim()}`);
                }}
              >
                Lookup
              </Button>
            </div>
          </div>
        )}

        {/* Action Button */}
        {isAuthenticated ? (
          <Button
            variant="primary"
            size="lg"
            leftIcon={joining ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
            disabled={joining || (gameInfo && !isMatchJoinable)}
            onClick={handleJoin}
            className="w-full"
          >
            {joining
              ? 'Connecting to Room...'
              : !isMatchJoinable && gameInfo
              ? 'Match Is No Longer Available'
              : 'Accept Challenge & Start Match'}
          </Button>
        ) : (
          <div className="flex flex-col gap-3">
            <Alert variant="info" className="text-left">
              Please sign in to join this game room. Your session will immediately launch the match.
            </Alert>
            <Button
              variant="primary"
              size="lg"
              leftIcon={<LogIn size={18} />}
              onClick={() => navigate(`/login?redirect=/join/${code}`)}
              className="w-full"
            >
              Sign In to Join Match
            </Button>
          </div>
        )}

        <div className="mt-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/play')}>
            Return to Play Lobby
          </Button>
        </div>
      </div>
    </div>
  );
};
