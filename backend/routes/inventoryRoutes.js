const express = require('express');
const router = express.Router();
const { getTransactions, addTransaction } = require('../controllers/inventoryController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { RBAC } = require('../constants/rbac');

router.route('/:productId')
  .get(protect, authorize(...RBAC.INVENTORY), getTransactions)
  .post(protect, authorize(...RBAC.INVENTORY), addTransaction);

module.exports = router;
