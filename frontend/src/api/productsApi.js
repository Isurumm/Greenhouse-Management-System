import api from './client';

export const getProducts = (config) => api.get('/api/products', config);
export const getProductById = (productId, config) => api.get(`/api/products/${productId}`, config);
export const createProduct = (payload, config) => api.post('/api/products', payload, config);
export const updateProduct = (productId, payload, config) =>
  api.put(`/api/products/${productId}`, payload, config);
export const deleteProduct = (productId, config) => api.delete(`/api/products/${productId}`, config);
