const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const AppError = require('../utils/AppError');

// Helper to catch async errors and pass them to the express error handler
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

/**
 * @desc    Get dashboard aggregated stats
 * @route   GET /api/v1/admin/stats
 * @access  Private/Admin
 */
const getDashboardStats = catchAsync(async (req, res, next) => {
  try {
    // Aggregate Product counts
    const totalProducts = await Product.countDocuments({});

    // Aggregate Order counts
    const totalOrders = await Order.countDocuments({});

    // Aggregate Customer counts (User model where role is 'customer')
    const totalCustomers = await User.countDocuments({ role: 'customer' });

    // Aggregate pending orders (placed, confirmed, processing)
    const pendingOrders = await Order.countDocuments({
      orderStatus: { $in: ['placed', 'confirmed', 'processing'] }
    });

    // Aggregate low stock products (stock <= 10)
    const lowStockProducts = await Product.countDocuments({
      stock: { $lte: 10 }
    });

    // Calculate total revenue from non-cancelled orders
    const revenueAggregation = await Order.aggregate([
      {
        $match: {
          orderStatus: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;

    res.status(200).json({
      status: 'success',
      data: {
        totalProducts,
        totalOrders,
        totalCustomers,
        totalRevenue,
        pendingOrders,
        lowStockProducts
      }
    });
  } catch (err) {
    return next(new AppError('Failed to retrieve dashboard stats from database.', 500));
  }
});

module.exports = {
  getDashboardStats
};
