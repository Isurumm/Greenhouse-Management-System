const asyncHandler = require('express-async-handler');
const InventoryTransaction = require('../models/InventoryTransaction');
const Product = require('../models/Product');

// @desc    Get transactions for a product
// @route   GET /api/inventory/:productId
// @access  Private (Admin, Inventory Manager)
const getTransactions = asyncHandler(async (req, res) => {
  const transactions = await InventoryTransaction.find({ product: req.params.productId })
    .populate('user', 'fullName email')
    .sort({ createdAt: -1 });
  
  res.json(transactions);
});

// @desc    Add a new inventory transaction
// @route   POST /api/inventory/:productId
// @access  Private (Admin, Inventory Manager)
const addTransaction = asyncHandler(async (req, res) => {
  const { type, quantity, reference } = req.body;
  const productId = req.params.productId;

  const product = await Product.findById(productId);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Prevent negative stock
  if (product.countInStock + Number(quantity) < 0) {
    res.status(400);
    throw new Error('Transaction would result in negative inventory bounds');
  }
//Values we enter in Form, Saves to database
  const transaction = await InventoryTransaction.create({
    product: productId,
    type,
    quantity: Number(quantity),
    reference,
    user: req.user._id,
  });

  // Automatically adjust the product total
  product.countInStock += Number(quantity);
  await product.save();

  res.status(201).json(transaction);
});

module.exports = {
  getTransactions,
  addTransaction,
};
