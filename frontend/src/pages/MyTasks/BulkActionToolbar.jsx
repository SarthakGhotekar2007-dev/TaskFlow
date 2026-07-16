import React from 'react';
import { FiCheckSquare, FiArchive, FiTrash2, FiX } from 'react-icons/fi';
import './MyTasks.css';

const BulkActionToolbar = ({ selectedCount, onClearSelection, onBulkComplete, onBulkArchive, onBulkDelete, isProcessing }) => {
  if (selectedCount === 0) return null;

  return (
    <div className="bulk-action-toolbar animate-slide-up">
      <div className="bulk-toolbar-content glass">
        <div className="bulk-selection-info">
          <span className="bulk-count-badge">{selectedCount}</span>
          <span className="bulk-count-text">task{selectedCount > 1 ? 's' : ''} selected</span>
        </div>
        <div className="bulk-actions">
          <button 
            className="bulk-action-btn" 
            onClick={onBulkComplete}
            disabled={isProcessing}
            title="Mark Complete"
          >
            <FiCheckSquare /> <span>Complete</span>
          </button>
          <button 
            className="bulk-action-btn" 
            onClick={onBulkArchive}
            disabled={isProcessing}
            title="Archive"
          >
            <FiArchive /> <span>Archive</span>
          </button>
          <button 
            className="bulk-action-btn delete" 
            onClick={onBulkDelete}
            disabled={isProcessing}
            title="Delete"
          >
            <FiTrash2 /> <span>Delete</span>
          </button>
          <div className="bulk-divider" />
          <button 
            className="icon-btn-small" 
            onClick={onClearSelection}
            disabled={isProcessing}
            aria-label="Clear selection"
          >
            <FiX />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkActionToolbar;
