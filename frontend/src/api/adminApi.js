import api from './client';

export const getDashboardAnalytics = (config, days = 30) =>
  api.get(`/api/admin/dashboard?days=${days}`, config);
