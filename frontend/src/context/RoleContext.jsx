import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';

export const RoleContext = createContext();

export const RoleProvider = ({ children }) => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [role, setRole] = useState('user');

  useEffect(() => {
    if (user && user.role) {
      setRole(user.role.toLowerCase());
    } else {
      setRole('user');
    }
  }, [user]);

  // Utility methods
  const isAdmin = () => role === 'admin';
  const isManager = () => role === 'manager';
  const isUser = () => role === 'user';
  
  // High-level access checkers
  const canManageUsers = () => isAdmin();
  const canAssignTasks = () => isAdmin() || isManager();
  const canViewAnalytics = () => isAdmin() || isManager();
  
  // Task specific permissions
  const canDeleteAnyTask = () => isAdmin();
  const canUpdateAnyTask = () => isAdmin() || isManager();

  return (
    <RoleContext.Provider value={{ 
      role, 
      isAdmin, 
      isManager, 
      isUser,
      canManageUsers,
      canAssignTasks,
      canViewAnalytics,
      canDeleteAnyTask,
      canUpdateAnyTask,
      loading: authLoading
    }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => useContext(RoleContext);
