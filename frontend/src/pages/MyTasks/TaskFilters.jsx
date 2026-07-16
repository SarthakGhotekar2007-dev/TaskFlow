import React, { useState, useEffect, useRef } from 'react';
import { FiFilter, FiX, FiCheck } from 'react-icons/fi';
import './TaskControls.css';

const FILTER_OPTIONS = {
  priority: ['High', 'Medium', 'Low'],
  status: ['Pending', 'In Progress', 'Review', 'Completed', 'Archived'],
  dueDate: ['Today', 'Tomorrow', 'This Week', 'This Month', 'Overdue'],
  assignee: ['Me', 'Team Member', 'Everyone']
};

// Extracted tags from tasks could be dynamic, but we'll allow standard options or let parent pass them
const TaskFilters = ({ filters, onFilterChange, availableTags = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);

  const activeFilterCount = Object.values(filters).reduce((acc, val) => {
    if (Array.isArray(val)) return acc + val.length;
    if (val && val !== 'Everyone') return acc + 1;
    return acc;
  }, 0);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target) && window.innerWidth > 768) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleArrayFilter = (category, value) => {
    const current = filters[category] || [];
    const updated = current.includes(value) 
      ? current.filter(item => item !== value)
      : [...current, value];
    onFilterChange({ ...filters, [category]: updated });
  };

  const setSingleFilter = (category, value) => {
    onFilterChange({ ...filters, [category]: value });
  };

  const clearAll = () => {
    onFilterChange({
      priority: [],
      status: [],
      dueDate: [],
      assignee: 'Everyone',
      tags: []
    });
  };

  return (
    <div className="task-filters-container" ref={panelRef}>
      <button 
        className={`filter-toggle-btn ${activeFilterCount > 0 ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <FiFilter />
        <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
      </button>

      {isOpen && (
        <div className="filter-panel animate-fade-in glass">
          <div className="filter-panel-header">
            <h3>Advanced Filters</h3>
            <button className="icon-btn-small" onClick={() => setIsOpen(false)} aria-label="Close filters"><FiX /></button>
          </div>
          
          <div className="filter-panel-body">
            {/* Priority */}
            <div className="filter-group-advanced">
              <label>Priority</label>
              <div className="filter-options-grid">
                {FILTER_OPTIONS.priority.map(p => (
                  <button 
                    key={p} 
                    className={`filter-chip-btn ${filters.priority.includes(p) ? 'selected' : ''}`}
                    onClick={() => toggleArrayFilter('priority', p)}
                  >
                    {filters.priority.includes(p) && <FiCheck />} {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div className="filter-group-advanced">
              <label>Status</label>
              <div className="filter-options-grid">
                {FILTER_OPTIONS.status.map(s => (
                  <button 
                    key={s} 
                    className={`filter-chip-btn ${filters.status.includes(s) ? 'selected' : ''}`}
                    onClick={() => toggleArrayFilter('status', s)}
                  >
                    {filters.status.includes(s) && <FiCheck />} {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Due Date */}
            <div className="filter-group-advanced">
              <label>Due Date</label>
              <div className="filter-options-grid">
                {FILTER_OPTIONS.dueDate.map(d => (
                  <button 
                    key={d} 
                    className={`filter-chip-btn ${filters.dueDate.includes(d) ? 'selected' : ''}`}
                    onClick={() => toggleArrayFilter('dueDate', d)}
                  >
                    {filters.dueDate.includes(d) && <FiCheck />} {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Assignee */}
            <div className="filter-group-advanced">
              <label>Assignee</label>
              <div className="filter-options-grid">
                {FILTER_OPTIONS.assignee.map(a => (
                  <button 
                    key={a} 
                    className={`filter-chip-btn ${filters.assignee === a ? 'selected' : ''}`}
                    onClick={() => setSingleFilter('assignee', a)}
                  >
                    {filters.assignee === a && <FiCheck />} {a}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            {availableTags.length > 0 && (
              <div className="filter-group-advanced">
                <label>Tags</label>
                <div className="filter-options-grid">
                  {availableTags.map(t => (
                    <button 
                      key={t} 
                      className={`filter-chip-btn ${filters.tags.includes(t) ? 'selected' : ''}`}
                      onClick={() => toggleArrayFilter('tags', t)}
                    >
                      {filters.tags.includes(t) && <FiCheck />} {t}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="filter-panel-footer">
            <button className="btn-secondary" onClick={clearAll}>Clear All</button>
            <button className="btn-primary" onClick={() => setIsOpen(false)}>Apply</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskFilters;
