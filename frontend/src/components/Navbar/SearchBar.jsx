import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FiSearch, FiClock, FiCheckSquare, FiUsers, FiFolder } from 'react-icons/fi';
import './SearchBar.css';
import { useNavigate } from 'react-router-dom';

const MOCK_RESULTS = [
  { id: '1', type: 'recent', label: 'Q3 Marketing Plan', icon: <FiClock /> },
  { id: '2', type: 'task', label: 'Update Landing Page', icon: <FiCheckSquare /> },
  { id: '3', type: 'team', label: 'Design Team', icon: <FiUsers /> },
  { id: '4', type: 'project', label: 'Mobile App Redesign', icon: <FiFolder /> }
];

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isMac, setIsMac] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (!isFocused || query.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % MOCK_RESULTS.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 < 0 ? MOCK_RESULTS.length - 1 : prev - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < MOCK_RESULTS.length) {
        console.log('Navigating to', MOCK_RESULTS[selectedIndex].label);
        // navigate(`/search?q=${MOCK_RESULTS[selectedIndex].label}`);
        setIsFocused(false);
        setQuery('');
      } else {
        console.log('Global search for', query);
        setIsFocused(false);
      }
    } else if (e.key === 'Escape') {
      setIsFocused(false);
      document.getElementById('global-search-input')?.blur();
    }
  }, [isFocused, query, selectedIndex, navigate]);

  return (
    <div className="search-wrapper" ref={searchRef}>
      <div className={`search-input-container ${isFocused ? 'focused' : ''}`}>
        <FiSearch className="search-icon" />
        <input
          id="global-search-input"
          type="text"
          placeholder="Search Team, Member, Task..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          spellCheck="false"
        />
        <div className="shortcut-hint">
          <kbd>{isMac ? '⌘' : 'Ctrl'}</kbd>
          <kbd>K</kbd>
        </div>
      </div>

      {isFocused && query.length > 0 && (
        <div className="search-results-dropdown nav-glass-dropdown nav-slide-down">
          <div className="search-group">
            <div className="search-group-title">Results</div>
            {MOCK_RESULTS.map((item, idx) => (
              <button
                key={item.id}
                className={`search-item ${selectedIndex === idx ? 'active' : ''}`}
                onMouseEnter={() => setSelectedIndex(idx)}
                onClick={() => {
                  console.log('Selected', item.label);
                  setIsFocused(false);
                  setQuery('');
                }}
              >
                <span className="search-item-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(SearchBar);
