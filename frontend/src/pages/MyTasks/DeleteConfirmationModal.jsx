import React, { useEffect, useRef } from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';
import './MyTasks.css'; // Relies on global modal styles but adds specifics

const DeleteConfirmationModal = ({ task, onConfirm, onCancel, isDeleting }) => {
  const cancelBtnRef = useRef(null);

  useEffect(() => {
    // Focus the cancel button automatically to prevent accidental deletion
    if (cancelBtnRef.current) {
      cancelBtnRef.current.focus();
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  if (!task) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="delete-dialog-title" onClick={onCancel}>
      <div className="modal-content glass delete-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px' }}>
        <div className="delete-modal-header">
          <div className="warning-icon-wrapper">
            <FiAlertTriangle className="warning-icon" />
          </div>
          <button className="icon-btn-small" onClick={onCancel} aria-label="Cancel deletion">
            <FiX />
          </button>
        </div>
        
        <div className="delete-modal-body">
          <h2 id="delete-dialog-title">Delete Task?</h2>
          <p>
            Are you sure you want to delete <strong>"{task.title}"</strong>? 
            This action cannot be undone and will permanently remove this task, its comments, and attachments.
          </p>
        </div>

        <div className="delete-modal-footer">
          <button 
            type="button" 
            className="btn-secondary" 
            onClick={onCancel}
            disabled={isDeleting}
            ref={cancelBtnRef}
          >
            Cancel
          </button>
          <button 
            type="button" 
            className="btn-danger" 
            onClick={() => onConfirm(task.id)}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Task'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
