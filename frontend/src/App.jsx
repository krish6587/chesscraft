import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { Loader2 } from 'lucide-react';

// Lazy loaded page chunks
const Login = lazy(() => import('./pages/Login/Login').then((m) => ({ default: m.Login })));
const Register = lazy(() => import('./pages/Register/Register').then((m) => ({ default: m.Register })));
const Home = lazy(() => import('./pages/Home/Home').then((m) => ({ default: m.Home })));
const Play = lazy(() => import('./pages/Play/Play').then((m) => ({ default: m.Play })));
const ChessGame = lazy(() => import('./components/chess/ChessGame').then((m) => ({ default: m.ChessGame })));
const BotGame = lazy(() => import('./components/chess/ChessGame').then((m) => ({ default: m.BotGame })));
const Puzzles = lazy(() => import('./pages/Puzzles/Puzzles').then((m) => ({ default: m.Puzzles })));
const GameHistory = lazy(() => import('./pages/GameHistory/GameHistory').then((m) => ({ default: m.GameHistory })));
const Settings = lazy(() => import('./pages/Settings/Settings').then((m) => ({ default: m.Settings })));
const Profile = lazy(() => import('./pages/Profile/Profile').then((m) => ({ default: m.Profile })));
const JoinGame = lazy(() => import('./pages/JoinGame/JoinGame').then((m) => ({ default: m.JoinGame })));
const NotFound = lazy(() => import('./pages/NotFound/NotFound').then((m) => ({ default: m.NotFound })));

function RouteLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] gap-3 text-slate-400">
      <Loader2 size={32} className="animate-spin text-emerald-500" />
      <span className="text-sm font-medium">Loading page...</span>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            {/* Public Authentication Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Public & App Layout Routes */}
            <Route element={<AppLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/play" element={<Play />} />
              <Route path="/play/:gameId" element={<Play />} />
              <Route path="/game/:gameId" element={<Play />} />
              <Route path="/play/local" element={<ChessGame />} />
              <Route path="/play/bot" element={<BotGame />} />
              <Route path="/puzzles" element={<Puzzles />} />
              <Route path="/join" element={<JoinGame />} />
              <Route path="/join/:inviteCode" element={<JoinGame />} />

              {/* Protected Routes inside AppLayout */}
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <GameHistory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Catch-all 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
