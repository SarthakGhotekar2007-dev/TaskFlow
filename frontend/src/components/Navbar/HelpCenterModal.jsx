import React from 'react';
import { FiX, FiExternalLink, FiMessageCircle, FiBook } from 'react-icons/fi';

const HelpCenterModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <h2>Help Center</h2>
          <button className="btn-icon" onClick={onClose}><FiX /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '10px' }}>
          <button className="btn-secondary" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px' }} onClick={() => alert("Documentation coming soon!")}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><FiBook /> Documentation</span>
            <FiExternalLink />
          </button>
          <button className="btn-secondary" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px' }} onClick={() => alert("Contact Support coming soon!")}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><FiMessageCircle /> Contact Support</span>
            <FiExternalLink />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpCenterModal;
