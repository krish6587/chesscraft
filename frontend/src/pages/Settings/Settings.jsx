import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Palette,
  Volume2,
  Lock,
  Check,
  Shield,
  Moon,
  Sparkles,
  Save,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/auth';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Alert';
import { Badge } from '../../components/ui/Badge';
import './Settings.css';

export const Settings = () => {
  const { user, updateSettings } = useAuth();

  const [boardTheme, setBoardTheme] = useState(user?.settings?.boardTheme || 'slate');
  const [pieceStyle, setPieceStyle] = useState(user?.settings?.pieceStyle || 'classic');
  const [soundEnabled, setSoundEnabled] = useState(user?.settings?.soundEnabled ?? true);
  const [darkTheme, setDarkTheme] = useState(user?.settings?.darkTheme ?? true);
  const [moveAnimationEnabled, setMoveAnimationEnabled] = useState(user?.settings?.moveAnimationEnabled ?? true);

  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [settingsError, setSettingsError] = useState('');

  // Password change state
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const boardThemes = [
    {
      id: 'slate',
      name: 'Slate & Ice',
      light: '#cbd5e1',
      dark: '#475569',
      border: '#64748b',
    },
    {
      id: 'emerald',
      name: 'Emerald Arena',
      light: '#d1fae5',
      dark: '#059669',
      border: '#10b981',
    },
    {
      id: 'obsidian',
      name: 'Obsidian Night',
      light: '#334155',
      dark: '#0f172a',
      border: '#6366f1',
    },
    {
      id: 'wood',
      name: 'Vintage Timber',
      light: '#fde68a',
      dark: '#b45309',
      border: '#d97706',
    },
  ];

  const handleSavePreferences = async () => {
    setSavingSettings(true);
    setSettingsSuccess('');
    setSettingsError('');

    try {
      await updateSettings({
        boardTheme,
        pieceStyle,
        soundEnabled,
        darkTheme,
        moveAnimationEnabled,
      });
      setSettingsSuccess('Display and gameplay preferences updated successfully.');
    } catch (err) {
      console.error('Save settings error:', err);
      setSettingsError(
        err.response?.data?.message || 'Failed to update preferences. Please retry.'
      );
    } finally {
      setSavingSettings(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passwords.currentPassword) {
      setPasswordError('Current password is required.');
      return;
    }
    if (passwords.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }
    if (passwords.newPassword !== passwords.confirmNewPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setChangingPassword(true);
    setPasswordSuccess('');
    setPasswordError('');

    try {
      await authApi.changePassword(
        passwords.currentPassword,
        passwords.newPassword,
        passwords.confirmNewPassword
      );
      setPasswordSuccess('Password successfully updated.');
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    } catch (err) {
      console.error('Password change error:', err);
      setPasswordError(
        err.response?.data?.message ||
          'Failed to change password. Verify your current password.'
      );
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="settings-page-container animate-fade-in">
      <div className="settings-grid">
        {/* Left Column: Visual Customization */}
        <div className="settings-col">
          <Card className="settings-section-card">
            <CardHeader>
              <div className="flex-between">
                <CardTitle>Board & Visual Theme</CardTitle>
                <Palette size={20} className="text-emerald" />
              </div>
              <p className="card-desc-custom">
                Personalize your battlefield colors and piece aesthetics
              </p>
            </CardHeader>

            <CardContent>
              {settingsSuccess && (
                <Alert
                  variant="success"
                  className="mb-4"
                  onClose={() => setSettingsSuccess('')}
                >
                  {settingsSuccess}
                </Alert>
              )}
              {settingsError && (
                <Alert
                  variant="error"
                  className="mb-4"
                  onClose={() => setSettingsError('')}
                >
                  {settingsError}
                </Alert>
              )}

              <div className="themes-selector-grid">
                {boardThemes.map((theme) => (
                  <div
                    key={theme.id}
                    className={`theme-preview-card ${boardTheme === theme.id ? 'active' : ''}`}
                    onClick={() => setBoardTheme(theme.id)}
                  >
                    <div className="theme-mini-board">
                      <div className="theme-square" style={{ backgroundColor: theme.light }} />
                      <div className="theme-square" style={{ backgroundColor: theme.dark }} />
                      <div className="theme-square" style={{ backgroundColor: theme.dark }} />
                      <div className="theme-square" style={{ backgroundColor: theme.light }} />
                    </div>
                    <span className="theme-name">{theme.name}</span>
                    {boardTheme === theme.id && <Check size={16} className="theme-check-icon" />}
                  </div>
                ))}
              </div>

              {/* Toggles */}
              <div className="settings-toggles-list">
                <div className="setting-toggle-row">
                  <div className="toggle-info">
                    <span className="toggle-label">Move Audio & Sound Effects</span>
                    <span className="toggle-desc">
                      Play acoustic cues for moves, captures, checks, and victory
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    className="custom-switch"
                    checked={soundEnabled}
                    onChange={(e) => setSoundEnabled(e.target.checked)}
                  />
                </div>

                <div className="setting-toggle-row">
                  <div className="toggle-info">
                    <span className="toggle-label">Smooth Piece Animations</span>
                    <span className="toggle-desc">
                      Render fluid sliding animations during moves and captures
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    className="custom-switch"
                    checked={moveAnimationEnabled}
                    onChange={(e) => setMoveAnimationEnabled(e.target.checked)}
                  />
                </div>

                <div className="setting-toggle-row">
                  <div className="toggle-info">
                    <span className="toggle-label">Deep Obsidian Dark Mode</span>
                    <span className="toggle-desc">
                      Ultra high-contrast dark theme optimized for long matches
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    className="custom-switch"
                    checked={darkTheme}
                    onChange={(e) => setDarkTheme(e.target.checked)}
                  />
                </div>
              </div>

              <Button
                variant="primary"
                size="md"
                isLoading={savingSettings}
                leftIcon={<Save size={16} />}
                onClick={handleSavePreferences}
                className="w-full mt-4"
              >
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Account Security */}
        <div className="settings-col">
          <Card className="settings-section-card">
            <CardHeader>
              <div className="flex-between">
                <CardTitle>Account Security</CardTitle>
                <Lock size={20} className="text-cyan" />
              </div>
              <p className="card-desc-custom">
                Update your account password and security credentials
              </p>
            </CardHeader>

            <CardContent>
              {passwordSuccess && (
                <Alert
                  variant="success"
                  className="mb-4"
                  onClose={() => setPasswordSuccess('')}
                >
                  {passwordSuccess}
                </Alert>
              )}
              {passwordError && (
                <Alert
                  variant="error"
                  className="mb-4"
                  onClose={() => setPasswordError('')}
                >
                  {passwordError}
                </Alert>
              )}

              <form onSubmit={handlePasswordChange} className="password-change-form">
                <Input
                  label="Current Password"
                  type="password"
                  value={passwords.currentPassword}
                  onChange={(e) =>
                    setPasswords((prev) => ({ ...prev, currentPassword: e.target.value }))
                  }
                  placeholder="Enter current password"
                  required
                />

                <Input
                  label="New Password"
                  type="password"
                  value={passwords.newPassword}
                  onChange={(e) =>
                    setPasswords((prev) => ({ ...prev, newPassword: e.target.value }))
                  }
                  placeholder="Minimum 8 characters"
                  required
                />

                <Input
                  label="Confirm New Password"
                  type="password"
                  value={passwords.confirmNewPassword}
                  onChange={(e) =>
                    setPasswords((prev) => ({ ...prev, confirmNewPassword: e.target.value }))
                  }
                  placeholder="Repeat new password"
                  required
                />

                <Button
                  type="submit"
                  variant="secondary"
                  size="md"
                  isLoading={changingPassword}
                  className="w-full mt-2"
                >
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
