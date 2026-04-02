import api from './client';

export const getVehicles = (config) => api.get('/api/deliveries/vehicles', config);
export const createVehicle = (payload, config) => api.post('/api/deliveries/vehicles', payload, config);
export const updateVehicle = (vehicleId, payload, config) =>
  api.put(`/api/deliveries/vehicles/${vehicleId}`, payload, config);

export const getDrivers = (config) => api.get('/api/deliveries/drivers', config);
export const createDriver = (payload, config) => api.post('/api/deliveries/drivers', payload, config);
export const updateDriver = (driverId, payload, config) =>
  api.put(`/api/deliveries/drivers/${driverId}`, payload, config);

export const getPendingOrders = (config) => api.get('/api/deliveries/pending-orders', config);
export const assignDispatch = (payload, config) => api.post('/api/deliveries/assign', payload, config);
