import api from './api';

const notificationService = {
  getNotifications: async () => {
    const response = await api.get('/notifications/');
    return response.data;
  },

  readNotification: async (id) => {
    const response = await api.put(`/notifications/read/${id}`);
    return response.data;
  },

  readAllNotifications: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },

  deleteNotification: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  }
};

export default notificationService;
