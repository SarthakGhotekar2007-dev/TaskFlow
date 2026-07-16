import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FiCheckCircle, FiEdit2, FiTrash2, FiPlusCircle, FiUserCheck, FiLogOut, FiActivity } from 'react-icons/fi';
import './ActivityTimeline.css';

const ActivityTimeline = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    try {
      const response = await api.get('/activity');
      setActivities(response.data);
    } catch (error) {
      console.error('Failed to fetch activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
    // Listening to global events or websockets would trigger this again
    const handleRefresh = () => fetchActivities();
    window.addEventListener('refresh-activities', handleRefresh);
    return () => window.removeEventListener('refresh-activities', handleRefresh);
  }, []);

  const getIconForAction = (action) => {
    const act = action.toLowerCase();
    if (act.includes('created')) return <FiPlusCircle className="timeline-icon created" />;
    if (act.includes('updated')) return <FiEdit2 className="timeline-icon updated" />;
    if (act.includes('deleted')) return <FiTrash2 className="timeline-icon deleted" />;
    if (act.includes('completed')) return <FiCheckCircle className="timeline-icon completed" />;
    if (act.includes('login')) return <FiUserCheck className="timeline-icon login" />;
    if (act.includes('logout')) return <FiLogOut className="timeline-icon logout" />;
    return <FiActivity className="timeline-icon default" />;
  };

  // Group activities by date
  const groupedActivities = activities.reduce((acc, log) => {
    const date = new Date(log.created_at).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {});

  if (loading) {
    return <div className="activity-timeline glass"><p>Loading activities...</p></div>;
  }

  return (
    <div className="activity-timeline glass">
      <div className="timeline-header">
        <h3>Recent Activity</h3>
      </div>
      <div className="timeline-content">
        {Object.keys(groupedActivities).length === 0 ? (
          <p className="no-activity">No recent activity found.</p>
        ) : (
          Object.keys(groupedActivities).map((date) => (
            <div key={date} className="timeline-group">
              <div className="timeline-date">{date}</div>
              {groupedActivities[date].map((log) => (
                <div key={log.id} className="timeline-item">
                  <div className="timeline-marker">
                    {getIconForAction(log.action)}
                    <div className="timeline-line"></div>
                  </div>
                  <div className="timeline-details">
                    <span className="timeline-time">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <h4 className="timeline-action">{log.action}</h4>
                    {log.description && <p className="timeline-desc">{log.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityTimeline;
