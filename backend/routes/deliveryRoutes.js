const express = require('express');
const router = express.Router();
const {
  getVehicles,
  createVehicle,
  updateVehicle,
  getDrivers,
  createDriver,
  updateDriver,
  getDispatchOrders,
  assignDispatch
} = require('../controllers/deliveryController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { RBAC } = require('../constants/rbac');

const checkRole = authorize(...RBAC.DISPATCH_AND_USERS);

// Vehicles
router.route('/vehicles')
  .get(protect, checkRole, getVehicles)
  .post(protect, checkRole, createVehicle);

router.route('/vehicles/:id')
  .put(protect, checkRole, updateVehicle);

// Drivers
router.route('/drivers')
  .get(protect, checkRole, getDrivers)
  .post(protect, checkRole, createDriver);

router.route('/drivers/:id')
  .put(protect, checkRole, updateDriver);

// Dispatch Flow
router.route('/pending-orders').get(protect, checkRole, getDispatchOrders);
router.route('/assign').post(protect, checkRole, assignDispatch);

module.exports = router;
