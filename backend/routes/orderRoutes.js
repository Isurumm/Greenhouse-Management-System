const express = require('express');
const router = express.Router();
const { addOrderItems, getMyOrders, updateOrderToPaid, updateOrderStatus, getAllOrders } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { RBAC } = require('../constants/rbac');

const checkRole = authorize(...RBAC.ORDERS);

router.route('/').post(protect, addOrderItems);
router.route('/admin/all').get(protect, checkRole, getAllOrders);
router.route('/myorders').get(protect, getMyOrders);
router.route('/:id/pay').put(protect, updateOrderToPaid);
router.route('/:id/status').put(protect, checkRole, updateOrderStatus);

module.exports = router;
