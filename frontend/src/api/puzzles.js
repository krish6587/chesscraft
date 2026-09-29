import api from './client';

export const puzzlesApi = {
  getPuzzles: async (difficulty = null) => {
    const response = await api.get('/puzzles', {
      params: difficulty !== null ? { difficulty } : {},
    });
    return response.data;
  },

  getRandomPuzzle: async (difficulty = null) => {
    const response = await api.get('/puzzles/random', {
      params: difficulty !== null ? { difficulty } : {},
    });
    return response.data;
  },

  getPuzzleById: async (id) => {
    const response = await api.get(`/puzzles/${id}`);
    return response.data;
  },

  recordAttempt: async (puzzleId, solved) => {
    const response = await api.post('/puzzles/attempt', {
      puzzleId,
      solved,
    });
    return response.data;
  },

  getUserPuzzleHistory: async () => {
    const response = await api.get('/puzzles/history');
    return response.data;
  },
};
