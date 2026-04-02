const express = require('express');
const router = express.Router();
const {
  getPolytunnels,
  createPolytunnel,
  updatePolytunnel,
  deletePolytunnel,
  getTunnelEmployees,
  createTunnelEmployee,
  updateTunnelEmployee,
  recordHarvest,
} = require('../controllers/polytunnelController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { RBAC } = require('../constants/rbac');

const checkRole = authorize(...RBAC.POLYTUNNELS);

// Specific routes BEFORE generic routes (:id)
// Harvest route
router.route('/harvests').post(protect, checkRole, recordHarvest);

// Employees routes (specific before /:id)
router.route('/employees')
  .get(protect, checkRole, getTunnelEmployees)
  .post(protect, checkRole, createTunnelEmployee);

router.route('/employees/:id')
  .put(protect, checkRole, updateTunnelEmployee);

// Root route
router.route('/')
  .get(protect, checkRole, getPolytunnels)
  .post(protect, checkRole, createPolytunnel);

// Generic /:id route (must be last)
router.route('/:id')
  .put(protect, checkRole, updatePolytunnel)
  .delete(protect, checkRole, deletePolytunnel);

module.exports = router;
