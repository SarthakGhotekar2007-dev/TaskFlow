import React, { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const { darkMode, toggleTheme } = useContext(ThemeContext);

  return (
    <button 
      className="theme-toggle-btn" 
      onClick={toggleTheme} 
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className={`theme-toggle-icon ${darkMode ? 'dark' : 'light'}`}>
        {darkMode ? <FiMoon size={20} /> : <FiSun size={20} />}
      </div>
    </button>
  );
};

export default ThemeToggle;
