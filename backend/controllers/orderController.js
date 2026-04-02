const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Driver = require('../models/Driver');
const Product = require('../models/Product');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
    return;
  } else {
    const normalizedOrderItems = [];

    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        res.status(404);
        throw new Error(`Product not found for item: ${item.name || item.product}`);
      }

      const qty = Number(item.qty);
      if (!Number.isFinite(qty) || qty <= 0) {
        res.status(400);
        throw new Error(`Invalid quantity for ${product.name}`);
      }

      const requestedQty = Number(qty.toFixed(2));
      const availableStock = Number(product.countInStock || 0);
      if (requestedQty > availableStock) {
        res.status(400);
        throw new Error(`Insufficient stock for ${product.name}. Available: ${availableStock}`);
      }

      product.countInStock = Number((availableStock - requestedQty).toFixed(2));
      await product.save();

      normalizedOrderItems.push({
        ...item,
        qty: requestedQty,
        name: product.name,
        image: product.image,
        price: product.price,
      });
    }

    const order = new Order({
      orderItems: normalizedOrderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.email_address,
    };

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.status = req.body.status;
    
    // Automatically flag delivery time and update driver status
    if (req.body.status === 'Delivered' && !order.deliveredAt) {
      order.deliveredAt = Date.now();
      
      // If order has an assigned driver, mark driver as Available
      if (order.assignedDriver) {
        await Driver.findByIdAndUpdate(
          order.assignedDriver,
          { status: 'Available' },
          { new: true }
        );
      }
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get all orders globally (Admin)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('user', 'fullName email').sort({ createdAt: -1 });
  res.json(orders);
});

module.exports = {
  addOrderItems,
  getMyOrders,
  updateOrderToPaid,
  updateOrderStatus,
  getAllOrders,
};
