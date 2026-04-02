import api from './client';

export const loginUser = (email, password, config) =>
  api.post('/api/auth/login', { email, password }, config);

export const signupUser = (userData, config) =>
  api.post('/api/auth/signup', userData, config);
