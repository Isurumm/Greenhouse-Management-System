import api from './client';

export const createOrder = (payload, config) => api.post('/api/orders', payload, config);
export const payOrder = (orderId, payload, config) => api.put(`/api/orders/${orderId}/pay`, payload, config);
export const getMyOrders = (config) => api.get('/api/orders/myorders', config);
export const getAllOrders = (config) => api.get('/api/orders/admin/all', config);
export const updateOrderStatus = (orderId, payload, config) =>
  api.put(`/api/orders/${orderId}/status`, payload, config);
