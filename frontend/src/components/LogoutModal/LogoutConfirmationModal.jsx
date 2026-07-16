import React, { useEffect, useRef } from 'react';
import { FiLogOut, FiX } from 'react-icons/fi';
import './LogoutConfirmationModal.css';

export default function LogoutConfirmationModal({ isOpen, onClose, onConfirm }) {
  const modalRef = useRef(null);
  const cancelBtnRef = useRef(null);
  const [loading, setLoading] = React.useState(false);

  // Focus trap and accessibility keyboard events
  useEffect(() => {
    if (isOpen) {
      // Focus the cancel button on mount
      setTimeout(() => {
        cancelBtnRef.current?.focus();
      }, 50);

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
        
        // Focus trap logic
        if (e.key === 'Tab') {
          const focusableElements = modalRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusableElements && focusableElements.length > 0) {
            const first = focusableElements[0];
            const last = focusableElements[focusableElements.length - 1];
            
            if (e.shiftKey) {
              if (document.activeElement === first) {
                last.focus();
                e.preventDefault();
              }
            } else {
              if (document.activeElement === last) {
                first.focus();
                e.preventDefault();
              }
            }
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLogoutSubmit = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="logout-modal-overlay" 
      onClick={handleBackdropClick}
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="logout-modal-title"
      aria-describedby="logout-modal-desc"
    >
      <div className="logout-modal-card glass animate-scale-in" ref={modalRef}>
        <button 
          type="button" 
          className="logout-modal-close-btn" 
          onClick={onClose} 
          aria-label="Close modal"
          disabled={loading}
        >
          <FiX />
        </button>

        <div className="logout-modal-content">
          <div className="logout-modal-icon-wrapper">
            <FiLogOut className="logout-modal-icon" />
          </div>
          
          <h3 id="logout-modal-title">Confirm Logout</h3>
          <p id="logout-modal-desc">
            Are you sure you want to log out? <br />
            You will need to sign in again to access your workspace.
          </p>
        </div>

        <div className="logout-modal-footer">
          <button 
            type="button" 
            className="btn-cancel" 
            onClick={onClose} 
            ref={cancelBtnRef}
            disabled={loading}
          >
            Cancel
          </button>
          
          <button 
            type="button" 
            className="btn-logout-confirm" 
            onClick={handleLogoutSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-mini" /> Logging out...
              </>
            ) : (
              'Logout'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
