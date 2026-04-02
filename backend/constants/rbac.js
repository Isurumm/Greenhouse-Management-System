const RBAC = {
  DASHBOARD: ['polytunnelManager', 'inventoryManager', 'orderManager', 'userCustomerManager'],
  POLYTUNNELS: ['polytunnelManager'],
  INVENTORY: ['inventoryManager'],
  ORDERS: ['orderManager'],
  DISPATCH_AND_USERS: ['userCustomerManager'],
  PRODUCT_MANAGEMENT: ['inventoryManager'],
};

module.exports = { RBAC };
