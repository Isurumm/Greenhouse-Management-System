// Middleware to allow access by specific roles
// USAGE: router.get('/', protect, authorize('admin', 'inventoryManager'), controllerCode)
const authorize = (...roles) => {
  return (req, res, next) => {
    // Admin has full access to everything
    if (req.user && (req.user.role === 'admin' || roles.includes(req.user.role))) {
      next();
    } else {
      res.status(403);
      const err = new Error('Not authorized for this role');
      next(err);
    }
  };
};

module.exports = { authorize };
