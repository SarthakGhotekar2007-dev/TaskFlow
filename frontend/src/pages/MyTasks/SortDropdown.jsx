import React, { useState, useEffect, useRef } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import './TaskControls.css';

const SORT_OPTIONS = [
  'Newest',
  'Oldest',
  'Due Date',
  'Priority',
  'Recently Updated',
  'Alphabetical (A-Z)',
  'Alphabetical (Z-A)'
];

const SortDropdown = ({ sortBy, onSortChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onSortChange(option);
    setIsOpen(false);
  };

  return (
    <div className="sort-dropdown-container" ref={dropdownRef}>
      <button 
        className="sort-toggle-btn" 
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span>Sort: {sortBy}</span>
        <FiChevronDown />
      </button>

      {isOpen && (
        <ul className="sort-menu animate-slide-up glass" role="listbox">
          {SORT_OPTIONS.map(option => (
            <li 
              key={option} 
              className={`sort-menu-item ${sortBy === option ? 'selected' : ''}`}
              onClick={() => handleSelect(option)}
              role="option"
              aria-selected={sortBy === option}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SortDropdown;
