const asyncHandler = require('express-async-handler');
const Polytunnel = require('../models/Polytunnel');
const TunnelEmployee = require('../models/TunnelEmployee');
const Harvest = require('../models/Harvest');
const Product = require('../models/Product');
const InventoryTransaction = require('../models/InventoryTransaction');

// @desc    Get all polytunnels
// @route   GET /api/polytunnels
// @access  Private (Admin, PolytunnelManager)
const getPolytunnels = asyncHandler(async (req, res) => {
  const tunnels = await Polytunnel.find({});
  res.json(tunnels);
});

// @desc    Create a polytunnel
// @route   POST /api/polytunnels
// @access  Private
const createPolytunnel = asyncHandler(async (req, res) => {
  const tunnel = await Polytunnel.create(req.body);
  res.status(201).json(tunnel);
});

// @desc    Update a polytunnel
// @route   PUT /api/polytunnels/:id
// @access  Private
const updatePolytunnel = asyncHandler(async (req, res) => {
  const tunnel = await Polytunnel.findById(req.params.id);

  if (tunnel) {
    tunnel.name = req.body.name || tunnel.name;
    tunnel.size = req.body.size || tunnel.size;
    tunnel.status = req.body.status || tunnel.status;
    tunnel.cropType = req.body.cropType || tunnel.cropType;

    const updatedTunnel = await tunnel.save();
    res.json(updatedTunnel);
  } else {
    res.status(404);
    throw new Error('Polytunnel not found');
  }
});

// @desc    Delete a polytunnel
// @route   DELETE /api/polytunnels/:id
// @access  Private
const deletePolytunnel = asyncHandler(async (req, res) => {
  const tunnel = await Polytunnel.findById(req.params.id);

  if (tunnel) {
    // Unassign related employees
    await TunnelEmployee.updateMany({ assignedTunnel: tunnel._id }, { assignedTunnel: null });
    
    await tunnel.deleteOne();
    res.json({ message: 'Polytunnel removed' });
  } else {
    res.status(404);
    throw new Error('Polytunnel not found');
  }
});

// ------------ EMPLOYEES --------------

// @desc    Get tunnel employees
// @route   GET /api/polytunnels/employees
// @access  Private
const getTunnelEmployees = asyncHandler(async (req, res) => {
  const employees = await TunnelEmployee.find({}).populate('assignedTunnel', 'name');
  res.json(employees);
});

// @desc    Create tunnel employee
// @route   POST /api/polytunnels/employees
// @access  Private
const createTunnelEmployee = asyncHandler(async (req, res) => {
  const employee = await TunnelEmployee.create(req.body);
  res.status(201).json(employee);
});

// @desc    Update tunnel employee
// @route   PUT /api/polytunnels/employees/:id
// @access  Private
const updateTunnelEmployee = asyncHandler(async (req, res) => {
  const employee = await TunnelEmployee.findById(req.params.id);

  if (employee) {
    employee.fullName = req.body.fullName || employee.fullName;
    employee.phone = req.body.phone || employee.phone;
    employee.roleTitle = req.body.roleTitle || employee.roleTitle;
    employee.assignedTunnel = req.body.assignedTunnel !== undefined ? req.body.assignedTunnel : employee.assignedTunnel;

    const updatedEmployee = await employee.save();
    res.json(updatedEmployee);
  } else {
    res.status(404);
    throw new Error('Employee not found');
  }
});

// ------------ HARVEST --------------

// @desc    Record a harvest
// @route   POST /api/polytunnels/harvests
// @access  Private
const recordHarvest = asyncHandler(async (req, res) => {
  const { tunnel, product: productId, quantity } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Target product catalog item not found');
  }

  // 1. Log Harvest
  const harvest = await Harvest.create({
    tunnel,
    product: productId,
    quantity: Number(quantity),
    recordedBy: req.user._id,
  });

  // 2. Automate Inventory Transaction Ledger
  const transaction = await InventoryTransaction.create({
    product: productId,
    type: 'Harvest Entry',
    quantity: Number(quantity),
    reference: `Harvest Yield (Tunnel ID: ${tunnel})`,
    user: req.user._id,
  });

  // 3. Update master count
  product.countInStock += Number(quantity);
  await product.save();

  res.status(201).json({ harvest, transaction, updatedProductCount: product.countInStock });
});

module.exports = {
  getPolytunnels,
  createPolytunnel,
  updatePolytunnel,
  deletePolytunnel,
  getTunnelEmployees,
  createTunnelEmployee,
  updateTunnelEmployee,
  recordHarvest,
};
