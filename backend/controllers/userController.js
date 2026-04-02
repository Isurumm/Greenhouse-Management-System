const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc    Get current user's profile
// @route   GET /api/users/profile
// @access  Private
const getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json({
    _id: user._id,
    name: user.fullName,
    email: user.email,
    phone: user.phone || '',
    address: user.address || '',
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
});

// @desc    Update current user's profile
// @route   PUT /api/users/profile
// @access  Private
const updateMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { fullName, email, phone, address, password } = req.body;

  if (email && email !== user.email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      res.status(400);
      throw new Error('Email already in use');
    }
  }

  user.fullName = fullName ?? user.fullName;
  user.email = email ?? user.email;
  user.phone = phone ?? user.phone;
  user.address = address ?? user.address;

  if (password) {
    user.password = password;
  }

  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    name: updatedUser.fullName,
    email: updatedUser.email,
    phone: updatedUser.phone || '',
    address: updatedUser.address || '',
    role: updatedUser.role,
    isActive: updatedUser.isActive,
    createdAt: updatedUser.createdAt,
    updatedAt: updatedUser.updatedAt,
  });
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin, UserCustomerManager)
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password').sort({ createdAt: -1 });
  const formattedUsers = users.map(user => ({
    _id: user._id,
    name: user.fullName,
    email: user.email,
    phone: user.phone,
    address: user.address,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
  }));
  res.json(formattedUsers);
});

// @desc    Create user (Admin/UserCustomerManager)
// @route   POST /api/users
// @access  Private (Admin, UserCustomerManager)
const createUser = asyncHandler(async (req, res) => {
  const { fullName, email, password, role, phone, address } = req.body;

  if (!fullName || !email || !password || !phone || !address) {
    res.status(400);
    throw new Error('Full name, email, password, phone, and address are required');
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    fullName,
    email,
    password,
    role: role || 'customer',
    phone: phone || '',
    address: address || '',
    isActive: true,
  });

  res.status(201).json({
    _id: user._id,
    name: user.fullName,
    email: user.email,
    phone: user.phone,
    address: user.address,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
  });
});

// @desc    Update user details
// @route   PUT /api/users/:id
// @access  Private (Admin, UserCustomerManager)
const updateUser = asyncHandler(async (req, res) => {
  if (req.user._id.toString() === req.params.id) {
    res.status(400);
    throw new Error('You cannot update your own account from user management.');
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.email === 'admin@example.com') {
    res.status(400);
    throw new Error('You cannot modify the root administrator.');
  }

  const { fullName, email, role, phone, address, isActive, password } = req.body;

  if (!fullName || !email || !phone || !address) {
    res.status(400);
    throw new Error('Full name, email, phone, and address are required');
  }

  const normalizedEmail = email.toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser && existingUser._id.toString() !== user._id.toString()) {
    res.status(400);
    throw new Error('Email already in use');
  }

  user.fullName = fullName;
  user.email = normalizedEmail;
  user.role = role || user.role;
  user.phone = phone;
  user.address = address;

  if (typeof isActive === 'boolean') {
    user.isActive = isActive;
  }

  if (password) {
    user.password = password;
  }

  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    name: updatedUser.fullName,
    email: updatedUser.email,
    role: updatedUser.role,
    phone: updatedUser.phone,
    address: updatedUser.address,
    isActive: updatedUser.isActive,
    createdAt: updatedUser.createdAt,
  });
});

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private (Admin, UserCustomerManager)
const updateUserRole = asyncHandler(async (req, res) => {
  // Prevent admin from demoting themselves
  if (req.user._id.toString() === req.params.id) {
     res.status(400);
     throw new Error('You cannot modify your own primary role.');
  }

  const user = await User.findById(req.params.id);

  if (user) {
    if (user.email === 'admin@example.com') {
       res.status(400);
       throw new Error('You cannot modify the root administrator.');
    }

    user.role = req.body.role || user.role;
    const updatedUser = await user.save();
    
    // Send back without password
    res.json({
      _id: updatedUser._id,
      name: updatedUser.fullName,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
const deleteUser = asyncHandler(async (req, res) => {
  // Prevent admin from deleting themselves
  if (req.user._id.toString() === req.params.id) {
     res.status(400);
     throw new Error('You cannot delete your own primary account.');
  }

  const user = await User.findById(req.params.id);

  if (user) {
    if (user.email === 'admin@example.com') {
       res.status(400);
       throw new Error('You cannot delete the root administrator.');
    }

    await user.deleteOne();
    res.json({ message: 'User permanently deleted' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

module.exports = {
  getMyProfile,
  updateMyProfile,
  getUsers,
  createUser,
  updateUser,
  updateUserRole,
  deleteUser,
};
