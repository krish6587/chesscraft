import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth';
import { userApi } from '../api/user';
import { stopConnection } from '../services/signalrService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('chess_auth_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('chess_auth_token') || null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync token and user profile on initial mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('chess_auth_token');
      if (storedToken) {
        try {
          const res = await authApi.getCurrentUser();
          if (res && res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('chess_auth_user', JSON.stringify(res.data));
          }
        } catch (err) {
          console.warn('Initial session validation failed:', err);
          // Only log out if the server explicitly rejected the token as unauthorized (401)
          if (err.response && err.response.status === 401) {
            logout();
          }
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (emailOrUsername, password) => {
    const res = await authApi.login(emailOrUsername, password);
    if (res.success && res.data) {
      const { token: jwtToken, ...userInfo } = res.data;
      setToken(jwtToken);
      setUser(userInfo);
      localStorage.setItem('chess_auth_token', jwtToken);
      localStorage.setItem('chess_auth_user', JSON.stringify(userInfo));

      // Fetch complete user profile with settings in background
      try {
        const profileRes = await authApi.getCurrentUser();
        if (profileRes.success && profileRes.data) {
          setUser(profileRes.data);
          localStorage.setItem('chess_auth_user', JSON.stringify(profileRes.data));
        }
      } catch (e) {
        console.warn('Profile fetch after login skipped:', e);
      }

      return res.data;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (username, email, password, confirmPassword) => {
    const res = await authApi.register(username, email, password, confirmPassword);
    if (res.success && res.data) {
      const { token: jwtToken, ...userInfo } = res.data;
      setToken(jwtToken);
      setUser(userInfo);
      localStorage.setItem('chess_auth_token', jwtToken);
      localStorage.setItem('chess_auth_user', JSON.stringify(userInfo));
      return res.data;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('chess_auth_token');
    localStorage.removeItem('chess_auth_user');
    stopConnection();
  };

  const refreshUser = async () => {
    try {
      const res = await authApi.getCurrentUser();
      if (res.success && res.data) {
        setUser(res.data);
        localStorage.setItem('chess_auth_user', JSON.stringify(res.data));
      }
    } catch (err) {
      console.error('Error refreshing user:', err);
    }
  };

  const updateSettings = async (settingsDto) => {
    const res = await userApi.updateMySettings(settingsDto);
    if (res.success && res.data) {
      setUser((prev) => ({
        ...prev,
        settings: res.data,
      }));
    }
    return res;
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token),
    isLoading,
    login,
    register,
    logout,
    refreshUser,
    updateSettings,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
