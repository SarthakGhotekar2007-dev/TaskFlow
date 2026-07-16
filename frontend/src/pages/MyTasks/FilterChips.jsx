import React from 'react';
import { FiX } from 'react-icons/fi';
import './TaskControls.css';

const FilterChips = ({ filters, onRemoveFilter }) => {
  const chips = [];

  // Arrays
  ['priority', 'status', 'dueDate', 'tags'].forEach(category => {
    if (Array.isArray(filters[category])) {
      filters[category].forEach(val => {
        chips.push({ category, value: val, label: val });
      });
    }
  });

  // Singles
  if (filters.assignee && filters.assignee !== 'Everyone') {
    chips.push({ category: 'assignee', value: filters.assignee, label: `Assignee: ${filters.assignee}` });
  }

  if (chips.length === 0) return null;

  return (
    <div className="filter-chips-row animate-fade-in">
      {chips.map((chip, index) => (
        <div key={`${chip.category}-${chip.value}-${index}`} className="filter-chip">
          <span>{chip.label}</span>
          <button 
            className="chip-remove-btn" 
            onClick={() => onRemoveFilter(chip.category, chip.value)}
            aria-label={`Remove filter ${chip.label}`}
          >
            <FiX />
          </button>
        </div>
      ))}
    </div>
  );
};

export default FilterChips;
