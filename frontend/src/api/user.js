import api from './client';

export const userApi = {
  getMySettings: async () => {
    const response = await api.get('/users/me/settings');
    return response.data;
  },

  updateMySettings: async (settings) => {
    const response = await api.put('/users/me/settings', settings);
    return response.data;
  },

  getUserSettings: async (userId) => {
    const response = await api.get(`/users/${userId}/settings`);
    return response.data;
  },
};
