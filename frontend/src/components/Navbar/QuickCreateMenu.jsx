import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiCheckSquare, FiUsers, FiBriefcase, FiUserPlus } from 'react-icons/fi';
import './QuickCreate.css';
const QuickCreateMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const handleAction = (action) => {
    setIsOpen(false);
    if (action === 'task') {
      navigate('/tasks', { state: { openModal: true } });
    } else if (action === 'team') {
      navigate('/teams', { state: { openModal: true } });
    } else if (action === 'organization') {
      navigate('/organizations', { state: { openModal: true } });
    } else if (action === 'invite') {
      navigate('/settings?section=workspace', { state: { openInvite: true } });
    }
  };

  return (
    <div className="quick-create-wrapper" ref={dropdownRef}>
      <button 
        className="nav-btn-gradient ripple-btn" 
        title="Quick Create"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Quick Create"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <FiPlus className="qc-icon" />
        <span>Create</span>
      </button>

      {isOpen && (
        <div className="quick-create-dropdown nav-glass-dropdown nav-slide-down">
          <button className="qc-item" onClick={() => handleAction('task')}>
            <FiCheckSquare /> New Task
          </button>
          <button className="qc-item" onClick={() => handleAction('team')}>
            <FiUsers /> New Team
          </button>
          <button className="qc-item" onClick={() => handleAction('organization')}>
            <FiBriefcase /> New Organization
          </button>
          <button className="qc-item" onClick={() => handleAction('invite')}>
            <FiUserPlus /> Invite Member
          </button>
        </div>
      )}
    </div>
  );
};

export default React.memo(QuickCreateMenu);
