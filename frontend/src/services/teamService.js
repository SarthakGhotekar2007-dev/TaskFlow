import api from './api';

const teamService = {
  getTeams: async () => {
    const response = await api.get('/teams/');
    return response.data;
  },
  createTeam: async (organizationId, data) => {
    const response = await api.post(`/teams/?organization_id=${organizationId}`, data);
    return response.data;
  },
  updateTeam: async (teamId, data) => {
    const response = await api.put(`/teams/${teamId}`, data);
    return response.data;
  },
  deleteTeam: async (teamId) => {
    const response = await api.delete(`/teams/${teamId}`);
    return response.data;
  },
  getTeamMembers: async (teamId) => {
    const response = await api.get(`/teams/${teamId}/members`);
    return response.data;
  },
  addTeamMember: async (teamId, userId, role = 'Member') => {
    const response = await api.post(`/teams/${teamId}/members?user_id=${userId}&role=${role}`);
    return response.data;
  },
  removeTeamMember: async (teamId, userId) => {
    const response = await api.delete(`/teams/${teamId}/members/${userId}`);
    return response.data;
  }
};

export default teamService;
