import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiMail, FiPhone, FiInfo, FiBriefcase, FiGlobe, 
  FiArrowLeft, FiEdit3, FiLock, FiCheckSquare, FiClock 
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { useRole } from '../../context/RoleContext';
import organizationService from '../../services/organizationService';
import taskService from '../../services/taskService';
import { getFullName } from '../../utils/userUtils';
import './Profile.css';

export default function Profile() {
  const { user } = useAuth();
  const { role } = useRole();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    jobTitle: '',
    bio: '',
    location: '',
    avatar: '',
  });

  const [orgName, setOrgName] = useState('Acme Corporation');
  const [teamName, setTeamName] = useState('Product Engineering');
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const defaults = {
      fullName: getFullName(user),
      username: user.username || '',
      email: user.email || '',
      phone: user.profile?.phone_number || '',
      jobTitle: user.profile?.job_title || '',
      bio: user.profile?.bio || '',
      location: user.profile?.location || '',
      avatar: user.profile_image || '',
    };

    // Load profile from local storage if exists
    const stored = localStorage.getItem('profile_settings_' + user.email);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setProfileData({
          fullName: parsed.fullName || defaults.fullName,
          username: parsed.username || defaults.username,
          email: parsed.email || defaults.email,
          phone: parsed.phone || '',
          jobTitle: parsed.jobTitle || '',
          bio: parsed.bio || '',
          location: parsed.location || '',
          avatar: parsed.avatar || defaults.avatar,
        });
      } catch (e) {
        console.error(e);
        setProfileData(defaults);
      }
    } else {
      setProfileData(defaults);
    }

    // Load orgs & tasks
    const loadProfileStats = async () => {
      try {
        const [orgs, tasks, activityRes] = await Promise.all([
          organizationService.getOrganizations(),
          taskService.getTasks(),
          taskService.getActivityHistory()
        ]);
        
        if (orgs && orgs.length > 0) {
          setOrgName(orgs[0].name);
        }
        
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const pending = total - completed;
        setStats({ total, completed, pending });
        setActivities(activityRes.slice(0, 5));
      } catch (error) {
        console.error("Error loading profile details", error);
      } finally {
        setLoading(false);
      }
    };
    loadProfileStats();
  }, [user]);

  const handleEditProfile = () => {
    navigate('/settings?section=profile');
  };

  const handleChangePassword = () => {
    navigate('/settings?section=account');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div className="profile-page page-content animate-fade-in">
      <header className="profile-header animate-slide-up">
        <button className="btn-back glass" onClick={() => navigate(-1)} aria-label="Go back">
          <FiArrowLeft /> Back
        </button>
        <div className="header-titles">
          <h1>User Profile</h1>
          <p>View your account stats, role, and details.</p>
        </div>
      </header>

      <div className="profile-container animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="profile-sidebar-card glass-card">
          <div className="profile-avatar-large">
            {profileData.avatar ? (
              <img src={profileData.avatar} alt="Profile Avatar" />
            ) : (
              <div className="avatar-initials-large">
                {getInitials(profileData.fullName || profileData.username)}
              </div>
            )}
          </div>
          
          <h2 className="profile-name">{profileData.fullName || profileData.username}</h2>
          <p className="profile-role-badge">{profileData.jobTitle || role || 'Member'}</p>
          <p className="profile-location">{profileData.location || 'Location not set'}</p>
          
          <div className="profile-action-buttons">
            <button className="btn-edit-profile btn-primary" onClick={handleEditProfile}>
              <FiEdit3 /> Edit Profile
            </button>
            <button className="btn-change-password btn-sec" onClick={handleChangePassword}>
              <FiLock /> Change Password
            </button>
          </div>
        </div>

        <div className="profile-main-content">
          <div className="stats-mini-grid">
            <div className="stat-mini-card glass-card">
              <span className="stat-icon primary"><FiCheckSquare /></span>
              <div className="stat-details">
                <h3>{loading ? '-' : stats.total}</h3>
                <p>Assigned Tasks</p>
              </div>
            </div>
            <div className="stat-mini-card glass-card">
              <span className="stat-icon success"><FiCheckSquare /></span>
              <div className="stat-details">
                <h3>{loading ? '-' : stats.completed}</h3>
                <p>Completed Tasks</p>
              </div>
            </div>
            <div className="stat-mini-card glass-card">
              <span className="stat-icon warning"><FiClock /></span>
              <div className="stat-details">
                <h3>{loading ? '-' : stats.pending}</h3>
                <p>Pending Tasks</p>
              </div>
            </div>
          </div>

          <div className="profile-details-card glass-card">
            <h3>About & Organization</h3>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-icon"><FiMail /></span>
                <div className="detail-content">
                  <label>Email Address</label>
                  <span>{profileData.email || 'Email not set'}</span>
                </div>
              </div>
              <div className="detail-item">
                <span className="detail-icon"><FiPhone /></span>
                <div className="detail-content">
                  <label>Phone Number</label>
                  <span>{profileData.phone || 'Phone not set'}</span>
                </div>
              </div>
              <div className="detail-item">
                <span className="detail-icon"><FiBriefcase /></span>
                <div className="detail-content">
                  <label>Organization</label>
                  <span>{orgName}</span>
                </div>
              </div>
              <div className="detail-item">
                <span className="detail-icon"><FiGlobe /></span>
                <div className="detail-content">
                  <label>Team</label>
                  <span>{teamName}</span>
                </div>
              </div>
              <div className="detail-item full-width">
                <span className="detail-icon"><FiInfo /></span>
                <div className="detail-content">
                  <label>Bio</label>
                  <span>{profileData.bio || 'No bio description provided yet.'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-activity-card glass-card">
            <h3>Recent Activity History</h3>
            {loading ? (
              <p>Loading activities...</p>
            ) : activities.length > 0 ? (
              <ul className="profile-activity-list">
                {activities.map(act => (
                  <li key={act.id} className="profile-activity-item">
                    <span className="activity-dot" />
                    <div className="activity-info">
                      <p>{act.action}</p>
                      <span className="activity-time">{new Date(act.timestamp).toLocaleString()}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-activity">No recent task activity recorded.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
