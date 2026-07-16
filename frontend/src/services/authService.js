import api from './api';

const authService = {
  // Login method
  login: async (email, password) => {
    // Note: The FastAPI backend expects email/password in the JSON body based on the UserLogin schema
    const response = await api.post('/auth/login', { email, password });
    return response.data; // Expected to contain access_token, token_type, and user
  },

  // Register method
  register: async (email, password) => {
    const response = await api.post('/auth/register', { email, password });
    return response.data;
  },

  // Google Login method
  googleLogin: async (userData) => {
    const response = await api.post('/auth/google', userData);
    return response.data;
  },

  // Logout method
  logout: () => {
    localStorage.removeItem('token');
    // Note: User state should be cleared in the Context as well
  }
};

export default authService;
