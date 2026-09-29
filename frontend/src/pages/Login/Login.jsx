import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import './AuthPages.css';

export const Login = () => {
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const sessionExpired = queryParams.get('session_expired');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (apiError) setApiError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.emailOrUsername.trim()) {
      newErrors.emailOrUsername = 'Username or email is required.';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setApiError('');

    try {
      await login(formData.emailOrUsername.trim(), formData.password);
      const destination = queryParams.get('redirect') || location.state?.from?.pathname || '/';
      navigate(destination, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Unable to log in. Please verify your credentials.';
      setApiError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-background-effects">
        <div className="auth-glow-orb top-left" />
        <div className="auth-glow-orb bottom-right" />
      </div>

      <div className="auth-card-wrapper animate-fade-in">
        {/* Brand Header */}
        <div className="auth-card-header">
          <div className="auth-logo-badge">
            <svg
              className="auth-chess-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 22H5v-2h14v2zm-2.2-4.5H7.2l.6-2.5h8.4l.6 2.5zM12 2c1.7 0 3 1.3 3 3 0 .7-.2 1.3-.7 1.8l1.4 3.7-2.7 1.8.8-4.3c-.6-.3-1.1-.7-1.4-1.2-.4.6-.9 1-1.5 1.3l.8 4.2-2.7-1.8 1.4-3.7C10.2 6.3 10 5.7 10 5c0-1.7 1.3-3 3-3z" />
            </svg>
          </div>
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">
            Sign in to access your ChessCraft dashboard and matches
          </p>
        </div>

        {sessionExpired && (
          <Alert variant="warning" className="mb-4">
            Your session has expired. Please sign in again.
          </Alert>
        )}

        {apiError && (
          <Alert
            variant="error"
            title="Authentication Failed"
            className="mb-4"
            onClose={() => setApiError('')}
          >
            {apiError}
          </Alert>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <Input
            label="Email or Username"
            name="emailOrUsername"
            value={formData.emailOrUsername}
            onChange={handleChange}
            placeholder="e.g. grandmaster or player@chesscraft.com"
            error={errors.emailOrUsername}
            leftIcon={<User size={18} />}
            required
            autoComplete="username"
          />

          <Input
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            error={errors.password}
            leftIcon={<Lock size={18} />}
            required
            autoComplete="current-password"
          />

          <div className="auth-form-meta">
            <label className="auth-remember-me">
              <input type="checkbox" defaultChecked />
              <span>Remember me</span>
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            rightIcon={<ArrowRight size={18} />}
            className="w-full"
          >
            Sign In to Play
          </Button>
        </form>

        {/* Footer Link */}
        <div className="auth-footer-prompt">
          <span>Don't have an account yet?</span>{' '}
          <Link to="/register" className="auth-redirect-link">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};
