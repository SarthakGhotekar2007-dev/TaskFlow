import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  FiUser, FiLock, FiSliders, FiBell, FiGlobe, 
  FiShield, FiBriefcase, FiLink, FiCpu, 
  FiSettings, FiInfo, FiAlertTriangle, FiMenu, FiX,
  FiCamera, FiSmartphone, FiMonitor, FiLogOut, FiAlertCircle,
  FiCalendar, FiMessageSquare, FiFileText, FiGithub, FiSlack,
  FiEye, FiEyeOff, FiUsers
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { toast } from 'react-toastify';
import { getFullName } from '../../utils/userUtils';
import './Settings.css';

const sections = [
  {
    id: 'profile',
    title: 'Profile',
    icon: <FiUser />,
    cardTitle: 'Profile Settings',
    description: 'Update your personal details, avatar, and public profile information.',
    status: 'Ready',
  },
  {
    id: 'account',
    title: 'Account',
    icon: <FiLock />,
    cardTitle: 'Account Security',
    description: 'Manage your password, multi-factor authentication, and account access.',
    status: 'Ready',
  },
  {
    id: 'appearance',
    title: 'Appearance',
    icon: <FiSliders />,
    cardTitle: 'Appearance & Theme',
    description: 'Customize your interface theme, layout density, and color accents.',
    status: 'Ready',
  },
  {
    id: 'notifications',
    title: 'Notifications',
    icon: <FiBell />,
    cardTitle: 'Notification Preferences',
    description: 'Control how and when you receive email, push, and in-app alerts.',
    status: 'Ready',
  },
  {
    id: 'language',
    title: 'Language & Region',
    icon: <FiGlobe />,
    cardTitle: 'Language & Region Settings',
    description: 'Set your preferred language, timezone, date format, and currency.',
    status: 'Ready',
  },
  {
    id: 'privacy',
    title: 'Privacy',
    icon: <FiShield />,
    cardTitle: 'Privacy & Data Protection',
    description: 'Manage data sharing, tracking preferences, and export your personal information.',
    status: 'Ready',
  },
  {
    id: 'workspace',
    title: 'Workspace',
    icon: <FiBriefcase />,
    cardTitle: 'Workspace Settings',
    description: 'Configure workspace name, logo, member roles, and default permissions.',
    status: 'Ready',
  },
  {
    id: 'integrations',
    title: 'Integrations',
    icon: <FiLink />,
    cardTitle: 'Integrations & Third-party Apps',
    description: 'Connect with external tools like GitHub, Slack, Jira, and Figma.',
    status: 'Ready',
  },
  {
    id: 'ai-preferences',
    title: 'AI Preferences',
    icon: <FiCpu />,
    cardTitle: 'AI Assistance Preferences',
    description: 'Configure AI autocomplete, auto-summary behavior, and model parameters.',
    status: 'Ready',
  },
  {
    id: 'system',
    title: 'System',
    icon: <FiSettings />,
    cardTitle: 'System & Diagnostics',
    description: 'View system logs, API rate limits, storage usage, and network health.',
    status: 'Coming Soon',
  },
  {
    id: 'about',
    title: 'About',
    icon: <FiInfo />,
    cardTitle: 'About TaskFlow',
    description: 'Version details, release notes, license agreements, and system updates.',
    status: 'Ready',
  },
  {
    id: 'danger-zone',
    title: 'Danger Zone',
    icon: <FiAlertTriangle />,
    cardTitle: 'Danger Zone Operations',
    description: 'Delete your account, transfer ownership, or wipe your workspace data.',
    status: 'Ready',
    isDanger: true,
  },
];

export default function Settings() {
  const { user, updateUser } = useAuth();
  const { darkMode, toggleTheme, setDarkMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [activeSection, setActiveSection] = useState('profile');
  const [mobileOpen, setMobileOpen] = useState(false);
  const sectionRefs = useRef({});
  const navListRef = useRef(null);
  const fileInputRef = useRef(null);
  const confirmInputRef = useRef(null);
  const lastActiveTriggerRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ top: 0, height: 0, opacity: 0 });
  const isManualScrolling = useRef(false);

  // Profile Form State
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
  const [initialProfileData, setInitialProfileData] = useState({});
  const [profileErrors, setProfileErrors] = useState({});
  
  // Account Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  
  // 2FA State
  const [twoFactor, setTwoFactor] = useState(false);
  
  // Sessions State
  const [sessions, setSessions] = useState([
    { id: 1, device: 'Chrome on Windows 11', ip: '192.168.1.45', location: 'San Francisco, CA', isCurrent: true, date: 'Active now' },
    { id: 2, device: 'Safari on iPhone 15 Pro', ip: '172.56.21.99', location: 'San Francisco, CA', isCurrent: false, date: '2 hours ago' },
    { id: 3, device: 'Firefox on macOS Sonoma', ip: '184.22.109.12', location: 'London, UK', isCurrent: false, date: '3 days ago' },
  ]);

  // Appearance State
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('theme_mode') || 'system');
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('accent_color') || '#6366F1');
  const [compactSidebar, setCompactSidebar] = useState(() => localStorage.getItem('compact_sidebar') === 'true');
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('font_size') || 'medium');
  const [cardDensity, setCardDensity] = useState(() => localStorage.getItem('card_density') || 'comfortable');

  // Notifications State
  const [emailNotifications, setEmailNotifications] = useState({
    taskAssigned: true,
    taskCompleted: false,
    taskUpdated: true,
    taskComment: true,
    teamInvitation: true,
  });

  const [pushNotifications, setPushNotifications] = useState({
    browser: true,
    desktop: false,
    reminders: true,
    mentions: true,
  });

  const [enableSound, setEnableSound] = useState(true);
  const [soundVolume, setSoundVolume] = useState(80);

  const [reminders, setReminders] = useState({
    daily: true,
    weekly: true,
    aiReport: false,
  });

  // Workspace Settings State
  const [workspace, setWorkspace] = useState({
    logo: '',
    name: 'Acme Corporation',
    description: 'Main collaborative workspace for Acme Corp task flows and software product development.',
    id: 'ws_acme_90210',
    owner: 'John Doe',
    membersCount: 4,
    createdDate: 'October 12, 2025',
  });
  
  const [isEditingWorkspace, setIsEditingWorkspace] = useState(false);
  const [editWorkspaceData, setEditWorkspaceData] = useState({ name: '', description: '' });

  // Members Management State
  const [members, setMembers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Owner', status: 'Active', avatar: '' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Admin', status: 'Active', avatar: '' },
    { id: 3, name: 'Alex Johnson', email: 'alex@example.com', role: 'Member', status: 'Active', avatar: '' },
    { id: 4, name: 'Sarah Lee', email: 'sarah@example.com', role: 'Member', status: 'Pending', avatar: '' },
  ]);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState(null);

  useEffect(() => {
    if (location.state?.openInvite) {
      setShowInviteForm(true);
      navigate(location.pathname + location.search, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname, location.search]);

  // Integrations State
  const [integrations, setIntegrations] = useState([
    { id: 'google-calendar', name: 'Google Calendar', desc: 'Sync tasks with your calendar to track deadlines.', connected: true, lastSync: '10 mins ago', color: '#ea4335' },
    { id: 'google-drive', name: 'Google Drive', desc: 'Attach documents and sheets directly to task boards.', connected: false, lastSync: 'Never', color: '#34a853' },
    { id: 'github', name: 'GitHub', desc: 'Link pull requests and commits to tasks automatically.', connected: true, lastSync: '1 hour ago', color: '#24292e' },
    { id: 'slack', name: 'Slack', desc: 'Send real-time updates and logs to project channels.', connected: false, lastSync: 'Never', color: '#4a154b' },
    { id: 'discord', name: 'Discord', desc: 'Broadcast project tasks completion alerts to servers.', connected: false, lastSync: 'Never', color: '#5865f2' },
    { id: 'ms-teams', name: 'Microsoft Teams', desc: 'Collaborate and align task alerts with Teams channels.', connected: false, lastSync: 'Never', color: '#6264a7' },
    { id: 'notion', name: 'Notion', desc: 'Import and export workspace documents, tables, and pages.', connected: false, lastSync: 'Never', color: '#000000' },
  ]);

  // AI Preferences State
  const [aiPrefs, setAiPrefs] = useState({
    enableAssistant: true,
    taskSuggestions: true,
    weeklyReports: false,
    autoPrioritization: true,
    deadlineSuggestions: false,
    chatHistory: true,
    productivityInsights: true,
  });

  // Privacy Settings State
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    emailVisible: false,
    activityVisible: true,
  });

  // Language & Region State
  const [langRegion, setLangRegion] = useState({
    language: 'en',
    timezone: 'UTC-08:00',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24h',
    currency: 'USD',
    region: 'US',
  });

  // Danger Zone Actions state
  const [dangerModal, setDangerModal] = useState({
    isOpen: false,
    actionType: '',
    title: '',
    message: '',
    confirmText: '',
    userInput: '',
  });

  // Observe URL location changes for section queries (from Profile page buttons)
  useEffect(() => {
    const querySection = new URLSearchParams(location.search).get('section');
    if (querySection) {
      setActiveSection(querySection);
      // Wait for DOM to register refs and auto-scroll
      setTimeout(() => {
        const element = sectionRefs.current[querySection];
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 200);
    }
  }, [location]);

  // Load profile values
  useEffect(() => {
    if (!user) return;
    const storedProfile = localStorage.getItem('profile_settings_' + user.email);
    if (storedProfile) {
      try {
        const parsed = JSON.parse(storedProfile);
        const data = {
          fullName: parsed.fullName || getFullName(user),
          username: parsed.username || user.username || '',
          email: parsed.email || user.email || '',
          phone: parsed.phone || user.profile?.phone_number || '',
          jobTitle: parsed.jobTitle || user.profile?.job_title || '',
          bio: parsed.bio || user.profile?.bio || '',
          location: parsed.location || user.profile?.location || '',
          avatar: parsed.avatar || user.profile_image || '',
        };
        setProfileData(data);
        setInitialProfileData(data);
      } catch (e) {
        console.error(e);
      }
    } else {
      const data = {
        fullName: getFullName(user),
        username: user.username || '',
        email: user.email || '',
        phone: user.profile?.phone_number || '',
        jobTitle: user.profile?.job_title || '',
        bio: user.profile?.bio || '',
        location: user.profile?.location || '',
        avatar: user.profile_image || '',
      };
      setProfileData(data);
      setInitialProfileData(data);
    }
    
    const stored2FA = localStorage.getItem('2fa_settings');
    if (stored2FA) {
      setTwoFactor(stored2FA === 'true');
    }
  }, [user]);

  // Sync themeMode when darkMode changes externally (e.g., from Navbar toggle)
  useEffect(() => {
    setThemeMode(prevMode => {
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isCurrentModeDark = prevMode === 'dark' || (prevMode === 'system' && isSystemDark);
      
      if (isCurrentModeDark !== darkMode) {
        return darkMode ? 'dark' : 'light';
      }
      return prevMode;
    });
  }, [darkMode]);

  // Persist themeMode
  useEffect(() => {
    localStorage.setItem('theme_mode', themeMode);
  }, [themeMode]);

  // Listen for system theme changes if in system mode
  useEffect(() => {
    if (themeMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e) => {
        if (setDarkMode) setDarkMode(e.matches);
      };
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [themeMode, setDarkMode]);

  // Apply Accent Color
  useEffect(() => {
    localStorage.setItem('accent_color', accentColor);
    document.documentElement.style.setProperty('--primary', accentColor);
    document.documentElement.style.setProperty('--gradient-primary', `linear-gradient(135deg, ${accentColor} 0%, var(--accent) 100%)`);
  }, [accentColor]);

  // Apply Sidebar Mode
  useEffect(() => {
    localStorage.setItem('compact_sidebar', String(compactSidebar));
    if (compactSidebar) {
      document.body.classList.add('compact-sidebar');
    } else {
      document.body.classList.remove('compact-sidebar');
    }
  }, [compactSidebar]);

  // Apply Font Size
  useEffect(() => {
    localStorage.setItem('font_size', fontSize);
    const size = fontSize === 'small' ? '16px' : fontSize === 'large' ? '20px' : '18px';
    document.documentElement.style.fontSize = size;
  }, [fontSize]);

  // Apply Card Density
  useEffect(() => {
    localStorage.setItem('card_density', cardDensity);
    if (cardDensity === 'compact') {
      document.body.classList.add('density-compact');
    } else {
      document.body.classList.remove('density-compact');
    }
  }, [cardDensity]);

  // Keyboard navigation helpers
  const handleKeyDown = useCallback((e, index, id) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (index + 1) % sections.length;
      const nextEl = navListRef.current?.querySelector(`.settings-nav-item[data-id="${sections[nextIndex].id}"]`);
      nextEl?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (index - 1 + sections.length) % sections.length;
      const prevEl = navListRef.current?.querySelector(`.settings-nav-item[data-id="${sections[prevIndex].id}"]`);
      prevEl?.focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleNavClick(id);
    }
  }, []);

  const handleNavClick = useCallback((id) => {
    setActiveSection(id);
    setMobileOpen(false);
    isManualScrolling.current = true;
    
    const element = sectionRefs.current[id];
    if (element) {
      const yOffset = -120; // Adjust based on navbar / header height
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    
    setTimeout(() => {
      isManualScrolling.current = false;
    }, 800);
  }, []);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-150px 0px -60% 0px',
      threshold: 0,
    };

    const observerCallback = (entries) => {
      if (isManualScrolling.current) return;
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    sections.forEach((section) => {
      const el = sectionRefs.current[section.id];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Update active pill position
  useEffect(() => {
    const updateIndicator = () => {
      const activeEl = navListRef.current?.querySelector(`.settings-nav-item[data-id="${activeSection}"]`);
      if (activeEl) {
        setIndicatorStyle({
          top: activeEl.offsetTop,
          height: activeEl.offsetHeight,
          opacity: 1
        });
      }
    };
    
    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [activeSection]);

  // Focus modal input on open
  useEffect(() => {
    if (dangerModal.isOpen) {
      confirmInputRef.current?.focus();
    }
  }, [dangerModal.isOpen]);

  // Profile picture handlers
  const handleAvatarClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleAvatarChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleRemoveAvatar = useCallback((e) => {
    e.stopPropagation();
    setProfileData(prev => ({ ...prev, avatar: '' }));
  }, []);

  // Profile actions
  const handleProfileSave = useCallback((e) => {
    if (e) e.preventDefault();
    const errors = {};
    if (!profileData.fullName.trim()) errors.fullName = 'Full name is required';
    if (!profileData.username.trim()) errors.username = 'Username is required';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!profileData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!emailRegex.test(profileData.email)) {
      errors.email = 'Invalid email address format';
    }
    
    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
      toast.error('Please resolve profile errors before saving');
      return;
    }
    
    setProfileErrors({});
    if (user) {
      localStorage.setItem('profile_settings_' + user.email, JSON.stringify(profileData));
    }
    setInitialProfileData(profileData);
    if (updateUser) {
      updateUser({
        ...user,
        name: profileData.fullName,
        username: profileData.username,
        email: profileData.email,
        profile_image: profileData.avatar
      });
    }
    toast.success('Profile changes saved successfully');
  }, [profileData, user, updateUser]);

  const handleProfileCancel = useCallback(() => {
    setProfileData(initialProfileData);
    setProfileErrors({});
    toast.info('Profile changes discarded');
  }, [initialProfileData]);

  // Password actions
  const handlePasswordSave = useCallback((e) => {
    e.preventDefault();
    const errors = {};
    if (!passwordData.currentPassword) errors.currentPassword = 'Current password is required';
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    }
    if (passwordData.confirmPassword !== passwordData.newPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      toast.error('Failed to change password. See errors below.');
      return;
    }
    
    setPasswordErrors({});
    toast.success('Password changed successfully');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  }, [passwordData]);

  const handlePasswordCancel = useCallback(() => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setPasswordErrors({});
  }, []);

  // Password strength calculation
  const getPasswordStrength = useCallback((pwd) => {
    if (!pwd) return { score: 0, text: 'Empty', color: 'gray' };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    
    if (score <= 2) return { score, text: 'Weak', color: 'var(--danger)' };
    if (score <= 4) return { score, text: 'Medium', color: 'var(--warning)' };
    return { score, text: 'Strong', color: 'var(--success)' };
  }, []);

  // Security actions
  const handle2FAToggle = useCallback(() => {
    setTwoFactor(prev => {
      const nextState = !prev;
      localStorage.setItem('2fa_settings', String(nextState));
      if (nextState) {
        toast.success('Two-factor authentication (2FA) enabled');
      } else {
        toast.warn('Two-factor authentication (2FA) disabled');
      }
      return nextState;
    });
  }, []);

  const handleRevokeSession = useCallback((id) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    toast.success('Session revoked successfully');
  }, []);

  const handleLogoutAll = useCallback(() => {
    setSessions(prev => prev.filter(s => s.isCurrent));
    toast.success('Logged out of all other active sessions');
  }, []);

  // Workspace actions
  const handleInviteSubmit = useCallback((e) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) {
      toast.error('Name and Email are required to invite members');
      return;
    }
    const newMember = {
      id: Date.now(),
      name: inviteName,
      email: inviteEmail,
      role: 'Member',
      status: 'Pending',
      avatar: '',
    };
    setMembers(prev => [...prev, newMember]);
    setWorkspace(prev => ({ ...prev, membersCount: prev.membersCount + 1 }));
    setInviteEmail('');
    setInviteName('');
    setShowInviteForm(false);
    toast.success(`Invitation sent to ${inviteEmail}`);
  }, [inviteName, inviteEmail]);

  const handleRoleChange = useCallback((memberId, newRole) => {
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole } : m));
    setEditingMemberId(null);
    toast.success('Member role updated successfully');
  }, []);

  // Confirm danger actions
  const handleConfirmDangerAction = useCallback(() => {
    const { actionType } = dangerModal;
    setDangerModal({ isOpen: false, actionType: '', title: '', message: '', confirmText: '', userInput: '' });
    
    if (actionType === 'delete-account') {
      toast.error('Your account deletion schedule has been registered.');
    } else if (actionType === 'delete-workspace') {
      toast.error('Your entire workspace data has been scheduled for purging.');
    } else if (actionType === 'remove-data') {
      toast.success('Local settings tracking indices cleared successfully.');
    } else if (actionType === 'export-backup') {
      toast.success('Workspace SQL backup generated! Starting download.');
    }

    // Return focus to trigger
    if (lastActiveTriggerRef.current) {
      lastActiveTriggerRef.current.focus();
    }
  }, [dangerModal]);

  const isProfileDirty = useMemo(() => {
    return JSON.stringify(profileData) !== JSON.stringify(initialProfileData);
  }, [profileData, initialProfileData]);

  const renderSectionBody = useCallback((section) => {
    if (section.id === 'profile') {
      return (
        <form onSubmit={handleProfileSave} className="settings-form">
          <div className="avatar-upload-container">
            <div className="avatar-preview-wrapper" onClick={handleAvatarClick} aria-label="Upload profile image">
              {profileData.avatar ? (
                <img src={profileData.avatar} alt="Profile Avatar" className="profile-avatar-img" />
              ) : (
                <div className="profile-avatar-initials">
                  {profileData.fullName ? profileData.fullName.charAt(0).toUpperCase() : (user?.name?.charAt(0) || 'U')}
                </div>
              )}
              <div className="avatar-hover-overlay">
                <FiCamera className="avatar-camera-icon" />
              </div>
            </div>
            <div className="avatar-upload-info">
              <button type="button" className="btn-upload-avatar" onClick={handleAvatarClick}>
                Upload Photo
              </button>
              {profileData.avatar && (
                <button type="button" className="btn-delete-avatar" onClick={handleRemoveAvatar}>
                  Remove
                </button>
              )}
              <p className="avatar-size-info">JPG, GIF or PNG. Max size of 2MB.</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarChange} 
                accept="image/*" 
                style={{ display: 'none' }} 
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="fullName">Full Name <span className="required-star">*</span></label>
              <input 
                type="text" 
                id="fullName" 
                name="fullName"
                value={profileData.fullName}
                onChange={e => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                className={profileErrors.fullName ? 'input-error' : ''}
                placeholder="e.g. John Doe"
                aria-required="true"
                aria-invalid={!!profileErrors.fullName}
                aria-describedby={profileErrors.fullName ? "err-fullName" : undefined}
              />
              {profileErrors.fullName && <span id="err-fullName" className="error-text"><FiAlertCircle /> {profileErrors.fullName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="username">Username <span className="required-star">*</span></label>
              <input 
                type="text" 
                id="username" 
                name="username"
                value={profileData.username}
                onChange={e => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                className={profileErrors.username ? 'input-error' : ''}
                placeholder="johndoe"
                aria-required="true"
                aria-invalid={!!profileErrors.username}
                aria-describedby={profileErrors.username ? "err-username" : undefined}
              />
              {profileErrors.username && <span id="err-username" className="error-text"><FiAlertCircle /> {profileErrors.username}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address <span className="required-star">*</span></label>
              <input 
                type="email" 
                id="email" 
                name="email"
                value={profileData.email}
                onChange={e => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                className={profileErrors.email ? 'input-error' : ''}
                placeholder="john@example.com"
                aria-required="true"
                aria-invalid={!!profileErrors.email}
                aria-describedby={profileErrors.email ? "err-email" : undefined}
              />
              {profileErrors.email && <span id="err-email" className="error-text"><FiAlertCircle /> {profileErrors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input 
                type="tel" 
                id="phone" 
                name="phone"
                value={profileData.phone}
                onChange={e => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div className="form-group">
              <label htmlFor="jobTitle">Job Title</label>
              <input 
                type="text" 
                id="jobTitle" 
                name="jobTitle"
                value={profileData.jobTitle}
                onChange={e => setProfileData(prev => ({ ...prev, jobTitle: e.target.value }))}
                placeholder="e.g. Senior Frontend Developer"
              />
            </div>

            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input 
                type="text" 
                id="location" 
                name="location"
                value={profileData.location}
                onChange={e => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g. San Francisco, CA"
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="bio">Bio</label>
              <textarea 
                id="bio" 
                name="bio"
                rows="4"
                value={profileData.bio}
                onChange={e => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Brief description about yourself..."
              />
            </div>
          </div>

          <div className="form-actions-inline">
            <button type="button" className="btn-cancel" onClick={handleProfileCancel}>Cancel</button>
            <button type="submit" className="btn-save btn-primary">Save Changes</button>
          </div>
        </form>
      );
    }

    if (section.id === 'account') {
      const strength = getPasswordStrength(passwordData.newPassword);
      return (
        <div className="account-section-wrapper">
          <form onSubmit={handlePasswordSave} className="settings-form">
            <h3 className="settings-subsection-title">Change Password</h3>
            <div className="form-grid">
              <div className="form-group full-width password-input-wrapper">
                <label htmlFor="currentPassword">Current Password <span className="required-star">*</span></label>
                <div className="input-with-icon">
                  <input 
                    type={showPassword.current ? 'text' : 'password'} 
                    id="currentPassword" 
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={e => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className={passwordErrors.currentPassword ? 'input-error' : ''}
                    placeholder="Enter current password"
                    aria-invalid={!!passwordErrors.currentPassword}
                    aria-describedby={passwordErrors.currentPassword ? "err-current" : undefined}
                  />
                  <button 
                    type="button" 
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
                    aria-label={showPassword.current ? "Hide current password" : "Show current password"}
                  >
                    {showPassword.current ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {passwordErrors.currentPassword && <span id="err-current" className="error-text"><FiAlertCircle /> {passwordErrors.currentPassword}</span>}
              </div>

              <div className="form-group password-input-wrapper">
                <label htmlFor="newPassword">New Password <span className="required-star">*</span></label>
                <div className="input-with-icon">
                  <input 
                    type={showPassword.new ? 'text' : 'password'} 
                    id="newPassword" 
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={e => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className={passwordErrors.newPassword ? 'input-error' : ''}
                    placeholder="Min. 8 characters"
                    aria-invalid={!!passwordErrors.newPassword}
                    aria-describedby={passwordErrors.newPassword ? "err-new" : undefined}
                  />
                  <button 
                    type="button" 
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                    aria-label={showPassword.new ? "Hide new password" : "Show new password"}
                  >
                    {showPassword.new ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {passwordErrors.newPassword && <span id="err-new" className="error-text"><FiAlertCircle /> {passwordErrors.newPassword}</span>}
                
                {passwordData.newPassword && (
                  <div className="password-strength-container">
                    <div className="strength-bar-bg">
                      <div 
                        className="strength-bar" 
                        style={{ 
                          width: `${(strength.score / 5) * 100}%`, 
                          backgroundColor: strength.color 
                        }} 
                      />
                    </div>
                    <span className="strength-text" style={{ color: strength.color }}>
                      Strength: {strength.text}
                    </span>
                  </div>
                )}
              </div>

              <div className="form-group password-input-wrapper">
                <label htmlFor="confirmPassword">Confirm New Password <span className="required-star">*</span></label>
                <div className="input-with-icon">
                  <input 
                    type={showPassword.confirm ? 'text' : 'password'} 
                    id="confirmPassword" 
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={e => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className={passwordErrors.confirmPassword ? 'input-error' : ''}
                    placeholder="Re-enter new password"
                    aria-invalid={!!passwordErrors.confirmPassword}
                    aria-describedby={passwordErrors.confirmPassword ? "err-confirm" : undefined}
                  />
                  <button 
                    type="button" 
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                    aria-label={showPassword.confirm ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showPassword.confirm ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {passwordErrors.confirmPassword && <span id="err-confirm" className="error-text"><FiAlertCircle /> {passwordErrors.confirmPassword}</span>}
              </div>
            </div>

            {(passwordData.currentPassword || passwordData.newPassword || passwordData.confirmPassword) && (
              <div className="form-actions-inline">
                <button type="button" className="btn-cancel" onClick={handlePasswordCancel}>Cancel</button>
                <button type="submit" className="btn-save btn-primary">Update Password</button>
              </div>
            )}
          </form>

          <div className="settings-subsection-divider" />

          <div className="security-subsection">
            <h3 className="settings-subsection-title">Security & Credentials</h3>
            
            <div className="two-factor-container glass-card">
              <div className="two-factor-info">
                <h4>Two-Factor Authentication (2FA)</h4>
                <p>Add an extra layer of security to your account by requiring more than just a password to log in.</p>
              </div>
              <button 
                type="button" 
                className={`switch-toggle ${twoFactor ? 'on' : ''}`}
                onClick={handle2FAToggle}
                aria-label="Toggle Two Factor Authentication"
                aria-checked={twoFactor}
                role="switch"
              >
                <span className="switch-slider" />
              </button>
            </div>

            <div className="active-sessions-container">
              <div className="sessions-header">
                <h4>Active Sessions</h4>
                <p>Manage devices that are currently logged in to your account.</p>
              </div>
              
              <ul className="sessions-list">
                {sessions.map(session => (
                  <li key={session.id} className="session-item glass-card">
                    <span className="session-icon">
                      {session.device.toLowerCase().includes('phone') ? <FiSmartphone /> : <FiMonitor />}
                    </span>
                    <div className="session-details">
                      <span className="session-device">
                        {session.device} 
                        {session.isCurrent && <span className="current-device-badge">Current Device</span>}
                      </span>
                      <span className="session-meta">
                        IP: {session.ip} &bull; {session.location} &bull; {session.date}
                      </span>
                    </div>
                    {!session.isCurrent && (
                      <button 
                        type="button" 
                        className="btn-revoke-session"
                        onClick={() => handleRevokeSession(session.id)}
                        aria-label={`Revoke session for ${session.device}`}
                      >
                        Revoke
                      </button>
                    )}
                  </li>
                ))}
              </ul>

              {sessions.length > 1 && (
                <button 
                  type="button" 
                  className="btn-logout-all"
                  onClick={handleLogoutAll}
                >
                  <FiLogOut /> Logout All Other Devices
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (section.id === 'appearance') {
      const accents = [
        { name: 'Indigo', color: '#6366F1' },
        { name: 'Blue', color: '#3B82F6' },
        { name: 'Green', color: '#10B981' },
        { name: 'Orange', color: '#F59E0B' },
        { name: 'Red', color: '#EF4444' },
        { name: 'Violet', color: '#8B5CF6' }
      ];

      return (
        <div className="appearance-section-wrapper">
          <div className="appearance-group">
            <h3 className="settings-subsection-title">Interface Theme</h3>
            <p className="settings-subsection-desc">Choose how TaskFlow looks on your device.</p>
            <div className="theme-grid">
              <button 
                type="button" 
                className={`theme-card light ${themeMode === 'light' ? 'active' : ''}`}
                onClick={() => {
                  setThemeMode('light');
                  if (setDarkMode) setDarkMode(false);
                  toast.success('Light theme activated');
                }}
                aria-label="Light Theme"
              >
                <div className="theme-mockup">
                  <div className="mockup-header" />
                  <div className="mockup-body">
                    <div className="mockup-line short" />
                    <div className="mockup-line long" />
                  </div>
                </div>
                <span>Light</span>
              </button>

              <button 
                type="button" 
                className={`theme-card dark ${themeMode === 'dark' ? 'active' : ''}`}
                onClick={() => {
                  setThemeMode('dark');
                  if (setDarkMode) setDarkMode(true);
                  toast.success('Dark theme activated');
                }}
                aria-label="Dark Theme"
              >
                <div className="theme-mockup">
                  <div className="mockup-header" />
                  <div className="mockup-body">
                    <div className="mockup-line short" />
                    <div className="mockup-line long" />
                  </div>
                </div>
                <span>Dark</span>
              </button>

              <button 
                type="button" 
                className={`theme-card system ${themeMode === 'system' ? 'active' : ''}`}
                onClick={() => {
                  setThemeMode('system');
                  if (setDarkMode) setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
                  toast.success('System theme activated');
                }}
                aria-label="System Theme"
              >
                <div className="theme-mockup">
                  <div className="mockup-header-split" />
                  <div className="mockup-body">
                    <div className="mockup-line short" />
                    <div className="mockup-line long" />
                  </div>
                </div>
                <span>System</span>
              </button>
            </div>
          </div>

          <div className="settings-subsection-divider" />

          <div className="appearance-group">
            <h3 className="settings-subsection-title">Accent Color</h3>
            <p className="settings-subsection-desc">Customize the main focus highlights and link colors.</p>
            <div className="accent-picker-container">
              {accents.map(acc => (
                <button
                  key={acc.name}
                  type="button"
                  className={`accent-color-btn ${accentColor === acc.color ? 'active' : ''}`}
                  style={{ backgroundColor: acc.color }}
                  onClick={() => {
                    setAccentColor(acc.color);
                    toast.success(`${acc.name} accent selected`);
                  }}
                  title={acc.name}
                  aria-label={`Select ${acc.name} accent`}
                >
                  <span className="accent-inner-dot" />
                </button>
              ))}
            </div>
          </div>

          <div className="settings-subsection-divider" />

          <div className="appearance-group">
            <h3 className="settings-subsection-title">Interface Adjustments</h3>
            <div className="adjustments-grid">
              
              <div className="adjustment-item glass-card">
                <div className="adjustment-info">
                  <h4>Compact Sidebar</h4>
                  <p>Collapse the main navigation to icons for more editing space.</p>
                </div>
                <button 
                  type="button" 
                  className={`switch-toggle ${compactSidebar ? 'on' : ''}`}
                  onClick={() => {
                    setCompactSidebar(!compactSidebar);
                    toast.success(compactSidebar ? 'Default sidebar enabled' : 'Compact sidebar enabled');
                  }}
                  aria-label="Toggle compact sidebar"
                  aria-checked={compactSidebar}
                  role="switch"
                >
                  <span className="switch-slider" />
                </button>
              </div>

              <div className="adjustment-item glass-card">
                <div className="adjustment-info">
                  <h4>Card Density</h4>
                  <p>Adjust the density spacing on task views and lists.</p>
                </div>
                <div className="density-toggle-group">
                  <button 
                    type="button"
                    className={`density-btn ${cardDensity === 'comfortable' ? 'active' : ''}`}
                    onClick={() => {
                      setCardDensity('comfortable');
                      toast.success('Comfortable density set');
                    }}
                  >
                    Comfortable
                  </button>
                  <button 
                    type="button"
                    className={`density-btn ${cardDensity === 'compact' ? 'active' : ''}`}
                    onClick={() => {
                      setCardDensity('compact');
                      toast.success('Compact density set');
                    }}
                  >
                    Compact
                  </button>
                </div>
              </div>

              <div className="adjustment-item glass-card">
                <div className="adjustment-info">
                  <h4>Font Size</h4>
                  <p>Scale user interface fonts globally.</p>
                </div>
                <div className="font-toggle-group">
                  {['small', 'medium', 'large'].map(sz => (
                    <button 
                      key={sz}
                      type="button"
                      className={`font-btn ${fontSize === sz ? 'active' : ''}`}
                      onClick={() => {
                        setFontSize(sz);
                        toast.success(`Font size set to ${sz}`);
                      }}
                    >
                      {sz.charAt(0).toUpperCase() + sz.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      );
    }

    if (section.id === 'notifications') {
      const handleEmailToggle = (key) => {
        setEmailNotifications(prev => {
          const updated = { ...prev, [key]: !prev[key] };
          toast.success('Email settings updated');
          return updated;
        });
      };

      const handlePushToggle = (key) => {
        setPushNotifications(prev => {
          const updated = { ...prev, [key]: !prev[key] };
          toast.success('Push notification settings updated');
          return updated;
        });
      };

      const handleReminderToggle = (key) => {
        setReminders(prev => {
          const updated = { ...prev, [key]: !prev[key] };
          toast.success('Reminder settings updated');
          return updated;
        });
      };

      return (
        <div className="notifications-section-wrapper">
          <div className="notifications-group">
            <h3 className="settings-subsection-title">Email Notifications</h3>
            <p className="settings-subsection-desc">Choose which activities you would like to receive via email.</p>
            <div className="toggles-list">
              {[
                { key: 'taskAssigned', label: 'Task Assigned', desc: 'Notify me when someone assigns a task to me.' },
                { key: 'taskCompleted', label: 'Task Completed', desc: 'Notify me when tasks in my project are completed.' },
                { key: 'taskUpdated', label: 'Task Updated', desc: 'Notify me when tasks in my project are edited.' },
                { key: 'taskComment', label: 'Task Comment', desc: 'Notify me when comments are added to my tasks.' },
                { key: 'teamInvitation', label: 'Team Invitation', desc: 'Notify me when I am invited to join a team.' }
              ].map(item => (
                <div key={item.key} className="notification-toggle-item glass-card">
                  <div className="toggle-item-info">
                    <h4>{item.label}</h4>
                    <p>{item.desc}</p>
                  </div>
                  <button 
                    type="button" 
                    className={`switch-toggle ${emailNotifications[item.key] ? 'on' : ''}`}
                    onClick={() => handleEmailToggle(item.key)}
                    aria-label={`Toggle email for ${item.label}`}
                    aria-checked={emailNotifications[item.key]}
                    role="switch"
                  >
                    <span className="switch-slider" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="settings-subsection-divider" />

          <div className="notifications-group">
            <h3 className="settings-subsection-title">Push & Alert Notifications</h3>
            <p className="settings-subsection-desc">Configure real-time alerts on your browser or operating system.</p>
            <div className="toggles-list">
              {[
                { key: 'browser', label: 'Browser Notifications', desc: 'Display push alerts while TaskFlow is open in a tab.' },
                { key: 'desktop', label: 'Desktop Notifications', desc: 'Allow background notifications through your OS client.' },
                { key: 'reminders', label: 'Reminder Alerts', desc: 'Notify me about upcoming deadlines and scheduled tasks.' },
                { key: 'mentions', label: 'Mention Alerts', desc: 'Receive immediate alerts when you are mentioned in comments.' }
              ].map(item => (
                <div key={item.key} className="notification-toggle-item glass-card">
                  <div className="toggle-item-info">
                    <h4>{item.label}</h4>
                    <p>{item.desc}</p>
                  </div>
                  <button 
                    type="button" 
                    className={`switch-toggle ${pushNotifications[item.key] ? 'on' : ''}`}
                    onClick={() => handlePushToggle(item.key)}
                    aria-label={`Toggle push for ${item.label}`}
                    aria-checked={pushNotifications[item.key]}
                    role="switch"
                  >
                    <span className="switch-slider" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="settings-subsection-divider" />

          <div className="notifications-group">
            <h3 className="settings-subsection-title">Sound Settings</h3>
            <p className="settings-subsection-desc">Customize interface and alert sounds.</p>
            <div className="sound-settings-card glass-card">
              <div className="sound-toggle-row">
                <div className="toggle-item-info">
                  <h4>Enable Sounds</h4>
                  <p>Play sound effects for notifications and complete tasks.</p>
                </div>
                <button 
                  type="button" 
                  className={`switch-toggle ${enableSound ? 'on' : ''}`}
                  onClick={() => {
                    setEnableSound(!enableSound);
                    toast.success(enableSound ? 'Sounds disabled' : 'Sounds enabled');
                  }}
                  aria-label="Toggle system sounds"
                  aria-checked={enableSound}
                  role="switch"
                >
                  <span className="switch-slider" />
                </button>
              </div>
              
              {enableSound && (
                <div className="volume-slider-container">
                  <label htmlFor="soundVolume">Notification Volume ({soundVolume}%)</label>
                  <div className="volume-slider-wrapper">
                    <input 
                      type="range" 
                      id="soundVolume" 
                      min="0" 
                      max="100" 
                      value={soundVolume} 
                      onChange={e => setSoundVolume(Number(e.target.value))}
                      className="volume-slider" 
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="settings-subsection-divider" />

          <div className="notifications-group">
            <h3 className="settings-subsection-title">Reminders & Digests</h3>
            <p className="settings-subsection-desc">Stay informed about your overall productivity metrics.</p>
            <div className="toggles-list">
              {[
                { key: 'daily', label: 'Daily Reminder', desc: 'Receive a daily morning brief of tasks due today.' },
                { key: 'weekly', label: 'Weekly Summary', desc: 'Receive a weekly email recap of completed tasks and analytics.' },
                { key: 'aiReport', label: 'AI Productivity Report', desc: 'Generate customized automated performance analytics via AI.' }
              ].map(item => (
                <div key={item.key} className="notification-toggle-item glass-card">
                  <div className="toggle-item-info">
                    <h4>{item.label}</h4>
                    <p>{item.desc}</p>
                  </div>
                  <button 
                    type="button" 
                    className={`switch-toggle ${reminders[item.key] ? 'on' : ''}`}
                    onClick={() => handleReminderToggle(item.key)}
                    aria-label={`Toggle reminder for ${item.label}`}
                    aria-checked={reminders[item.key]}
                    role="switch"
                  >
                    <span className="switch-slider" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (section.id === 'workspace') {
      const handleWorkspaceLogoClick = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
              setWorkspace(prev => ({ ...prev, logo: reader.result }));
              toast.success('Workspace logo updated successfully');
            };
            reader.readAsDataURL(file);
          }
        };
        input.click();
      };

      const handleEditWorkspace = () => {
        setEditWorkspaceData({ name: workspace.name, description: workspace.description });
        setIsEditingWorkspace(true);
      };

      const handleWorkspaceSaveSubmit = (e) => {
        e.preventDefault();
        setWorkspace(prev => ({ ...prev, name: editWorkspaceData.name, description: editWorkspaceData.description }));
        setIsEditingWorkspace(false);
        toast.success('Workspace details updated successfully');
      };

      return (
        <div className="workspace-section-wrapper">
          <div className="workspace-info-card glass-card">
            <div className="workspace-logo-container" onClick={handleWorkspaceLogoClick} aria-label="Upload workspace logo">
              {workspace.logo ? (
                <img src={workspace.logo} alt="Workspace Logo" className="workspace-logo-img" />
              ) : (
                <div className="workspace-logo-placeholder">
                  {workspace.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="avatar-hover-overlay">
                <FiCamera className="avatar-camera-icon" />
              </div>
            </div>

            <div className="workspace-details-container">
              {isEditingWorkspace ? (
                <form onSubmit={handleWorkspaceSaveSubmit} className="workspace-edit-form">
                  <div className="form-group">
                    <label htmlFor="wsName">Workspace Name</label>
                    <input 
                      type="text" 
                      id="wsName" 
                      value={editWorkspaceData.name} 
                      onChange={e => setEditWorkspaceData(prev => ({ ...prev, name: e.target.value }))}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="wsDesc">Description</label>
                    <textarea 
                      id="wsDesc" 
                      value={editWorkspaceData.description} 
                      onChange={e => setEditWorkspaceData(prev => ({ ...prev, description: e.target.value }))}
                      rows="3"
                    />
                  </div>
                  <div className="form-actions-inline">
                    <button type="button" className="btn-cancel" onClick={() => setIsEditingWorkspace(false)}>Cancel</button>
                    <button type="submit" className="btn-save btn-primary">Save Details</button>
                  </div>
                </form>
              ) : (
                <div className="workspace-read-container">
                  <div className="workspace-title-row">
                    <h2>{workspace.name}</h2>
                    <button type="button" className="btn-edit-ws" onClick={handleEditWorkspace}>Edit details</button>
                  </div>
                  <p className="workspace-desc-text">{workspace.description || 'No description provided.'}</p>
                  
                  <div className="workspace-meta-grid">
                    <div className="meta-item">
                      <span className="meta-label">Workspace ID:</span>
                      <code className="meta-value">{workspace.id}</code>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Owner:</span>
                      <span className="meta-value">{workspace.owner}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Members:</span>
                      <span className="meta-value">{workspace.membersCount} users</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Created:</span>
                      <span className="meta-value">{workspace.createdDate}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="settings-subsection-divider" />

          <div className="member-management-section">
            <div className="subsection-header-actions">
              <div>
                <h3 className="settings-subsection-title">Member Management</h3>
                <p className="settings-subsection-desc">Manage roles and workspace permissions for all active users.</p>
              </div>
              <button 
                type="button" 
                className="btn-invite-members btn-primary"
                onClick={() => setShowInviteForm(!showInviteForm)}
              >
                {showInviteForm ? 'Cancel Invite' : 'Invite Member'}
              </button>
            </div>

            {showInviteForm && (
              <form onSubmit={handleInviteSubmit} className="invite-member-form glass-card animate-slide-up">
                <h4>Invite New Workspace Member</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="inviteName">Full Name</label>
                    <input 
                      type="text" 
                      id="inviteName" 
                      value={inviteName} 
                      onChange={e => setInviteName(e.target.value)} 
                      placeholder="e.g. David Brown" 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="inviteEmail">Email Address</label>
                    <input 
                      type="email" 
                      id="inviteEmail" 
                      value={inviteEmail} 
                      onChange={e => setInviteEmail(e.target.value)} 
                      placeholder="e.g. david@example.com" 
                      required 
                    />
                  </div>
                </div>
                <div className="form-actions-inline" style={{ marginTop: '12px' }}>
                  <button type="submit" className="btn-save btn-primary">Send Invitation</button>
                </div>
              </form>
            )}

            <div className="members-table-container glass-card">
              <table className="members-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map(member => (
                    <tr key={member.id}>
                      <td>
                        <div className="member-cell">
                          <div className="member-avatar">
                            {member.avatar ? (
                              <img src={member.avatar} alt={member.name} />
                            ) : (
                              member.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <span className="member-name">{member.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="member-email">{member.email}</span>
                      </td>
                      <td>
                        {editingMemberId === member.id && member.role !== 'Owner' ? (
                          <select 
                            value={member.role} 
                            onChange={e => handleRoleChange(member.id, e.target.value)}
                            onBlur={() => setEditingMemberId(null)}
                            autoFocus
                            className="role-select"
                            aria-label={`Change role for ${member.name}`}
                          >
                            <option value="Admin">Admin</option>
                            <option value="Member">Member</option>
                            <option value="Viewer">Viewer</option>
                          </select>
                        ) : (
                          <span className={`member-role ${member.role.toLowerCase()}`}>{member.role}</span>
                        )}
                      </td>
                      <td>
                        <span className={`member-status-badge ${member.status.toLowerCase()}`}>{member.status}</span>
                      </td>
                      <td>
                        {member.role !== 'Owner' ? (
                          <div className="member-actions">
                            <button 
                              type="button" 
                              className="btn-table-action"
                              onClick={() => setEditingMemberId(editingMemberId === member.id ? null : member.id)}
                            >
                              Manage Role
                            </button>
                            <button 
                              type="button" 
                              className="btn-table-action danger"
                              onClick={() => {
                                setMembers(prev => prev.filter(m => m.id !== member.id));
                                setWorkspace(prev => ({ ...prev, membersCount: prev.membersCount - 1 }));
                                toast.success(`${member.name} removed from workspace.`);
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <span className="owner-action-placeholder">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    if (section.id === 'integrations') {
      const handleIntegrationToggle = (id) => {
        setIntegrations(prev => prev.map(int => {
          if (int.id === id) {
            const nextState = !int.connected;
            toast.success(nextState ? `${int.name} connected successfully!` : `${int.name} disconnected.`);
            return {
              ...int,
              connected: nextState,
              lastSync: nextState ? 'Just now' : 'Never'
            };
          }
          return int;
        }));
      };

      const getIntegrationIcon = (id) => {
        switch (id) {
          case 'google-calendar': return <FiCalendar />;
          case 'google-drive': return <FiMonitor />; 
          case 'github': return <FiGithub />;
          case 'slack': return <FiSlack />;
          case 'discord': return <FiMessageSquare />;
          case 'ms-teams': return <FiUsers />;
          case 'notion': return <FiFileText />;
          default: return <FiLink />;
        }
      };

      return (
        <div className="integrations-section-wrapper">
          <div className="integrations-grid">
            {integrations.map(integration => (
              <div key={integration.id} className="integration-card glass-card">
                <div className="integration-card-header">
                  <div 
                    className="integration-logo-wrapper" 
                    style={{ backgroundColor: `${integration.color}15`, color: integration.color }}
                  >
                    {getIntegrationIcon(integration.id)}
                  </div>
                  <span className={`integration-status-tag ${integration.connected ? 'connected' : ''}`}>
                    {integration.connected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                
                <div className="integration-card-body">
                  <h3>{integration.name}</h3>
                  <p>{integration.desc}</p>
                </div>

                <div className="integration-card-footer">
                  <span className="integration-sync-meta">Sync: {integration.lastSync}</span>
                  {integration.connected ? (
                    <button 
                      type="button" 
                      className="btn-disconnect" 
                      onClick={() => handleIntegrationToggle(integration.id)}
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button 
                      type="button" 
                      className="btn-connect btn-primary" 
                      onClick={() => handleIntegrationToggle(integration.id)}
                    >
                      Connect
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (section.id === 'ai-preferences') {
      const handleAIPrefsToggle = (key) => {
        setAiPrefs(prev => {
          const updated = { ...prev, [key]: !prev[key] };
          toast.success('AI preference updated');
          return updated;
        });
      };

      return (
        <div className="ai-preferences-section-wrapper">
          <div className="ai-status-card glass-card">
            <div className="ai-status-icon">
              <FiCpu />
            </div>
            <div className="ai-status-details">
              <h4>AI Core Assistant</h4>
              <p>State-of-the-art task parsing and productivity synthesis engine.</p>
            </div>
            <button 
              type="button" 
              className={`switch-toggle ${aiPrefs.enableAssistant ? 'on' : ''}`}
              onClick={() => handleAIPrefsToggle('enableAssistant')}
              aria-label="Enable AI Assistant"
              aria-checked={aiPrefs.enableAssistant}
              role="switch"
            >
              <span className="switch-slider" />
            </button>
          </div>

          <div className="settings-subsection-divider" />

          {aiPrefs.enableAssistant && (
            <div className="ai-features-list animate-fade-in">
              <h3 className="settings-subsection-title">AI Automation Features</h3>
              <p className="settings-subsection-desc">Enable cognitive features to automate parts of your project management workflow.</p>
              
              <div className="toggles-list">
                {[
                  { key: 'taskSuggestions', label: 'AI Task Suggestions', desc: 'Auto-generate break-down subtasks and descriptions based on title logs.' },
                  { key: 'weeklyReports', label: 'AI Weekly Reports', desc: 'Compile automated weekly performance summaries and team analytics.' },
                  { key: 'autoPrioritization', label: 'AI Auto Prioritization', desc: 'Predict and adjust task priority based on deadlines and team bandwidth.' },
                  { key: 'deadlineSuggestions', label: 'AI Deadline Suggestions', desc: 'Calculate optimized delivery timelines based on past project velocity.' },
                  { key: 'chatHistory', label: 'AI Chat History Persistence', desc: 'Save chat threads and context inside the interactive sidebar assistant.' },
                  { key: 'productivityInsights', label: 'AI Productivity Insights', desc: 'Identify bottlenecks and compute productivity indicators.' }
                ].map(item => (
                  <div key={item.key} className="notification-toggle-item glass-card">
                    <div className="toggle-item-info">
                      <h4>{item.label}</h4>
                      <p>{item.desc}</p>
                    </div>
                    <button 
                      type="button" 
                      className={`switch-toggle ${aiPrefs[item.key] ? 'on' : ''}`}
                      onClick={() => handleAIPrefsToggle(item.key)}
                      aria-label={`Toggle ${item.label}`}
                      aria-checked={aiPrefs[item.key]}
                      role="switch"
                    >
                      <span className="switch-slider" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (section.id === 'privacy') {
      const handlePrivacyToggle = (key) => {
        setPrivacy(prev => {
          const updated = { ...prev, [key]: !prev[key] };
          toast.success('Privacy settings saved');
          return updated;
        });
      };

      const handleDownloadData = () => {
        toast.info('Preparing your personal data download. This may take a few moments...');
        setTimeout(() => {
          toast.success('Your personal data download is ready!');
        }, 1500);
      };

      const handleExportData = () => {
        toast.info('Generating data export archive...');
        setTimeout(() => {
          toast.success('Data export archive successfully sent to your email.');
        }, 2000);
      };

      return (
        <div className="privacy-section-wrapper">
          <h3 className="settings-subsection-title">Visibility & Permissions</h3>
          <p className="settings-subsection-desc">Manage how your profile and activity are displayed to other members.</p>
          
          <div className="toggles-list">
            {[
              { key: 'profileVisible', label: 'Profile Visibility', desc: 'Allow members of your teams and organizations to view your full profile details.' },
              { key: 'emailVisible', label: 'Email Visibility', desc: 'Display your email address to workspace members. If disabled, email remains hidden.' },
              { key: 'activityVisible', label: 'Activity Status Visibility', desc: 'Show whether you are currently active, online, or when you were last online.' }
            ].map(item => (
              <div key={item.key} className="notification-toggle-item glass-card">
                <div className="toggle-item-info">
                  <h4>{item.label}</h4>
                  <p>{item.desc}</p>
                </div>
                <button 
                  type="button" 
                  className={`switch-toggle ${privacy[item.key] ? 'on' : ''}`}
                  onClick={() => handlePrivacyToggle(item.key)}
                  aria-label={`Toggle ${item.label}`}
                  aria-checked={privacy[item.key]}
                  role="switch"
                >
                  <span className="switch-slider" />
                </button>
              </div>
            ))}
          </div>

          <div className="settings-subsection-divider" />

          <div className="privacy-actions-section">
            <h3 className="settings-subsection-title">Account Data</h3>
            <p className="settings-subsection-desc">Request a complete copy of your workspace logs and metadata records.</p>
            
            <div className="data-actions-grid">
              <div className="data-action-card glass-card">
                <div className="data-action-details">
                  <h4>Download Personal Data</h4>
                  <p>Download a file containing your active tasks, bio metrics, and local preferences.</p>
                </div>
                <button type="button" className="btn-save btn-primary" onClick={handleDownloadData}>
                  Download JSON
                </button>
              </div>

              <div className="data-action-card glass-card">
                <div className="data-action-details">
                  <h4>Export User Archive</h4>
                  <p>Request a structured archive of all comments, attachments, and organization histories.</p>
                </div>
                <button type="button" className="btn-save btn-primary" onClick={handleExportData}>
                  Request Export
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (section.id === 'language') {
      const handleLangRegionChange = (key, val) => {
        setLangRegion(prev => {
          const updated = { ...prev, [key]: val };
          toast.success('Regional preferences updated');
          return updated;
        });
      };

      return (
        <div className="language-section-wrapper">
          <h3 className="settings-subsection-title">Regional Settings</h3>
          <p className="settings-subsection-desc">Configure date, currency, and locale preferences for your workspace dashboard.</p>
          
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="prefLanguage">Language</label>
              <select 
                id="prefLanguage" 
                value={langRegion.language}
                onChange={e => handleLangRegionChange('language', e.target.value)}
              >
                <option value="en">English (US)</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="zh">中文</option>
                <option value="ja">日本語</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="prefTimezone">Time Zone</label>
              <select 
                id="prefTimezone" 
                value={langRegion.timezone}
                onChange={e => handleLangRegionChange('timezone', e.target.value)}
              >
                <option value="UTC-08:00">Pacific Time (PT) &bull; UTC-08:00</option>
                <option value="UTC-05:00">Eastern Time (ET) &bull; UTC-05:00</option>
                <option value="UTC+00:00">Greenwich Mean Time (GMT) &bull; UTC+00:00</option>
                <option value="UTC+01:00">Central European Time (CET) &bull; UTC+01:00</option>
                <option value="UTC+05:30">India Standard Time (IST) &bull; UTC+05:30</option>
                <option value="UTC+09:00">Japan Standard Time (JST) &bull; UTC+09:00</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="prefDateFormat">Date Format</label>
              <select 
                id="prefDateFormat" 
                value={langRegion.dateFormat}
                onChange={e => handleLangRegionChange('dateFormat', e.target.value)}
              >
                <option value="YYYY-MM-DD">YYYY-MM-DD (2026-07-09)</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY (07/09/2026)</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY (09/07/2026)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="prefTimeFormat">Time Format</label>
              <select 
                id="prefTimeFormat" 
                value={langRegion.timeFormat}
                onChange={e => handleLangRegionChange('timeFormat', e.target.value)}
              >
                <option value="12h">12-hour (11:35 AM)</option>
                <option value="24h">24-hour (11:35)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="prefCurrency">Currency</label>
              <select 
                id="prefCurrency" 
                value={langRegion.currency}
                onChange={e => handleLangRegionChange('currency', e.target.value)}
              >
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound</option>
                <option value="JPY">JPY (¥) - Japanese Yen</option>
                <option value="INR">INR (₹) - Indian Rupee</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="prefRegion">Region</label>
              <select 
                id="prefRegion" 
                value={langRegion.region}
                onChange={e => handleLangRegionChange('region', e.target.value)}
              >
                <option value="US">United States</option>
                <option value="GB">United Kingdom</option>
                <option value="DE">Germany</option>
                <option value="JP">Japan</option>
                <option value="IN">India</option>
                <option value="CA">Canada</option>
              </select>
            </div>
          </div>
        </div>
      );
    }

    if (section.id === 'about') {
      const versionInfo = {
        frontend: '1.2.4',
        backend: '1.1.0',
        database: 'PostgreSQL 15',
        apiVersion: 'v1',
        environment: 'Production',
        buildNumber: 'B-89402',
        releaseDate: 'June 30, 2026',
      };

      return (
        <div className="about-section-wrapper">
          <h3 className="settings-subsection-title">System Information</h3>
          <p className="settings-subsection-desc">Details about the current task-management software build client and API versions.</p>
          
          <div className="about-grid">
            {[
              { label: 'Frontend Version', value: versionInfo.frontend },
              { label: 'Backend Version', value: versionInfo.backend },
              { label: 'Database Version', value: versionInfo.database },
              { label: 'API Endpoint Version', value: versionInfo.apiVersion },
              { label: 'Running Environment', value: versionInfo.environment },
              { label: 'Build Identifier', value: versionInfo.buildNumber },
              { label: 'Release Build Date', value: versionInfo.releaseDate },
            ].map(inf => (
              <div key={inf.label} className="about-meta-row glass-card">
                <span className="about-meta-label">{inf.label}</span>
                <span className="about-meta-value">{inf.value}</span>
              </div>
            ))}
          </div>

          <div className="settings-subsection-divider" />

          <div className="about-links-section">
            <h4 style={{ color: 'var(--text-dark)', marginBottom: '8px', fontSize: '0.95rem', fontWeight: '600' }}>Legal & Resources</h4>
            <div style={{ display: 'flex', gap: '20px', fontSize: '0.85rem' }}>
              <a href="#" className="about-link" onClick={e => { e.preventDefault(); toast.info('Terms of Service dialog coming soon'); }}>Terms of Service</a>
              <a href="#" className="about-link" onClick={e => { e.preventDefault(); toast.info('Privacy Policy dialog coming soon'); }}>Privacy Policy</a>
              <a href="#" className="about-link" onClick={e => { e.preventDefault(); toast.info('Release notes log coming soon'); }}>Release Notes</a>
            </div>
          </div>
        </div>
      );
    }

    if (section.id === 'danger-zone') {
      const triggerDangerAction = (e, type, title, message, confirmText) => {
        lastActiveTriggerRef.current = e.currentTarget;
        setDangerModal({
          isOpen: true,
          actionType: type,
          title,
          message,
          confirmText,
          userInput: '',
        });
      };

      return (
        <div className="danger-section-wrapper">
          <h3 className="settings-subsection-title danger-header-title">Critical Zone Actions</h3>
          <p className="settings-subsection-desc">These actions are irreversible and could lead to severe data loss. Please proceed with caution.</p>
          
          <div className="danger-cards-grid">
            <div className="danger-card-item glass-card danger-action-card">
              <div className="danger-card-info">
                <h4>Delete My Account</h4>
                <p>Permanently remove your profile details, avatar, and personal settings logs from the task database.</p>
              </div>
              <button 
                type="button" 
                className="btn-danger-action"
                onClick={(e) => triggerDangerAction(
                  e,
                  'delete-account', 
                  'Delete Account', 
                  'This action permanently deletes your account and cannot be undone. Please type DELETE to confirm.', 
                  'DELETE'
                )}
              >
                Delete Account
              </button>
            </div>

            <div className="danger-card-item glass-card danger-action-card">
              <div className="danger-card-info">
                <h4>Delete Workspace</h4>
                <p>Wipe the entire Acme Corporation workspace records including all boards, comments, invites, and settings.</p>
              </div>
              <button 
                type="button" 
                className="btn-danger-action"
                onClick={(e) => triggerDangerAction(
                  e,
                  'delete-workspace', 
                  'Delete Workspace', 
                  'This will erase all projects, tasks, comments, and members in this workspace. Please type DELETE WORKSPACE to confirm.', 
                  'DELETE WORKSPACE'
                )}
              >
                Delete Workspace
              </button>
            </div>

            <div className="danger-card-item glass-card danger-action-card">
              <div className="danger-card-info">
                <h4>Remove Personal Data</h4>
                <p>Erase localized search cache indices, personal tracking logs, cookies, and active session histories immediately.</p>
              </div>
              <button 
                type="button" 
                className="btn-danger-action"
                onClick={(e) => triggerDangerAction(
                  e,
                  'remove-data', 
                  'Remove Personal Data', 
                  'This clears search indices and personal tracking caches app-wide. Please type CLEAR DATA to confirm.', 
                  'CLEAR DATA'
                )}
              >
                Remove Data
              </button>
            </div>

            <div className="danger-card-item glass-card danger-action-card">
              <div className="danger-card-info">
                <h4>Export Emergency Backup</h4>
                <p>Generate a complete unencrypted raw database backup of all team boards for self-hosting imports.</p>
              </div>
              <button 
                type="button" 
                className="btn-danger-action"
                onClick={(e) => triggerDangerAction(
                  e,
                  'export-backup', 
                  'Export Backup', 
                  'This generates a full unencrypted backup of all database tables. Please type EXPORT BACKUP to confirm.', 
                  'EXPORT BACKUP'
                )}
              >
                Export Backup
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="placeholder-content">
        <div className="skeleton-row">
          <div className="skeleton-block short" />
          <div className="skeleton-block long" />
        </div>
        <div className="skeleton-row">
          <div className="skeleton-block medium" />
          <div className="skeleton-block long" />
        </div>
        <div className="placeholder-footer">
          {section.status === 'Ready' ? (
            <span className="ready-indicator">
              <span className="dot pulse" /> Available to Configure
            </span>
          ) : (
            <span className="coming-soon-indicator">
              Under active development
            </span>
          )}
        </div>
      </div>
    );
  }, [
    user,
    profileData,
    profileErrors,
    passwordData,
    passwordErrors,
    showPassword,
    twoFactor,
    sessions,
    themeMode,
    accentColor,
    compactSidebar,
    cardDensity,
    fontSize,
    emailNotifications,
    pushNotifications,
    enableSound,
    soundVolume,
    reminders,
    workspace,
    isEditingWorkspace,
    editWorkspaceData,
    members,
    showInviteForm,
    editingMemberId,
    inviteName,
    inviteEmail,
    integrations,
    aiPrefs,
    privacy,
    langRegion,
    dangerModal,
    handleAvatarClick,
    handleAvatarChange,
    handleRemoveAvatar,
    handleProfileCancel,
    handleProfileSave,
    handlePasswordCancel,
    handlePasswordSave,
    getPasswordStrength,
    handle2FAToggle,
    handleRevokeSession,
    handleLogoutAll,
    handleInviteSubmit,
    handleRoleChange
  ]);

  return (
    <div className="settings-page page-content animate-fade-in">
      <header className="settings-header animate-slide-up">
        <div className="header-title-container">
          <h1>Settings</h1>
          <p>Manage your account and application preferences.</p>
        </div>
        <button 
          className="mobile-nav-toggle glass" 
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-controls="settings-sidebar"
          aria-label="Toggle settings navigation"
        >
          {mobileOpen ? <FiX /> : <FiMenu />}
          <span>Sections</span>
        </button>
      </header>

      <div className="settings-container">
        <aside 
          id="settings-sidebar"
          className={`settings-sidebar glass ${mobileOpen ? 'open' : ''}`}
        >
          <div className="sidebar-header">
            <h3>Settings Sections</h3>
            <button className="close-btn" onClick={() => setMobileOpen(false)} aria-label="Close settings navigation">
              <FiX />
            </button>
          </div>
          <nav className="settings-nav">
            <ul ref={navListRef} role="tablist" aria-label="Settings sections">
              <div className="settings-nav-indicator" style={{
                transform: `translateY(${indicatorStyle.top}px)`,
                height: `${indicatorStyle.height}px`,
                opacity: indicatorStyle.opacity
              }} />
              {sections.map((section, idx) => (
                <li key={section.id} role="presentation">
                  <button
                    role="tab"
                    aria-selected={activeSection === section.id}
                    aria-controls={`panel-${section.id}`}
                    id={`tab-${section.id}`}
                    data-id={section.id}
                    className={`settings-nav-item ${activeSection === section.id ? 'active' : ''} ${section.isDanger ? 'danger' : ''}`}
                    onClick={() => handleNavClick(section.id)}
                    onKeyDown={(e) => handleKeyDown(e, idx, section.id)}
                    tabIndex={activeSection === section.id ? 0 : -1}
                  >
                    <span className="nav-icon">{section.icon}</span>
                    <span className="nav-text">{section.title}</span>
                    {section.status === 'Ready' && <span className="nav-dot-ready" title="Feature Ready" />}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}

        <main className="settings-content">
          {sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              ref={el => sectionRefs.current[section.id] = el}
              className={`settings-section-card glass animate-slide-up ${activeSection === section.id ? 'highlighted' : ''}`}
              role="tabpanel"
              aria-labelledby={`tab-${section.id}`}
            >
              <div className="card-top-accent" />
              <div className="section-card-header">
                <div className="section-title-wrapper">
                  <span className={`section-header-icon ${section.isDanger ? 'danger-icon' : ''}`}>
                    {section.icon}
                  </span>
                  <div>
                    <h2>{section.cardTitle}</h2>
                    <p className="section-desc">{section.description}</p>
                  </div>
                </div>
                <div className="section-badge-wrapper">
                  <span className={`status-badge ${section.status.toLowerCase().replace(' ', '-')}`}>
                    {section.status}
                  </span>
                </div>
              </div>
              <div className="section-card-body">
                {renderSectionBody(section)}
              </div>
            </section>
          ))}
        </main>
      </div>

      {isProfileDirty && (
        <div className="sticky-save-bar glass animate-slide-up">
          <div className="save-bar-content">
            <p className="save-bar-text">You have unsaved changes in your profile settings.</p>
            <div className="save-bar-actions">
              <button className="btn-cancel" onClick={handleProfileCancel}>Cancel</button>
              <button className="btn-save btn-primary" onClick={handleProfileSave}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {dangerModal.isOpen && (
        <div className="danger-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="danger-modal-title">
          <div className="danger-modal-card glass animate-scale-in">
            <div className="danger-modal-header">
              <FiAlertTriangle className="danger-modal-icon" />
              <h3 id="danger-modal-title">{dangerModal.title}</h3>
            </div>
            
            <div className="danger-modal-body">
              <p className="danger-modal-msg">{dangerModal.message}</p>
              
              <div className="form-group">
                <label htmlFor="confirmInput">To verify, type <code>{dangerModal.confirmText}</code> below:</label>
                <input 
                  type="text" 
                  id="confirmInput"
                  ref={confirmInputRef}
                  value={dangerModal.userInput}
                  onChange={e => setDangerModal(prev => ({ ...prev, userInput: e.target.value }))}
                  placeholder={dangerModal.confirmText}
                  autoComplete="off"
                />
              </div>
            </div>
            
            <div className="danger-modal-footer">
              <button 
                type="button" 
                className="btn-cancel" 
                onClick={() => setDangerModal({ isOpen: false, actionType: '', title: '', message: '', confirmText: '', userInput: '' })}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn-danger-confirm"
                disabled={dangerModal.userInput !== dangerModal.confirmText}
                onClick={handleConfirmDangerAction}
              >
                Confirm Irreversible Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
