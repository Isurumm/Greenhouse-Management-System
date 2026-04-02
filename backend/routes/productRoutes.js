const express = require('express');
const router = express.Router();
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { RBAC } = require('../constants/rbac');

router.route('/')
   .get(getProducts)
   .post(protect, authorize(...RBAC.PRODUCT_MANAGEMENT), createProduct);

router.route('/:id')
   .get(getProductById)
   .put(protect, authorize(...RBAC.PRODUCT_MANAGEMENT), updateProduct)
   .delete(protect, authorize(...RBAC.PRODUCT_MANAGEMENT), deleteProduct);

module.exports = router;
