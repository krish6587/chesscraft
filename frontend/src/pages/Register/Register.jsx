import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import '../Login/AuthPages.css';

export const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

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

    // Username validation
    const usernameRegex = /^[a-zA-Z0-9_]{3,32}$/;
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required.';
    } else if (!usernameRegex.test(formData.username)) {
      newErrors.username =
        'Username must be 3-32 characters and only contain letters, numbers, or underscores.';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please provide a valid email address.';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long.';
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Password confirmation is required.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
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
      await register(
        formData.username.trim(),
        formData.email.trim(),
        formData.password,
        formData.confirmPassword
      );
      const queryParams = new URLSearchParams(location.search);
      const destination = queryParams.get('redirect') || '/';
      navigate(destination, { replace: true });
    } catch (err) {
      console.error('Registration error:', err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Failed to register account. Please check your information.';
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

      <div className="auth-card-wrapper animate-fade-in register-wrapper">
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
          <h2 className="auth-title">Create Player Account</h2>
          <p className="auth-subtitle">
            Join the competitive chess arena with live rating tracking
          </p>
        </div>

        {apiError && (
          <Alert
            variant="error"
            title="Registration Error"
            className="mb-4"
            onClose={() => setApiError('')}
          >
            {apiError}
          </Alert>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <Input
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Choose unique username (e.g. magnus_c)"
            error={errors.username}
            leftIcon={<User size={18} />}
            required
            autoComplete="username"
          />

          <Input
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="player@example.com"
            error={errors.email}
            leftIcon={<Mail size={18} />}
            required
            autoComplete="email"
          />

          <div className="auth-form-row">
            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 8 characters"
              error={errors.password}
              leftIcon={<Lock size={18} />}
              required
              autoComplete="new-password"
            />

            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter password"
              error={errors.confirmPassword}
              leftIcon={<CheckCircle2 size={18} />}
              required
              autoComplete="new-password"
            />
          </div>

          <div className="auth-password-strength-hint">
            <ShieldCheck size={14} className="text-emerald" />
            <span>Passwords are hashed with BCrypt (11 rounds) for bank-grade protection.</span>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            rightIcon={<ArrowRight size={18} />}
            className="w-full mt-2"
          >
            Create My Account
          </Button>
        </form>

        {/* Footer Link */}
        <div className="auth-footer-prompt">
          <span>Already have an account?</span>{' '}
          <Link to="/login" className="auth-redirect-link">
            Sign In Instead
          </Link>
        </div>
      </div>
    </div>
  );
};
