const express = require('express');
const router = express.Router();
const {
  getUsers,
  createUser,
  updateUser,
  updateUserRole,
  deleteUser,
  getMyProfile,
  updateMyProfile,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { RBAC } = require('../constants/rbac');

const checkRole = authorize(...RBAC.DISPATCH_AND_USERS);

router.route('/profile')
  .get(protect, getMyProfile)
  .put(protect, updateMyProfile);

router.route('/')
  .get(protect, checkRole, getUsers)
  .post(protect, checkRole, createUser);

router.route('/:id/role')
  .put(protect, checkRole, updateUserRole);

router.route('/:id')
  .put(protect, checkRole, updateUser)
  .delete(protect, checkRole, deleteUser);

module.exports = router;
