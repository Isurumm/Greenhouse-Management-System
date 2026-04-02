import api from './client';

export const getInventoryTransactions = (productId, config) =>
  api.get(`/api/inventory/${productId}`, config);

export const addInventoryTransaction = (productId, payload, config) =>
  api.post(`/api/inventory/${productId}`, payload, config);
