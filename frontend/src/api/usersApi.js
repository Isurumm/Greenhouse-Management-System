import api from './client';

export const getUsers = (config) => api.get('/api/users', config);
export const createUser = (payload, config) => api.post('/api/users', payload, config);
export const updateUser = (userId, payload, config) => api.put(`/api/users/${userId}`, payload, config);
export const deleteUser = (userId, config) => api.delete(`/api/users/${userId}`, config);
export const updateUserRole = (userId, payload, config) =>
  api.put(`/api/users/${userId}/role`, payload, config);
export const getMyProfile = (config) => api.get('/api/users/profile', config);
export const updateMyProfile = (payload, config) => api.put('/api/users/profile', payload, config);
