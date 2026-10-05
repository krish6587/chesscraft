import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Clock,
  Sparkles,
  ArrowRight,
  Shield,
  Zap,
  Play,
  Loader2,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import './InviteFriendModal.css';

import { copyToClipboard } from '../../utils/clipboard';

export const InviteFriendModal = ({ isOpen, onClose, onCreateGame, isSubmitting }) => {
  const [timeControl, setTimeControl] = useState('10 min');
  const [preferredColor, setPreferredColor] = useState('random');
  const [createdRoom, setCreatedRoom] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const timeControlSecondsMap = {
    '1 min': 60,
    '3 min': 180,
    '5 min': 300,
    '10 min': 600,
    '15 min': 900,
    '30 min': 1800,
  };

  const timeControls = [
    { name: '1 min', type: 'Bullet' },
    { name: '3 min', type: 'Blitz' },
    { name: '5 min', type: 'Blitz' },
    { name: '10 min', type: 'Rapid' },
    { name: '15 min', type: 'Rapid' },
    { name: '30 min', type: 'Classical' },
  ];

  const handleGenerate = async () => {
    const seconds = timeControlSecondsMap[timeControl] || 600;
    const res = await onCreateGame({
      timeControlSeconds: seconds,
      preferredColor,
    });
    if (res && res.inviteCode) {
      setCreatedRoom(res);
    }
  };

  const shareLink = createdRoom
    ? `${window.location.origin}/join/${createdRoom.inviteCode}`
    : '';

  const handleCopyLink = async () => {
    if (shareLink) {
      const ok = await copyToClipboard(shareLink);
      if (ok) {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
    }
  };

  const handleCopyCode = async () => {
    if (createdRoom?.inviteCode) {
      const ok = await copyToClipboard(createdRoom.inviteCode);
      if (ok) {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      }
    }
  };

  return (
    <div className="invite-modal-overlay animate-fade-in" onClick={onClose}>
      <div className="invite-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="invite-modal-header">
          <div className="invite-modal-title">
            <Share2 size={20} className="text-primary-400" />
            <span>Invite a Friend</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="invite-modal-body">
          {!createdRoom ? (
            <>
              {/* Time Control */}
              <div className="invite-option-group">
                <label className="invite-option-label">
                  <Clock size={16} /> Choose Match Time Control
                </label>
                <div className="invite-tc-grid">
                  {timeControls.map((tc) => (
                    <button
                      key={tc.name}
                      type="button"
                      className={`invite-tc-btn ${timeControl === tc.name ? 'active' : ''}`}
                      onClick={() => setTimeControl(tc.name)}
                    >
                      <span className="time">{tc.name}</span>
                      <span className="label">{tc.type}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Preference */}
              <div className="invite-option-group">
                <label className="invite-option-label">Your Preferred Color</label>
                <div className="invite-colors-row">
                  <button
                    type="button"
                    className={`invite-color-btn ${preferredColor === 'white' ? 'active' : ''}`}
                    onClick={() => setPreferredColor('white')}
                  >
                    <span>⚪</span> White
                  </button>
                  <button
                    type="button"
                    className={`invite-color-btn ${preferredColor === 'random' ? 'active' : ''}`}
                    onClick={() => setPreferredColor('random')}
                  >
                    <span>⚖️</span> Random
                  </button>
                  <button
                    type="button"
                    className={`invite-color-btn ${preferredColor === 'black' ? 'active' : ''}`}
                    onClick={() => setPreferredColor('black')}
                  >
                    <span>⚫</span> Black
                  </button>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                leftIcon={isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                disabled={isSubmitting}
                onClick={handleGenerate}
                className="w-full mt-2"
              >
                {isSubmitting ? 'Generating Invite...' : 'Generate Invite Link'}
              </Button>
            </>
          ) : (
            <div className="animate-fade-in flex flex-col gap-4">
              <div className="invite-share-card">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                    Room Ready
                  </span>
                  <Badge variant="cyan">{createdRoom.timeControlSeconds / 60} Min</Badge>
                </div>

                <div className="invite-code-banner">
                  <div>
                    <span className="text-xs text-slate-400 block">INVITE CODE:</span>
                    <span className="invite-code-text">{createdRoom.inviteCode}</span>
                  </div>
                  <Button
                    variant={copiedCode ? 'primary' : 'secondary'}
                    size="sm"
                    leftIcon={copiedCode ? <Check size={14} /> : <Copy size={14} />}
                    onClick={handleCopyCode}
                  >
                    {copiedCode ? 'Copied' : 'Copy'}
                  </Button>
                </div>

                <div>
                  <span className="text-xs text-slate-400 block mb-1">SHAREABLE LINK:</span>
                  <div className="invite-url-field">
                    <input readOnly value={shareLink} className="invite-url-input" />
                    <Button
                      variant={copiedLink ? 'primary' : 'secondary'}
                      size="sm"
                      leftIcon={copiedLink ? <Check size={14} /> : <Share2 size={14} />}
                      onClick={handleCopyLink}
                    >
                      {copiedLink ? 'Copied' : 'Copy'}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="lg"
                  rightIcon={<ArrowRight size={18} />}
                  onClick={onClose}
                  className="w-full"
                >
                  Enter Room & Wait for Opponent
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
