const express = require('express');
const router = express.Router();
const { getDashboardAnalytics } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { RBAC } = require('../constants/rbac');

router.get('/dashboard', protect, authorize(...RBAC.DASHBOARD), getDashboardAnalytics);

module.exports = router;
