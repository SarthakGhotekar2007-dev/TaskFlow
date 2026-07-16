import React from 'react';
import { FiX } from 'react-icons/fi';
import './KeyboardShortcutsModal.css';

const KeyboardShortcutsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h2>Keyboard Shortcuts</h2>
          <button className="btn-icon" onClick={onClose}><FiX /></button>
        </div>
        <div className="shortcuts-list">
          <div className="shortcut-item">
            <span>New Task</span>
            <kbd>C</kbd>
          </div>
          <div className="shortcut-item">
            <span>Search</span>
            <span><kbd>Ctrl</kbd> + <kbd>K</kbd></span>
          </div>
          <div className="shortcut-item">
            <span>Go to Dashboard</span>
            <span><kbd>G</kbd> then <kbd>D</kbd></span>
          </div>
          <div className="shortcut-item">
            <span>Close Modal</span>
            <kbd>Esc</kbd>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsModal;
