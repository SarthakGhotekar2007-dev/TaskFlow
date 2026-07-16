import React, { useState, useEffect } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import './TaskControls.css';

const TaskSearch = ({ initialSearch, onSearch }) => {
  const [localSearch, setLocalSearch] = useState(initialSearch);

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(localSearch);
    }, 400); // 400ms debounce
    return () => clearTimeout(handler);
  }, [localSearch, onSearch]);

  const handleClear = () => {
    setLocalSearch('');
    onSearch('');
  };

  return (
    <div className="task-search-wrapper">
      <FiSearch className="search-icon" />
      <input
        type="text"
        className="task-search-input"
        placeholder="Search tasks, descriptions, tags, assignees..."
        value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)}
        aria-label="Global search"
      />
      {localSearch && (
        <button className="clear-search-btn" onClick={handleClear} aria-label="Clear search">
          <FiX />
        </button>
      )}
    </div>
  );
};

export default TaskSearch;
