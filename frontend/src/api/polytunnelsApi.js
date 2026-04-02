import api from './client';

export const getPolytunnels = (config) => api.get('/api/polytunnels', config);
export const createPolytunnel = (payload, config) => api.post('/api/polytunnels', payload, config);
export const updatePolytunnel = (tunnelId, payload, config) =>
  api.put(`/api/polytunnels/${tunnelId}`, payload, config);
export const deletePolytunnel = (tunnelId, config) => api.delete(`/api/polytunnels/${tunnelId}`, config);

export const getTunnelEmployees = (config) => api.get('/api/polytunnels/employees', config);
export const createTunnelEmployee = (payload, config) => api.post('/api/polytunnels/employees', payload, config);
export const updateTunnelEmployee = (employeeId, payload, config) =>
  api.put(`/api/polytunnels/employees/${employeeId}`, payload, config);

export const recordHarvest = (payload, config) => api.post('/api/polytunnels/harvests', payload, config);
