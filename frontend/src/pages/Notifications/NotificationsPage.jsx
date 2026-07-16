import React from 'react';
import { FiBell, FiCheckCircle } from 'react-icons/fi';

const NotificationsPage = () => {
  const notifications = [
    { id: 1, type: 'info', message: 'Welcome to TaskFlow! Your account is fully set up.', date: 'Just now' },
    { id: 2, type: 'success', message: 'You completed "Build Authentication"!', date: '2 hours ago' },
    { id: 3, type: 'warning', message: 'Task "Design Landing Page" is due tomorrow.', date: '5 hours ago' },
  ];

  return (
    <div className="page-content animate-fade-in">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><FiBell /> Notifications</h1>
        <button className="btn" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiCheckCircle /> Mark All as Read
        </button>
      </header>

      <div className="glass" style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {notifications.length === 0 ? (
          <p style={{ color: '#6b7280', textAlign: 'center' }}>No new notifications.</p>
        ) : (
          notifications.map(notif => (
            <div key={notif.id} style={{ 
              display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px', 
              background: 'rgba(255,255,255,0.6)', borderRadius: '12px', borderLeft: `4px solid ${
                notif.type === 'success' ? '#10b981' : notif.type === 'warning' ? '#f59e0b' : '#3b82f6'
              }`
            }}>
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 4px 0', color: '#1f2937' }}>{notif.message}</p>
                <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{notif.date}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
