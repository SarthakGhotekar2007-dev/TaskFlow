import api from './api';

const organizationService = {
  getOrganizations: async () => {
    const response = await api.get('/organizations/');
    return response.data;
  },
  createOrganization: async (data) => {
    const response = await api.post('/organizations/', data);
    return response.data;
  },
  updateOrganization: async (orgId, data) => {
    const response = await api.put(`/organizations/${orgId}`, data);
    return response.data;
  },
  deleteOrganization: async (orgId) => {
    const response = await api.delete(`/organizations/${orgId}`);
    return response.data;
  }
};

export default organizationService;
