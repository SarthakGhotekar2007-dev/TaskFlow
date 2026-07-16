import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from './components/Sidebar/Sidebar';
import Navbar from './components/Navbar/Navbar';
import Dashboard from './pages/Dashboard/Dashboard';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import MyTasks from './pages/MyTasks/MyTasks';
import Kanban from './pages/Kanban/Kanban';
import CalendarView from './pages/Calendar/CalendarView';
import Analytics from './pages/Analytics/Analytics';
import Organizations from './pages/Organizations/Organizations';
import Teams from './pages/Teams/Teams';
import TeamDetails from './pages/Teams/TeamDetails';
import wsService from './services/websocket';

import ReportsPage from './pages/Analytics/ReportsPage';
import NotificationsPage from './pages/Notifications/NotificationsPage';
import Settings from './pages/Settings/Settings';
import Profile from './pages/Profile/Profile';
import ProfileSetup from './pages/ProfileSetup/ProfileSetup';


// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) return <div className="page-content">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  const isSetupPage = location.pathname === '/profile-setup';
  
  // Redirect to setup page if user profile is incomplete
  if (!user.profile_completed && !isSetupPage) {
    return <Navigate to="/profile-setup" replace />;
  }

  // Redirect to dashboard if user profile is complete and tries to access setup page
  if (user.profile_completed && isSetupPage) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Guest Route Component (for login/register pages)
const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="page-content">Loading...</div>;
  if (user) {
    return user.profile_completed ? <Navigate to="/dashboard" replace /> : <Navigate to="/profile-setup" replace />;
  }
  
  return children;
};

// Layout Component
const MainLayout = ({ children }) => {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <main>
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      wsService.connect();
      
      const handleWsEvent = (data) => {
        if (data.event === 'task_created') {
          toast.info(`New Task Created: ${data.title}`);
        } else if (data.event === 'task_updated') {
          toast.success(`Task Updated: ${data.title}`);
        } else if (data.event === 'task_completed') {
          toast.success(`Task Completed: ${data.title}`);
        } else if (data.event === 'task_deleted') {
          toast.error(`Task Deleted`);
        }
        
        // Broadcast custom events to trigger re-fetches without reloading the page
        window.dispatchEvent(new Event('refresh-tasks'));
        window.dispatchEvent(new Event('refresh-activities'));
      };
      
      wsService.addListener(handleWsEvent);
      
      return () => {
        wsService.removeListener(handleWsEvent);
        wsService.disconnect();
      };
    }
  }, [user]);

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        {/* Public Routes */}
      <Route path="/login" element={
        <GuestRoute>
          <Login />
        </GuestRoute>
      } />
      <Route path="/register" element={
        <GuestRoute>
          <Register />
        </GuestRoute>
      } />

      <Route path="/profile-setup" element={
        <ProtectedRoute>
          <ProfileSetup />
        </ProtectedRoute>
      } />

      {/* Protected Routes inside Main Layout */}
      <Route path="/" element={
        <ProtectedRoute>
          <Navigate to="/dashboard" replace />
        </ProtectedRoute>
      } />

      <Route path="/dashboard" element={
        <ProtectedRoute>
          <MainLayout>
            <Dashboard />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/tasks" element={
        <ProtectedRoute>
          <MainLayout>
            <MyTasks />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/kanban" element={
        <ProtectedRoute>
          <MainLayout>
            <Kanban />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/calendar" element={
        <ProtectedRoute>
          <MainLayout>
            <CalendarView />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/analytics" element={
        <ProtectedRoute>
          <MainLayout>
            <Analytics />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/reports" element={
        <ProtectedRoute>
          <MainLayout>
            <ReportsPage />
          </MainLayout>
        </ProtectedRoute>
      } />


      <Route path="/notifications" element={
        <ProtectedRoute>
          <MainLayout>
            <NotificationsPage />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/settings" element={
        <ProtectedRoute>
          <MainLayout>
            <Settings />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/profile" element={
        <ProtectedRoute>
          <MainLayout>
            <Profile />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/organizations" element={
        <ProtectedRoute>
          <MainLayout>
            <Organizations />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/teams" element={
        <ProtectedRoute>
          <MainLayout>
            <Teams />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/teams/:id" element={
        <ProtectedRoute>
          <MainLayout>
            <TeamDetails />
          </MainLayout>
        </ProtectedRoute>
      } />

      
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
