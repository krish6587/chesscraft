import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Swords, Puzzle, History, Settings } from 'lucide-react';
import './MobileNav.css';

export const MobileNav = () => {
  // Navigation should contain ONLY: Home, Play, Puzzles, Game History, Settings
  const navItems = [
    { label: 'Home', path: '/', icon: <LayoutDashboard size={19} /> },
    { label: 'Play', path: '/play', icon: <Swords size={19} /> },
    { label: 'Puzzles', path: '/puzzles', icon: <Puzzle size={19} /> },
    { label: 'History', path: '/history', icon: <History size={19} /> },
    { label: 'Settings', path: '/settings', icon: <Settings size={19} /> },
  ];

  return (
    <nav className="mobile-bottom-nav">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/'}
          className={({ isActive }) =>
            `mobile-nav-tab ${isActive ? 'mobile-nav-tab-active' : ''}`
          }
        >
          <span className="mobile-nav-icon">{item.icon}</span>
          <span className="mobile-nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};
