import React, { useCallback, useEffect } from 'react';
import './Navbar.css';
import SearchBar from './SearchBar';
import ThemeToggle from './ThemeToggle';
import NotificationDropdown from './NotificationDropdown';
import QuickCreateMenu from './QuickCreateMenu';
import ProfileDropdown from './ProfileDropdown';

const Navbar = () => {
  // Global Ctrl+K handler for search focus
  const handleKeyDown = useCallback((e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      const searchInput = document.getElementById('global-search-input');
      if (searchInput) {
        searchInput.focus();
      }
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <header className="navbar-container">
      {/* LEFT - Search */}
      <div className="nav-section-left">
        <SearchBar />
      </div>

      {/* RIGHT - Actions */}
      <div className="nav-section-right">
        <QuickCreateMenu />
        <ThemeToggle />
        <NotificationDropdown />
        <ProfileDropdown />
      </div>
    </header>
  );
};

export default React.memo(Navbar);
