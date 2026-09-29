import api from './client';

export const gamesApi = {
  createGame: async (timeControlSeconds = 600, preferredColor = 0) => {
    const response = await api.post('/games', {
      timeControlSeconds,
      preferredColor,
    });
    return response.data;
  },

  joinGame: async (inviteCode) => {
    const response = await api.post('/games/join', {
      inviteCode,
    });
    return response.data;
  },

  getGameByInviteCode: async (inviteCode) => {
    const response = await api.get(`/games/${inviteCode}`);
    return response.data;
  },

  getGameReplay: async (gameId) => {
    const response = await api.get(`/games/${gameId}/replay`);
    return response.data;
  },

  getUserHistory: async (userId, pageNumber = 1, pageSize = 10) => {
    const response = await api.get('/games/history', {
      params: { userId, pageNumber, pageSize },
    });
    return response.data;
  },
};
