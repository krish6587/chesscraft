import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Settings as SettingsIcon,
  HelpCircle,
  LogOut,
  Moon,
  Sun,
  Layout,
  ChevronsLeft,
  Search,
  Users,
  Eye,
  GraduationCap,
  Dumbbell,
  Award,
  BarChart3,
  Bot,
  UserCheck,
  FolderKanban,
  Box,
  Flame,
  Swords,
  BookOpen,
  Calendar,
  Bell,
  Mail,
  Monitor,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

export const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [activeHoverMenu, setActiveHoverMenu] = useState(null);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowSettingsMenu(false);
    if (onCloseMobile) onCloseMobile();
  };

  const handleNavClick = (path) => {
    setActiveHoverMenu(null);
    setShowSettingsMenu(false);
    navigate(path);
    if (onCloseMobile) onCloseMobile();
  };

  // Play flyout submenu items
  const playSubmenu = [
    {
      title: 'Play Online',
      path: '/play',
      icon: (
        <span className="sub-icon emoji-icon">♟️</span>
      ),
    },
    {
      title: 'Play Bots',
      path: '/play/bot',
      icon: <Bot size={18} className="text-cyan" />,
    },
    {
      title: 'Pass & Play (Local)',
      path: '/play/local',
      icon: <Monitor size={18} className="text-emerald" />,
    },
    {
      title: 'Play Coach',
      path: '/play',
      icon: <UserCheck size={18} className="text-amber" />,
    },
    { divider: true },
    {
      title: 'Stats',
      path: '/profile',
      icon: <BarChart3 size={18} className="text-cyan" />,
    },
    {
      title: 'Tournaments',
      path: '/play',
      icon: <Award size={18} className="text-amber" />,
    },
    {
      title: 'Variants',
      path: '/play',
      icon: <Box size={18} className="text-emerald" />,
    },
    {
      title: 'Game History',
      path: '/history',
      icon: <FolderKanban size={18} className="text-amber" />,
    },
  ];

  // Puzzles flyout submenu items
  const puzzlesSubmenu = [
    {
      title: 'Puzzles',
      path: '/puzzles',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#f97316">
          <path d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5C13 2.12 11.88 1 10.5 1S8 2.12 8 3.5V5H4c-1.1 0-1.99.9-1.99 2v3.8H3.5c1.49 0 2.7 1.21 2.7 2.7s-1.21 2.7-2.7 2.7H2V20c0 1.1.9 2 2 2h3.8v-1.5c0-1.49 1.21-2.7 2.7-2.7 1.49 0 2.7 1.21 2.7 2.7V22H17c1.1 0 2-.9 2-2v-4h1.5c1.38 0 2.5-1.12 2.5-2.5s-1.12-2.5-2.5-2.5z" />
        </svg>
      ),
    },
    {
      title: 'Daily Puzzle',
      path: '/puzzles',
      icon: <Calendar size={18} className="text-emerald" />,
    },
    {
      title: 'Puzzle Rush',
      path: '/puzzles',
      icon: <Flame size={18} className="text-amber" />,
    },
    {
      title: 'Puzzle Battle',
      path: '/puzzles',
      icon: <Swords size={18} className="text-emerald" />,
    },
    {
      title: 'Custom Puzzles',
      path: '/puzzles',
      icon: <BookOpen size={18} className="text-muted" />,
    },
  ];

  return (
    <>
      {isMobileOpen && (
        <div className="sidebar-backdrop" onClick={onCloseMobile} />
      )}

      <aside
        className={`chess-sidebar ${isCollapsed ? 'collapsed' : ''} ${
          isMobileOpen ? 'mobile-open' : ''
        }`}
      >
        {/* Brand Header */}
        <div className="sidebar-brand-chess" onClick={() => handleNavClick('/')}>
          <div className="chess-brand-logo">
            <svg
              className="pawn-brand-svg"
              viewBox="0 0 24 24"
              fill="#81b64c"
            >
              <path d="M19 22H5v-2h14v2zm-2.2-4.5H7.2l.6-2.5h8.4l.6 2.5zM12 2c1.7 0 3 1.3 3 3 0 .7-.2 1.3-.7 1.8l1.4 3.7-2.7 1.8.8-4.3c-.6-.3-1.1-.7-1.4-1.2-.4.6-.9 1-1.5 1.3l.8 4.2-2.7-1.8 1.4-3.7C10.2 6.3 10 5.7 10 5c0-1.7 1.3-3 3-3z" />
            </svg>
            <span className="brand-text-chess">
              Chess<span className="brand-domain">Craft</span>
            </span>
          </div>
        </div>

        {/* Main Navigation with Submenu Popovers */}
        <nav className="sidebar-nav-chess">
          {/* Play Item */}
          <div
            className="nav-item-wrapper"
            onMouseEnter={() => setActiveHoverMenu('play')}
            onMouseLeave={() => setActiveHoverMenu(null)}
          >
            <NavLink
              to="/play"
              className={({ isActive }) =>
                `nav-btn-chess ${isActive ? 'active' : ''}`
              }
              onClick={() => handleNavClick('/play')}
            >
              <span className="nav-btn-icon emoji-pawn">♟</span>
              <span className="nav-btn-label">Play</span>
            </NavLink>

            {/* Play Flyout Submenu */}
            {activeHoverMenu === 'play' && (
              <div className="flyout-submenu animate-fade-in">
                {playSubmenu.map((item, idx) =>
                  item.divider ? (
                    <div key={idx} className="flyout-divider" />
                  ) : (
                    <div
                      key={item.title}
                      className="flyout-item"
                      onClick={() => handleNavClick(item.path)}
                    >
                      <span className="flyout-icon">{item.icon}</span>
                      <span className="flyout-text">{item.title}</span>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* Puzzles Item */}
          <div
            className="nav-item-wrapper"
            onMouseEnter={() => setActiveHoverMenu('puzzles')}
            onMouseLeave={() => setActiveHoverMenu(null)}
          >
            <NavLink
              to="/puzzles"
              className={({ isActive }) =>
                `nav-btn-chess ${isActive ? 'active' : ''}`
              }
              onClick={() => handleNavClick('/puzzles')}
            >
              <span className="nav-btn-icon puzzle-orange">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#f97316">
                  <path d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5C13 2.12 11.88 1 10.5 1S8 2.12 8 3.5V5H4c-1.1 0-1.99.9-1.99 2v3.8H3.5c1.49 0 2.7 1.21 2.7 2.7s-1.21 2.7-2.7 2.7H2V20c0 1.1.9 2 2 2h3.8v-1.5c0-1.49 1.21-2.7 2.7-2.7 1.49 0 2.7 1.21 2.7 2.7V22H17c1.1 0 2-.9 2-2v-4h1.5c1.38 0 2.5-1.12 2.5-2.5s-1.12-2.5-2.5-2.5z" />
                </svg>
              </span>
              <span className="nav-btn-label">Puzzles</span>
            </NavLink>

            {/* Puzzles Flyout Submenu */}
            {activeHoverMenu === 'puzzles' && (
              <div className="flyout-submenu animate-fade-in">
                {puzzlesSubmenu.map((item) => (
                  <div
                    key={item.title}
                    className="flyout-item"
                    onClick={() => handleNavClick(item.path)}
                  >
                    <span className="flyout-icon">{item.icon}</span>
                    <span className="flyout-text">{item.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Learn Item */}
          <div className="nav-item-wrapper">
            <div
              className="nav-btn-chess"
              onClick={() => handleNavClick('/puzzles')}
            >
              <GraduationCap size={20} className="nav-btn-icon text-cyan" />
              <span className="nav-btn-label">Learn</span>
            </div>
          </div>

          {/* Train Item */}
          <div className="nav-item-wrapper">
            <div
              className="nav-btn-chess"
              onClick={() => handleNavClick('/play/local')}
            >
              <Dumbbell size={20} className="nav-btn-icon text-muted" />
              <span className="nav-btn-label">Train</span>
            </div>
          </div>

          {/* Watch Item */}
          <div className="nav-item-wrapper">
            <div
              className="nav-btn-chess"
              onClick={() => handleNavClick('/history')}
            >
              <Eye size={20} className="nav-btn-icon text-cyan" />
              <span className="nav-btn-label">Watch</span>
            </div>
          </div>

          {/* Community Item */}
          <div className="nav-item-wrapper">
            <div
              className="nav-btn-chess"
              onClick={() => handleNavClick('/profile')}
            >
              <Users size={20} className="nav-btn-icon text-amber" />
              <span className="nav-btn-label">Community</span>
            </div>
          </div>

          {/* Search / Other */}
          <div className="nav-item-wrapper">
            <div
              className="nav-btn-chess"
              onClick={() => handleNavClick('/history')}
            >
              <Search size={18} className="nav-btn-icon text-muted" />
              <span className="nav-btn-label">Search</span>
            </div>
          </div>
        </nav>

        {/* Sidebar Footer Section */}
        <div className="sidebar-footer-chess">
          {!isAuthenticated ? (
            /* Unauthenticated Bottom CTA */
            <div className="auth-cta-group">
              <button
                type="button"
                className="chess-btn-signup"
                onClick={() => handleNavClick('/register')}
              >
                Sign Up
              </button>
              <button
                type="button"
                className="chess-btn-login"
                onClick={() => handleNavClick('/login')}
              >
                Log In
              </button>

              <div className="aux-links-row">
                <div
                  className="aux-link-item"
                  onClick={() => handleNavClick('/settings')}
                >
                  <HelpCircle size={16} />
                  <span>Help & Support</span>
                </div>
              </div>
            </div>
          ) : (
            /* Authenticated User Bottom Ribbon */
            <div className="auth-user-bar">
              <div className="user-icons-row">
                <button
                  type="button"
                  className="icon-action-btn"
                  title="Friends"
                  onClick={() => handleNavClick('/play')}
                >
                  <Users size={18} />
                </button>
                <button
                  type="button"
                  className="icon-action-btn badge-container"
                  title="Messages"
                  onClick={() => handleNavClick('/play')}
                >
                  <Mail size={18} />
                  <span className="unread-dot-badge">2</span>
                </button>
                <button
                  type="button"
                  className="icon-action-btn"
                  title="Notifications"
                  onClick={() => handleNavClick('/history')}
                >
                  <Bell size={18} />
                </button>

                {/* Settings Cog with Popout Flyout */}
                <div
                  className="settings-cog-wrapper"
                  onMouseEnter={() => setShowSettingsMenu(true)}
                  onMouseLeave={() => setShowSettingsMenu(false)}
                >
                  <button
                    type="button"
                    className={`icon-action-btn ${
                      showSettingsMenu ? 'active-cog' : ''
                    }`}
                    title="Settings"
                    onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                  >
                    <SettingsIcon size={18} />
                  </button>

                  {/* Settings Flyout Popover */}
                  {showSettingsMenu && (
                    <div className="settings-flyout-menu animate-fade-in">
                      <div
                        className="flyout-item"
                        onClick={() => handleNavClick('/settings')}
                      >
                        <SettingsIcon size={18} />
                        <span>All Settings</span>
                      </div>
                      <div
                        className="flyout-item"
                        onClick={() => handleNavClick('/settings')}
                      >
                        <Layout size={18} />
                        <span>Customize Sidebar</span>
                      </div>
                      <div
                        className="flyout-item"
                        onClick={() => handleNavClick('/settings')}
                      >
                        <Sun size={18} />
                        <span>Light UI</span>
                      </div>
                      <div
                        className="flyout-item"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                      >
                        <ChevronsLeft size={18} />
                        <span>Collapse</span>
                      </div>
                      <div
                        className="flyout-item"
                        onClick={() => handleNavClick('/settings')}
                      >
                        <HelpCircle size={18} />
                        <span>Help & Support</span>
                      </div>
                      <div
                        className="flyout-item text-danger-hover"
                        onClick={handleLogout}
                      >
                        <LogOut size={18} />
                        <span>Log Out</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
