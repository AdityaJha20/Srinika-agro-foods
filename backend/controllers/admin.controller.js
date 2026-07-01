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

/**
 * @desc    Get all orders with search, filter and pagination
 * @route   GET /api/v1/admin/orders
 * @access  Private/Admin
 */
const getAdminOrders = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = {};

  // Status Filter
  if (req.query.status) {
    filter.orderStatus = req.query.status;
  } else if (req.query.orderStatus) {
    filter.orderStatus = req.query.orderStatus;
  }

  // Search Filter (matches orderId or customer name/email)
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    
    // Find users matching search name/email
    const matchingUsers = await User.find({
      $or: [
        { name: { $regex: searchRegex } },
        { email: { $regex: searchRegex } }
      ]
    }).select('_id');
    
    const userIds = matchingUsers.map(user => user._id);

    filter.$or = [
      { orderId: { $regex: searchRegex } },
      { user: { $in: userIds } }
    ];
  }

  try {
    const totalResults = await Order.countDocuments(filter);
    const totalPages = Math.ceil(totalResults / limit);

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email')
      .populate('items.product', 'name sku images price');

    res.status(200).json({
      status: 'success',
      results: orders.length,
      totalResults,
      currentPage: page,
      totalPages,
      data: {
        orders
      }
    });
  } catch (err) {
    return next(new AppError('Failed to retrieve orders from database.', 500));
  }
});

/**
 * @desc    Update order and/or payment status with stock reconciliation on cancellation
 * @route   PATCH /api/v1/admin/orders/:id/status
 * @access  Private/Admin
 */
const updateAdminOrderStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { orderStatus, paymentStatus } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid order ID format', 400));
  }

  const order = await Order.findById(id);
  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  const previousStatus = order.orderStatus;

  // Update payment status if provided
  if (paymentStatus) {
    order.paymentStatus = paymentStatus;
  }

  // Update order status if provided
  if (orderStatus) {
    order.orderStatus = orderStatus;
  }

  await order.save();

  // Stock reconciliation: if transition is TO cancelled, and the previous status WAS NOT already cancelled
  if (orderStatus === 'cancelled' && previousStatus !== 'cancelled') {
    // Increment product stock levels for all items in the order
    for (const item of order.items) {
      if (item.product) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity }
        });
      }
    }
  }

  res.status(200).json({
    status: 'success',
    message: 'Order status updated successfully',
    data: {
      order
    }
  });
});

module.exports = {
  getDashboardStats,
  getAdminOrders,
  updateAdminOrderStatus
};
