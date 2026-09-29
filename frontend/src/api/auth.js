import api from './client';

export const authApi = {
  login: async (emailOrUsername, password) => {
    const response = await api.post('/auth/login', {
      emailOrUsername,
      password,
    });
    return response.data;
  },

  register: async (username, email, password, confirmPassword) => {
    const response = await api.post('/auth/register', {
      username,
      email,
      password,
      confirmPassword,
    });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  changePassword: async (currentPassword, newPassword, confirmNewPassword) => {
    const response = await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
      confirmNewPassword,
    });
    return response.data;
  },
};
