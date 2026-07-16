export const getDisplayName = (user) => {
  if (!user) return 'User';
  
  const fullName = user?.profile?.full_name || user?.name;
  if (fullName && fullName.trim() !== '') {
    return fullName.trim().split(/\s+/)[0];
  }
  
  if (user?.username && user.username.trim() !== '') {
    return user.username;
  }
  
  return 'User';
};

export const getFullName = (user) => {
  if (!user) return 'User';
  
  const fullName = user?.profile?.full_name || user?.name;
  if (fullName && fullName.trim() !== '') {
    return fullName.trim();
  }
  
  if (user?.username && user.username.trim() !== '') {
    return user.username;
  }
  
  return 'User';
};
