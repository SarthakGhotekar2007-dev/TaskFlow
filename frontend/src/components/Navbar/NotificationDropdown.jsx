import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FiBell, FiCheck, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import notificationService from '../../services/notificationService';
import wsService from '../../services/websocket';
import './NotificationDropdown.css';

const NotificationDropdown = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data || []);
    } catch (err) {
      console.error(err);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    const handleWsEvent = (data) => {
      if (['task_assigned', 'task_updated', 'task_completed'].includes(data.event)) {
        fetchNotifications();
      }
    };
    wsService.addListener(handleWsEvent);
    return () => wsService.removeListener(handleWsEvent);
  }, [fetchNotifications]);

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

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.readNotification(id);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.readAllNotifications();
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="notification-wrapper" ref={dropdownRef}>
      <button 
        className="nav-icon-btn ripple-btn" 
        title="Notifications" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <FiBell className={unreadCount > 0 ? 'ringing' : ''} />
        {unreadCount > 0 && <span className="notification-badge bounce-in">{unreadCount}</span>}
      </button>
      
      {isOpen && (
        <div className="notification-drawer nav-glass-dropdown nav-slide-down">
          <div className="drawer-header">
            <h3>Notifications</h3>
            <button className="text-btn-small" onClick={handleMarkAllRead}>Mark all as read</button>
          </div>
          <div className="drawer-body">
            {notifications.length === 0 ? (
              <div className="empty-state">
                <FiBell className="empty-icon" />
                <p>No new notifications</p>
              </div>
            ) : (
              notifications.map(n => (
                <div key={n.id} className={`notification-card ${!n.is_read ? 'unread-card' : ''}`}>
                  <div className="notif-content">
                    <strong>{n.title}</strong>
                    <p>{n.message}</p>
                    <span className="notif-time">{new Date(n.created_at).toLocaleString()}</span>
                  </div>
                  <div className="notif-actions">
                    {!n.is_read && (
                      <button title="Mark as read" onClick={() => handleMarkAsRead(n.id)}><FiCheck /></button>
                    )}
                    <button title="Delete" onClick={() => handleDeleteNotification(n.id)}><FiTrash2 /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(NotificationDropdown);
