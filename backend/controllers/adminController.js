const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Polytunnel = require('../models/Polytunnel');
const TunnelEmployee = require('../models/TunnelEmployee');
const Harvest = require('../models/Harvest');
const InventoryTransaction = require('../models/InventoryTransaction');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');

const ORDER_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const ROLES = [
  'admin',
  'customer',
  'polytunnelManager',
  'inventoryManager',
  'orderManager',
  'userCustomerManager',
];

const toStartOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const buildRecentMonths = (months) => {
  const buckets = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleString('en-US', { month: 'short' });
    buckets.push({ key, label, count: 0, revenue: 0 });
  }

  return buckets;
};

// @desc    Get admin dashboard analytics
// @route   GET /api/admin/dashboard
// @access  Private (Admin + manager roles)
const getDashboardAnalytics = asyncHandler(async (req, res) => {
  const days = Number(req.query.days) > 0 ? Number(req.query.days) : 30;
  const trendMonths = 6;
  const now = new Date();
  const startToday = toStartOfDay(now);
  const rangeStart = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));

  const [
    users,
    products,
    orders,
    tunnels,
    employees,
    harvests,
    transactions,
    vehicles,
    drivers,
  ] = await Promise.all([
    User.find({}).select('role isActive createdAt fullName email').lean(),
    Product.find({}).select('name category countInStock minStockLevel price updatedAt').lean(),
    Order.find({})
      .select('status isPaid totalPrice createdAt deliveredAt user shippingAddress orderItems assignedDriver')
      .populate('user', 'fullName email')
      .populate('assignedDriver', 'fullName')
      .sort({ createdAt: -1 })
      .lean(),
    Polytunnel.find({}).select('name status cropType createdAt').lean(),
    TunnelEmployee.find({}).select('fullName roleTitle assignedTunnel createdAt').populate('assignedTunnel', 'name').lean(),
    Harvest.find({})
      .select('quantity createdAt date tunnel product recordedBy')
      .populate('tunnel', 'name')
      .populate('product', 'name')
      .populate('recordedBy', 'fullName')
      .sort({ createdAt: -1 })
      .lean(),
    InventoryTransaction.find({})
      .select('type quantity reference createdAt product user')
      .populate('product', 'name')
      .populate('user', 'fullName')
      .sort({ createdAt: -1 })
      .lean(),
    Vehicle.find({}).select('status licensePlate model').lean(),
    Driver.find({}).select('status fullName assignedVehicle').lean(),
  ]);

  const userCounts = {
    total: users.length,
    active: users.filter((u) => u.isActive).length,
    inactive: users.filter((u) => !u.isActive).length,
    byRole: ROLES.reduce((acc, role) => {
      acc[role] = users.filter((u) => u.role === role).length;
      return acc;
    }, {}),
  };

  const lowStockItems = products
    .filter((p) => p.countInStock > 0 && p.countInStock <= p.minStockLevel)
    .sort((a, b) => a.countInStock - b.countInStock);
  const outOfStockItems = products.filter((p) => p.countInStock <= 0);
  const categoryCounts = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});
  const topCategories = Object.entries(categoryCounts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  const orderStatusCounts = ORDER_STATUSES.reduce((acc, status) => {
    acc[status] = orders.filter((o) => o.status === status).length;
    return acc;
  }, {});

  const paidOrders = orders.filter((o) => o.isPaid);
  const unpaidOrders = orders.filter((o) => !o.isPaid);

  const ordersToday = orders.filter((o) => new Date(o.createdAt) >= startToday);
  const deliveredToday = orders.filter((o) => o.deliveredAt && new Date(o.deliveredAt) >= startToday);

  const monthlyTrend = buildRecentMonths(trendMonths);
  const monthlyLookup = monthlyTrend.reduce((acc, month) => {
    acc[month.key] = month;
    return acc;
  }, {});

  orders.forEach((order) => {
    const d = new Date(order.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (monthlyLookup[key]) {
      monthlyLookup[key].count += 1;
      if (order.isPaid) {
        monthlyLookup[key].revenue += Number(order.totalPrice || 0);
      }
    }
  });

  const productDemand = {};
  orders.forEach((order) => {
    (order.orderItems || []).forEach((item) => {
      productDemand[item.name] = (productDemand[item.name] || 0) + Number(item.qty || 0);
    });
  });

  const topProducts = Object.entries(productDemand)
    .map(([name, quantity]) => ({ name, quantity }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const tunnelStatusCounts = ['Active', 'Maintenance', 'Fallow'].reduce((acc, status) => {
    acc[status] = tunnels.filter((t) => t.status === status).length;
    return acc;
  }, {});

  const harvestToday = harvests.filter((h) => new Date(h.createdAt || h.date) >= startToday);
  const harvestInRange = harvests.filter((h) => new Date(h.createdAt || h.date) >= rangeStart);

  const stockInRange = transactions.filter((tx) => new Date(tx.createdAt) >= rangeStart);

  const customerGrowth = users
    .filter((u) => u.role === 'customer')
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const recentCustomers = users
    .filter((u) => u.role === 'customer')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
    .map((u) => ({
      _id: u._id,
      fullName: u.fullName,
      email: u.email,
      createdAt: u.createdAt,
      isActive: u.isActive,
    }));

  const recentOrders = orders.slice(0, 8).map((o) => ({
    _id: o._id,
    customerName: o.user?.fullName || 'Unknown',
    customerEmail: o.user?.email || null,
    status: o.status,
    isPaid: o.isPaid,
    totalPrice: o.totalPrice,
    city: o.shippingAddress?.city,
    createdAt: o.createdAt,
  }));

  const recentInventoryTransactions = transactions.slice(0, 8).map((tx) => ({
    _id: tx._id,
    type: tx.type,
    quantity: tx.quantity,
    reference: tx.reference,
    productName: tx.product?.name,
    userName: tx.user?.fullName,
    createdAt: tx.createdAt,
  }));

  const recentHarvests = harvests.slice(0, 8).map((h) => ({
    _id: h._id,
    quantity: h.quantity,
    tunnelName: h.tunnel?.name || 'Unknown Tunnel',
    productName: h.product?.name || 'Unknown Product',
    recordedBy: h.recordedBy?.fullName || 'Unknown User',
    createdAt: h.createdAt || h.date,
  }));

  const recentAssignments = orders
    .filter((o) => Boolean(o.assignedDriver))
    .slice(0, 8)
    .map((o) => ({
      _id: o._id,
      customerName: o.user?.fullName || 'Unknown',
      driverName: o.assignedDriver?.fullName || 'Unknown Driver',
      status: o.status,
      city: o.shippingAddress?.city || 'N/A',
      createdAt: o.createdAt,
    }));

  const alerts = {
    lowStockCount: lowStockItems.length,
    outOfStockCount: outOfStockItems.length,
    maintenanceTunnels: tunnelStatusCounts.Maintenance,
    unassignedEmployees: employees.filter((e) => !e.assignedTunnel).length,
    unavailableDrivers: drivers.filter((d) => d.status !== 'Available').length,
    vehiclesInMaintenance: vehicles.filter((v) => v.status === 'Maintenance').length,
    unpaidOrders: unpaidOrders.length,
    pendingOrProcessingOrders: orders.filter((o) => ['Pending', 'Processing'].includes(o.status)).length,
  };

  res.json({
    generatedAt: now,
    filters: {
      days,
      trendMonths,
    },
    users: {
      ...userCounts,
      recentCustomers,
      customerGrowth: {
        total: customerGrowth.length,
        last30Days: customerGrowth.filter((c) => new Date(c.createdAt) >= rangeStart).length,
      },
    },
    products: {
      total: products.length,
      lowStock: lowStockItems.length,
      outOfStock: outOfStockItems.length,
      inStock: products.filter((p) => p.countInStock > p.minStockLevel).length,
      inventoryUnits: products.reduce((sum, p) => sum + Number(p.countInStock || 0), 0),
      inventoryValueEstimate: products.reduce((sum, p) => sum + (Number(p.countInStock || 0) * Number(p.price || 0)), 0),
      topCategories,
      lowStockItems: lowStockItems.slice(0, 10),
      outOfStockItems: outOfStockItems.slice(0, 10),
      topProducts,
    },
    orders: {
      total: orders.length,
      today: ordersToday.length,
      deliveredToday: deliveredToday.length,
      paid: paidOrders.length,
      unpaid: unpaidOrders.length,
      statusCounts: orderStatusCounts,
      revenuePaid: paidOrders.reduce((sum, order) => sum + Number(order.totalPrice || 0), 0),
      recent: recentOrders,
      monthlyTrend,
    },
    deliveries: {
      vehicles: {
        total: vehicles.length,
        active: vehicles.filter((v) => v.status === 'Active').length,
        maintenance: vehicles.filter((v) => v.status === 'Maintenance').length,
      },
      drivers: {
        total: drivers.length,
        available: drivers.filter((d) => d.status === 'Available').length,
        onRoute: drivers.filter((d) => d.status === 'On Route').length,
        offDuty: drivers.filter((d) => d.status === 'Off Duty').length,
      },
      byOrderStatus: {
        processing: orderStatusCounts.Processing,
        shipped: orderStatusCounts.Shipped,
        delivered: orderStatusCounts.Delivered,
      },
      recentAssignments,
    },
    polytunnels: {
      total: tunnels.length,
      statusCounts: tunnelStatusCounts,
      employees: {
        total: employees.length,
        assigned: employees.filter((e) => Boolean(e.assignedTunnel)).length,
        unassigned: employees.filter((e) => !e.assignedTunnel).length,
      },
      harvest: {
        totalEntries: harvests.length,
        entriesInRange: harvestInRange.length,
        entriesToday: harvestToday.length,
        quantityInRange: harvestInRange.reduce((sum, h) => sum + Number(h.quantity || 0), 0),
        recentHarvests,
      },
    },
    inventory: {
      transactionsInRange: stockInRange.length,
      recentTransactions: recentInventoryTransactions,
    },
    alerts,
  });
});

module.exports = {
  getDashboardAnalytics,
};
