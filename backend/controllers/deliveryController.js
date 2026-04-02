const asyncHandler = require('express-async-handler');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Order = require('../models/Order');

// ======== VEHICLES ========

// @desc    Get all vehicles
// @route   GET /api/deliveries/vehicles
// @access  Private (Admin)
const getVehicles = asyncHandler(async (req, res) => {
  const vehicles = await Vehicle.find({});
  res.json(vehicles);
});

// @desc    Create a vehicle
// @route   POST /api/deliveries/vehicles
// @access  Private
const createVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.create(req.body);
  res.status(201).json(vehicle);
});

// @desc    Update a vehicle
// @route   PUT /api/deliveries/vehicles/:id
// @access  Private
const updateVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);
  if (vehicle) {
    vehicle.licensePlate = req.body.licensePlate || vehicle.licensePlate;
    vehicle.model = req.body.model || vehicle.model;
    vehicle.capacity = req.body.capacity || vehicle.capacity;
    vehicle.status = req.body.status || vehicle.status;
    const updatedVehicle = await vehicle.save();
    res.json(updatedVehicle);
  } else {
    res.status(404);
    throw new Error('Vehicle not found');
  }
});

// ======== DRIVERS ========

// @desc    Get all drivers
// @route   GET /api/deliveries/drivers
// @access  Private
const getDrivers = asyncHandler(async (req, res) => {
  const drivers = await Driver.find({}).populate('assignedVehicle');
  res.json(drivers);
});

// @desc    Create a driver
// @route   POST /api/deliveries/drivers
// @access  Private
const createDriver = asyncHandler(async (req, res) => {
  const driver = await Driver.create(req.body);
  res.status(201).json(driver);
});

// @desc    Update a driver
// @route   PUT /api/deliveries/drivers/:id
// @access  Private
const updateDriver = asyncHandler(async (req, res) => {
  const driver = await Driver.findById(req.params.id);
  if (driver) {
    driver.fullName = req.body.fullName || driver.fullName;
    driver.phone = req.body.phone || driver.phone;
    driver.licenseNumber = req.body.licenseNumber || driver.licenseNumber;
    driver.assignedVehicle = req.body.assignedVehicle !== undefined ? req.body.assignedVehicle : driver.assignedVehicle;
    driver.status = req.body.status || driver.status;
    const updatedDriver = await driver.save();
    res.json(updatedDriver);
  } else {
    res.status(404);
    throw new Error('Driver not found');
  }
});

// ======== DISPATCH LOGIC ========

// @desc    Get orders waiting for dispatch (Processing status)
// @route   GET /api/deliveries/pending-orders
// @access  Private
const getDispatchOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ status: { $in: ['Processing', 'Shipped', 'Delivered'] } })
     .populate('user', 'name')
     .populate('assignedDriver', 'fullName phone')
     .sort({ createdAt: -1 });
  res.json(orders);
});

// @desc    Assign a driver to an order
// @route   POST /api/deliveries/assign
// @access  Private
const assignDispatch = asyncHandler(async (req, res) => {
  const { orderId, driverId } = req.body;

  const order = await Order.findById(orderId);
  const driver = await Driver.findById(driverId);

  if (!order || !driver) {
    res.status(404);
    throw new Error('Order or Driver not found in database');
  }

  // Update order logic
  order.assignedDriver = driver._id;
  // Assigning a driver moves the order to Shipped status
  if (order.status === 'Processing') {
     order.status = 'Shipped';
  }
  
  // Tag driver as On Route
  driver.status = 'On Route';

  await driver.save();
  const updatedOrder = await order.save();

  res.json(updatedOrder);
});

module.exports = {
  getVehicles,
  createVehicle,
  updateVehicle,
  getDrivers,
  createDriver,
  updateDriver,
  getDispatchOrders,
  assignDispatch
};
