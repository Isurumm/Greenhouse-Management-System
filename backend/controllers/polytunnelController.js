const asyncHandler = require('express-async-handler');
const Polytunnel = require('../models/Polytunnel');
const TunnelEmployee = require('../models/TunnelEmployee');
const Harvest = require('../models/Harvest');
const Product = require('../models/Product');
const InventoryTransaction = require('../models/InventoryTransaction');

const parseTunnelArea = (size = '') => {
  if (typeof size !== 'string') return null;

  const match = size.match(/(\d+(?:\.\d+)?)\s*[xX]\s*(\d+(?:\.\d+)?)/);
  if (!match) return null;

  const width = Number(match[1]);
  const length = Number(match[2]);

  if (!width || !length) return null;
  return width * length;
};

// @desc    Get all polytunnels
// @route   GET /api/polytunnels
// @access  Private (Admin, PolytunnelManager)
const getPolytunnels = asyncHandler(async (req, res) => {
  const tunnels = await Polytunnel.find({}).lean();

  if (!tunnels.length) {
    return res.json([]);
  }

  const tunnelIds = tunnels.map((tunnel) => tunnel._id);

  const harvestStats = await Harvest.aggregate([
    {
      $match: {
        tunnel: { $in: tunnelIds },
      },
    },
    {
      $sort: {
        date: -1,
        createdAt: -1,
      },
    },
    {
      $group: {
        _id: '$tunnel',
        totalHarvestedKg: { $sum: '$quantity' },
        harvestCount: { $sum: 1 },
        lastHarvestDate: { $first: '$date' },
        recentHarvests: {
          $push: {
            quantity: '$quantity',
            date: '$date',
          },
        },
      },
    },
  ]);

  const harvestMap = new Map(
    harvestStats.map((item) => [String(item._id), item])
  );

  const enrichedTunnels = tunnels.map((tunnel) => {
    const stats = harvestMap.get(String(tunnel._id));
    const areaSqM = parseTunnelArea(tunnel.size);

    if (!stats) {
      return {
        ...tunnel,
        harvestPrediction: {
          predictedNextHarvestKg: null,
          recentAverageKg: null,
          totalHarvestedKg: 0,
          harvestCount: 0,
          lastHarvestDate: null,
          predictedPerSqMKg: null,
          confidence: 'Low',
          note: 'No harvest history yet',
        },
      };
    }

    const recentHarvests = Array.isArray(stats.recentHarvests)
      ? stats.recentHarvests.slice(0, 3)
      : [];

    const recentAverageKg =
      recentHarvests.length > 0
        ? recentHarvests.reduce(
            (sum, item) => sum + Number(item.quantity || 0),
            0
          ) / recentHarvests.length
        : null;

    const predictedNextHarvestKg =
      recentAverageKg !== null ? Number(recentAverageKg.toFixed(2)) : null;

    const predictedPerSqMKg =
      areaSqM && predictedNextHarvestKg !== null
        ? Number((predictedNextHarvestKg / areaSqM).toFixed(3))
        : null;

    let confidence = 'Low';
    if (stats.harvestCount >= 6) confidence = 'High';
    else if (stats.harvestCount >= 3) confidence = 'Medium';

    return {
      ...tunnel,
      harvestPrediction: {
        predictedNextHarvestKg,
        recentAverageKg:
          recentAverageKg !== null ? Number(recentAverageKg.toFixed(2)) : null,
        totalHarvestedKg: Number((stats.totalHarvestedKg || 0).toFixed(2)),
        harvestCount: stats.harvestCount || 0,
        lastHarvestDate: stats.lastHarvestDate || null,
        predictedPerSqMKg,
        confidence,
        note:
          stats.harvestCount < 3
            ? 'Prediction is based on limited harvest history'
            : 'Prediction is based on recent harvest averages',
      },
    };
  });

  res.json(enrichedTunnels);
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
    await TunnelEmployee.updateMany(
      { assignedTunnel: tunnel._id },
      { assignedTunnel: null }
    );

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
  const employees = await TunnelEmployee.find({}).populate(
    'assignedTunnel',
    'name'
  );
  res.json(employees);
});

// @desc    Create tunnel employee
// @route   POST /api/polytunnels/employees
// @access  Private
const createTunnelEmployee = asyncHandler(async (req, res) => {
  const assignedTunnel = req.body.assignedTunnel || null;

  if (assignedTunnel) {
    const existingAssignment = await TunnelEmployee.findOne({ assignedTunnel });

    if (existingAssignment) {
      res.status(409);
      throw new Error('This polytunnel already has a worker assigned');
    }
  }

  const employee = await TunnelEmployee.create({
    ...req.body,
    assignedTunnel,
  });
  res.status(201).json(employee);
});

// @desc    Update tunnel employee
// @route   PUT /api/polytunnels/employees/:id
// @access  Private
const updateTunnelEmployee = asyncHandler(async (req, res) => {
  const employee = await TunnelEmployee.findById(req.params.id);

  if (employee) {
    const assignedTunnel =
      req.body.assignedTunnel !== undefined
        ? req.body.assignedTunnel || null
        : employee.assignedTunnel;

    if (assignedTunnel) {
      const existingAssignment = await TunnelEmployee.findOne({
        assignedTunnel,
        _id: { $ne: employee._id },
      });

      if (existingAssignment) {
        res.status(409);
        throw new Error('This polytunnel already has a worker assigned');
      }
    }

    employee.fullName = req.body.fullName || employee.fullName;
    employee.phone = req.body.phone || employee.phone;
    employee.roleTitle = req.body.roleTitle || employee.roleTitle;
    employee.assignedTunnel = assignedTunnel;

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

  const harvest = await Harvest.create({
    tunnel,
    product: productId,
    quantity: Number(quantity),
    recordedBy: req.user._id,
  });

  const transaction = await InventoryTransaction.create({
    product: productId,
    type: 'Harvest Entry',
    quantity: Number(quantity),
    reference: `Harvest Yield (Tunnel ID: ${tunnel})`,
    user: req.user._id,
  });

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