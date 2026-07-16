import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiSettings, FiHelpCircle, FiCommand, FiLogOut, FiUser } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { getDisplayName } from '../../utils/userUtils';
import LogoutConfirmationModal from '../LogoutModal/LogoutConfirmationModal';
import KeyboardShortcutsModal from './KeyboardShortcutsModal';
import HelpCenterModal from './HelpCenterModal';
import './ProfileDropdown.css';
import { useNavigate } from 'react-router-dom';

const ProfileDropdown = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
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

  if (!user) return null;

  const fullName = getDisplayName(user);
  const firstName = fullName.split(' ')[0] || 'User';
  const initial = firstName.charAt(0).toUpperCase();

  const handleNavigate = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div className="profile-wrapper" ref={dropdownRef}>
      <button 
        className="profile-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <div className="profile-avatar">{initial}</div>
        <span className="profile-name">{firstName}</span>
        <FiChevronDown className={`dropdown-arrow ${isOpen ? 'open' : ''}`} />
      </button>

      {isOpen && (
        <div className="profile-dropdown-menu nav-glass-dropdown nav-slide-down">
          <div className="pd-header">
            <strong>{fullName}</strong>
            <span className="pd-email">{user.email}</span>
          </div>
          <div className="pd-divider"></div>
          
          <button className="pd-item" onClick={() => handleNavigate('/profile')}>
            <FiUser /> Profile
          </button>
          <button className="pd-item" onClick={() => handleNavigate('/settings')}>
            <FiSettings /> Settings
          </button>
          <button className="pd-item" onClick={() => { setIsOpen(false); setIsHelpOpen(true); }}>
            <FiHelpCircle /> Help Center
          </button>
          <button className="pd-item" onClick={() => { setIsOpen(false); setIsShortcutsOpen(true); }}>
            <FiCommand /> Keyboard Shortcuts
          </button>
          
          <div className="pd-divider"></div>
          
          <button 
            className="pd-item pd-danger" 
            onClick={() => {
              setIsOpen(false);
              setIsLogoutModalOpen(true);
            }}
          >
            <FiLogOut /> Logout
          </button>
        </div>
      )}

      <LogoutConfirmationModal 
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={logout}
      />
      <KeyboardShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />
      <HelpCenterModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
};

export default React.memo(ProfileDropdown);
