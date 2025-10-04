// services/userService.ts

import api from '../app/lib/api';

export const getUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

export const createUser = async (payload: { name: string; email: string }) => {
  const response = await api.post('/users', payload);
  return response.data;
};
