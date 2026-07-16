import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import LogoutConfirmationModal from '../LogoutModal/LogoutConfirmationModal';
import { FiHome, FiCheckSquare, FiCalendar, FiPieChart, FiSettings, FiLogOut, FiUsers, FiFileText, FiBell } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { useRole } from '../../context/RoleContext';
import { getDisplayName } from '../../utils/userUtils';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const { canViewAnalytics, role } = useRole();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <FiHome />, show: true },
    { name: 'My Tasks', path: '/tasks', icon: <FiCheckSquare />, show: true },
    { name: 'Organizations', path: '/organizations', icon: <FiUsers />, show: true },
    { name: 'Teams', path: '/teams', icon: <FiUsers />, show: true },
    { name: 'Calendar', path: '/calendar', icon: <FiCalendar />, show: true },
    { name: 'Analytics', path: '/analytics', icon: <FiPieChart />, show: canViewAnalytics() },
    { name: 'Reports', path: '/reports', icon: <FiFileText />, show: canViewAnalytics() },
    { name: 'Notifications', path: '/notifications', icon: <FiBell />, show: true },
    { name: 'Settings', path: '/settings', icon: <FiSettings />, show: true },
  ];

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const displayName = getDisplayName(user);
  const displayEmail = user?.email || '';
  const displayAvatar = user?.profile_image || '';

  return (
    <aside className="sidebar glass">
      <div className="logo-section">
        <div className="logo-icon">TF</div>
        <h2>TaskFlow</h2>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {menuItems.filter(item => item.show).map((item) => (
            <li key={item.name}>
              <Link 
                to={item.path} 
                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              >
                <span className="icon">{item.icon}</span>
                <span className="text">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <Link to="/profile" className="user-profile-card-link" aria-label="View user profile">
          <div className="user-profile">
            <div className="avatar">
              {displayAvatar ? (
                <img src={displayAvatar} alt={displayName} className="avatar-img" />
              ) : (
                <span className="avatar-initials">{getInitials(displayName)}</span>
              )}
            </div>
            <div className="user-info">
              <span className="user-name" title={displayName}>{displayName}</span>
              <span className="user-email" title={displayEmail}>{displayEmail}</span>
              {role && <span className="user-role-badge">{role}</span>}
            </div>
          </div>
        </Link>
        <button className="logout-btn" onClick={() => setIsLogoutModalOpen(true)}>
          <FiLogOut />
          <span>Logout</span>
        </button>
      </div>
      <LogoutConfirmationModal 
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={logout}
      />
    </aside>
  );
};

export default Sidebar;
