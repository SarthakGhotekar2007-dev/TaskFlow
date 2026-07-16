import React, { useState, useEffect } from 'react';
import { FiCheckCircle, FiClock, FiAlertCircle, FiTrendingUp, FiArrowRight, FiArrowDown, FiUser } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import taskService from '../../services/taskService';
import ActivityTimeline from '../../components/ActivityTimeline/ActivityTimeline';
import { getDisplayName } from '../../utils/userUtils';
import './Dashboard.css';

const StatCard = ({ title, value, icon, colorClass }) => (
  <div className={`stat-card ${colorClass}`}>
    <div className="stat-icon-wrapper">{icon}</div>
    <div className="stat-details">
      <h3>{value}</h3>
      <p>{title}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, highPriority: 0, mediumPriority: 0, lowPriority: 0 });
  const [activities, setActivities] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [tasksRes, activityRes] = await Promise.all([
          taskService.getTasks(),
          taskService.getActivityHistory()
        ]);
        
        const total = tasksRes.length;
        const completed = tasksRes.filter(t => t.completed).length;
        const pending = total - completed;
        const highPriority = tasksRes.filter(t => t.priority === 'High' && !t.completed).length;
        const mediumPriority = tasksRes.filter(t => t.priority === 'Medium' && !t.completed).length;
        const lowPriority = tasksRes.filter(t => t.priority === 'Low' && !t.completed).length;
        
        setStats({ total, completed, pending, highPriority, mediumPriority, lowPriority });
        setActivities(activityRes.slice(0, 5));
        
        // Filter upcoming tasks by due date and not completed
        const sortedUpcoming = tasksRes
          .filter(t => !t.completed && t.due_date)
          .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
          .slice(0, 5);
        setUpcoming(sortedUpcoming);
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
    
    const handleRefresh = () => fetchDashboardData();
    window.addEventListener('refresh-tasks', handleRefresh);
    return () => window.removeEventListener('refresh-tasks', handleRefresh);
  }, []);
  
  // Get current date string
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const currentDate = new Date().toLocaleDateString(undefined, dateOptions);

  return (
    <div className="dashboard-page page-content">
      <header className="dashboard-header animate-slide-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div className="dashboard-avatar" style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
            {user?.profile_image ? (
              <img src={user.profile_image} alt={getDisplayName(user)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <FiUser size={30} />
            )}
          </div>
          <div>
            <h1 className="welcome-text">Good Morning, {getDisplayName(user)} 👋</h1>
            <p className="date-text" style={{ margin: '5px 0' }}>{user?.email}</p>
            <p className="date-text">{currentDate}</p>
          </div>
        </div>
        <div className="productivity-badge glass">
          <FiTrendingUp className="icon" />
          <span>Productivity Score: <strong>{stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%</strong></span>
        </div>
      </header>

      <section className="stats-grid animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <StatCard 
          title="Total Tasks" 
          value={loading ? '-' : stats.total} 
          icon={<FiCheckCircle />} 
          colorClass="primary-card" 
        />
        <StatCard 
          title="Completed" 
          value={loading ? '-' : stats.completed} 
          icon={<FiCheckCircle />} 
          colorClass="success-card" 
        />
        <StatCard 
          title="Pending" 
          value={loading ? '-' : stats.pending} 
          icon={<FiClock />} 
          colorClass="warning-card" 
        />
        <StatCard 
          title="High Priority" 
          value={loading ? '-' : stats.highPriority} 
          icon={<FiAlertCircle />} 
          colorClass="danger-card" 
        />
        <StatCard 
          title="Medium Priority" 
          value={loading ? '-' : stats.mediumPriority} 
          icon={<FiArrowRight />} 
          colorClass="info-card" 
        />
        <StatCard 
          title="Low Priority" 
          value={loading ? '-' : stats.lowPriority} 
          icon={<FiArrowDown />} 
          colorClass="secondary-card" 
        />
      </section>

      <section className="dashboard-content animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <ActivityTimeline />

        <div className="content-card glass upcoming-tasks">
          <div className="card-header">
            <h2>Upcoming Tasks</h2>
            <button className="btn-text">View All</button>
          </div>
          {loading ? <p>Loading...</p> : upcoming.length > 0 ? (
            <ul className="upcoming-list">
              {upcoming.map(task => (
                <li key={task.id} className="upcoming-item">
                  <strong>{task.title}</strong> - Due: {new Date(task.due_date).toLocaleDateString()}
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">
              <p>No upcoming tasks. You are all caught up!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
