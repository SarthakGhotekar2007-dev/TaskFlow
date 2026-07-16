import api from './api';

const taskService = {
  // Get all tasks for the logged in user
  getTasks: async () => {
    const response = await api.get('/tasks/');
    return response.data;
  },

  // Get a single task by ID
  getTaskById: async (id) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  // Create a new task
  createTask: async (taskData) => {
    const response = await api.post('/tasks/', taskData);
    return response.data;
  },

  // Update an existing task
  updateTask: async (id, taskData) => {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  },

  // Delete a task
  deleteTask: async (id) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },

  archiveTask: async (id) => {
    const response = await api.post(`/tasks/${id}/archive`);
    return response.data;
  },

  restoreTask: async (id) => {
    const response = await api.post(`/tasks/${id}/restore`);
    return response.data;
  },

  duplicateTask: async (id) => {
    const response = await api.post(`/tasks/${id}/duplicate`);
    return response.data;
  },

  getComments: async (taskId) => {
    const response = await api.get(`/tasks/${taskId}/comments`);
    return response.data;
  },

  addComment: async (taskId, content) => {
    const response = await api.post(`/tasks/${taskId}/comments`, { content });
    return response.data;
  },

  // Get activity history
  getActivityHistory: async () => {
    const response = await api.get('/activity/');
    return response.data;
  },

  assignTask: async (taskId, userId) => {
    const response = await api.put(`/tasks/${taskId}/assign?user_id=${userId}`);
    return response.data;
  },

  getAssignedTasks: async () => {
    const response = await api.get('/tasks/assigned/me');
    return response.data;
  },

  uploadAttachment: async (taskId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/tasks/${taskId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  getAttachments: async (taskId) => {
    const response = await api.get(`/tasks/${taskId}/attachments`);
    return response.data;
  },

  deleteAttachment: async (attachmentId) => {
    const response = await api.delete(`/tasks/attachments/${attachmentId}`);
    return response.data;
  }

};

export default taskService;
