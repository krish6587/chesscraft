import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import './AppLayout.css';

const getPageTitle = (pathname) => {
  switch (pathname) {
    case '/':
      return 'Command Center';
    case '/play':
      return 'Play Chess';
    case '/puzzles':
      return 'Tactical Puzzles';
    case '/history':
      return 'Game History & Archives';
    case '/settings':
      return 'Platform Settings';
    case '/profile':
      return 'Player Profile';
    default:
      return 'ChessCraft';
  }
};

export const AppLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className="app-shell">
      <Sidebar
        isMobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="app-main-wrapper">
        <Header
          title={pageTitle}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        <main className="app-content-container">
          <Outlet />
        </main>
      </div>

      <MobileNav />
    </div>
  );
};
