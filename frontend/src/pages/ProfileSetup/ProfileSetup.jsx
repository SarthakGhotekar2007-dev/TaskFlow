import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCamera, FiUpload, FiTrash2, FiUser, FiBriefcase, FiMapPin, FiGlobe, FiClock } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { getFullName } from '../../utils/userUtils';
import { toast } from 'react-toastify';
import api from '../../services/api';
import ThemeToggle from '../../components/ThemeToggle/ThemeToggle';
import './ProfileSetup.css';

export default function ProfileSetup() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: getFullName(user) !== 'User' ? getFullName(user) : '',
    phone: '',
    jobTitle: '',
    location: '',
    bio: '',
    avatar: user?.profile_image || '',
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be under 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange('avatar', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    handleChange('avatar', '');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!formData.fullName.trim()) {
      toast.error('Full name is required');
      return;
    }

    setSaving(true);
    try {
      // 1. Save profile details to database
      await api.put('/profile', {
        full_name: formData.fullName,
        phone_number: formData.phone,
        job_title: formData.jobTitle,
        location: formData.location,
        bio: formData.bio,
        profile_image: formData.avatar,
      });

      // 2. Also save to user-scoped profile_settings in localStorage to sync local details
      localStorage.setItem('profile_settings_' + user.email, JSON.stringify({
        fullName: formData.fullName,
        username: formData.username || user.username,
        email: user.email,
        phone: formData.phone,
        jobTitle: formData.jobTitle,
        bio: formData.bio,
        location: formData.location,
        avatar: formData.avatar,
      }));

      // 3. Theme preference is handled by ThemeContext now

      // 4. Update auth context user
      if (updateUser) {
        updateUser({
          ...user,
          name: formData.fullName,
          profile_image: formData.avatar,
          profile_completed: true,
        });
      }

      toast.success('Profile setup completed successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    setSaving(true);
    try {
      // Just mark profile completed on the backend
      await api.put('/profile', {
        full_name: user?.name || user?.username || 'User',
      });

      // Set user completed
      if (updateUser) {
        updateUser({
          ...user,
          profile_completed: true,
        });
      }
      toast.info('Profile setup skipped');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Failed to complete onboarding');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="setup-container animate-fade-in">
      <ThemeToggle />
      <div className="setup-card glass animate-scale-in">
        <div className="setup-header">
          <div className="logo-icon">TF</div>
          <h2>Set Up Your Profile</h2>
          <p>Let's personalize your task management workspace.</p>
        </div>

        <form onSubmit={handleSave} className="setup-form">
          {/* Avatar Upload */}
          <div className="setup-avatar-section">
            <div className="setup-avatar-preview">
              {formData.avatar ? (
                <img src={formData.avatar} alt="Avatar preview" />
              ) : (
                <div className="setup-avatar-placeholder">
                  <FiUser />
                </div>
              )}
            </div>
            
            <div className="setup-avatar-actions">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarChange} 
                accept="image/png, image/jpeg, image/webp" 
                style={{ display: 'none' }}
              />
              <button 
                type="button" 
                className="btn-upload" 
                onClick={() => fileInputRef.current?.click()}
                disabled={saving}
              >
                <FiUpload /> Upload Image
              </button>
              {formData.avatar && (
                <button 
                  type="button" 
                  className="btn-remove" 
                  onClick={handleRemoveAvatar}
                  disabled={saving}
                >
                  <FiTrash2 /> Remove
                </button>
              )}
              <span className="file-info">Support: JPG, PNG, WEBP (Max 2MB)</span>
            </div>
          </div>

          <div className="setup-grid">
            <div className="form-group">
              <label htmlFor="fullName">Full Name <span className="required-star">*</span></label>
              <div className="input-with-icon">
                <FiUser className="input-icon" />
                <input 
                  type="text" 
                  id="fullName" 
                  placeholder="Enter full name" 
                  value={formData.fullName} 
                  onChange={e => handleChange('fullName', e.target.value)} 
                  required
                  disabled={saving}
                />
              </div>
            </div>



            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input 
                type="text" 
                id="phone" 
                placeholder="+91 (000) 000-0000" 
                value={formData.phone} 
                onChange={e => handleChange('phone', e.target.value)} 
                disabled={saving}
              />
            </div>

            <div className="form-group">
              <label htmlFor="jobTitle">Job Title</label>
              <div className="input-with-icon">
                <FiBriefcase className="input-icon" />
                <input 
                  type="text" 
                  id="jobTitle" 
                  placeholder="Enter job title" 
                  value={formData.jobTitle} 
                  onChange={e => handleChange('jobTitle', e.target.value)} 
                  disabled={saving}
                />
              </div>
            </div>



            <div className="form-group">
              <label htmlFor="location">Location</label>
              <div className="input-with-icon">
                <FiMapPin className="input-icon" />
                <input 
                  type="text" 
                  id="location" 
                  placeholder="Enter location" 
                  value={formData.location} 
                  onChange={e => handleChange('location', e.target.value)} 
                  disabled={saving}
                />
              </div>
            </div>



            <div className="form-group full-width">
              <label htmlFor="bio">Bio</label>
              <textarea 
                id="bio" 
                rows="3" 
                placeholder="Tell us a bit about yourself..." 
                value={formData.bio} 
                onChange={e => handleChange('bio', e.target.value)} 
                disabled={saving}
              />
            </div>
          </div>

          <div className="setup-actions">
            <button 
              type="button" 
              className="btn-skip" 
              onClick={handleSkip} 
              disabled={saving}
            >
              Skip For Now
            </button>
            <button 
              type="submit" 
              className="btn-primary btn-save" 
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save & Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
