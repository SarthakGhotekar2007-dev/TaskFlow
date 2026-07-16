import React from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../../hooks/useTheme';
import './ThemeToggle.css'; // Since we need the rotate animation

const ThemeToggle = () => {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <button 
      className="nav-icon-btn ripple-btn" 
      onClick={toggleTheme} 
      title="Toggle Theme"
      aria-label="Toggle Theme"
    >
      {darkMode ? <FiSun className="rotate-in" /> : <FiMoon className="rotate-in" />}
    </button>
  );
};

export default React.memo(ThemeToggle);
