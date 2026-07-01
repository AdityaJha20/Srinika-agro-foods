const express = require('express');
const adminController = require('../controllers/admin.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

const router = express.Router();

// All admin routes are protected and restricted to admin
router.use(protect, restrictTo('admin'));

// GET /api/v1/admin/stats
router.get('/stats', adminController.getDashboardStats);

module.exports = router;
