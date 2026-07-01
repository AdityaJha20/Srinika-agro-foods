const mongoose = require('mongoose');
const Order = require('../models/Order');
const AppError = require('../utils/AppError');

// Helper to catch async errors and pass them to the express error handler
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

/**
 * @desc    Place a new order
 * @route   POST /api/v1/orders
 * @access  Private (authenticated customers)
 */
const createOrder = catchAsync(async (req, res, next) => {
  const { items, shippingAddress, phone, paymentMethod, totalAmount, notes } = req.body;

  // Basic input validation
  if (!items || !Array.isArray(items) || items.length === 0) {
    return next(new AppError('Order must contain at least one item', 400));
  }

  if (!shippingAddress) {
    return next(new AppError('Shipping address is required', 400));
  }

  if (!phone) {
    return next(new AppError('Phone number is required', 400));
  }

  if (!paymentMethod) {
    return next(new AppError('Payment method is required', 400));
  }

  if (totalAmount === undefined || totalAmount === null) {
    return next(new AppError('Total amount is required', 400));
  }

  const newOrder = await Order.create({
    user: req.user.id,
    items,
    shippingAddress,
    phone,
    paymentMethod,
    totalAmount,
    notes: notes || ''
  });

  // Populate user details for the response
  await newOrder.populate('user', 'name email');

  res.status(201).json({
    status: 'success',
    message: 'Order placed successfully',
    data: {
      order: newOrder
    }
  });
});

/**
 * @desc    Get all orders belonging to the currently logged-in user
 * @route   GET /api/v1/orders/my-orders
 * @access  Private (authenticated customers)
 */
const getMyOrders = catchAsync(async (req, res, next) => {
  // Pagination support
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = { user: req.user.id };

  // Optional status filter
  if (req.query.status) {
    filter.orderStatus = req.query.status;
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('items.product', 'name sku images')
      .select('-__v'),
    Order.countDocuments(filter)
  ]);

  res.status(200).json({
    status: 'success',
    results: orders.length,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data: {
      orders
    }
  });
});

/**
 * @desc    Get a single order by its MongoDB _id
 * @route   GET /api/v1/orders/:id
 * @access  Private (owner of the order, or admin)
 */
const getOrderById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid order ID format', 400));
  }

  const order = await Order.findById(id)
    .populate('user', 'name email')
    .populate('items.product', 'name sku images price')
    .select('-__v');

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  // Ensure the requesting user owns this order OR is an admin
  const isOwner = order.user._id.toString() === req.user.id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    return next(new AppError('You do not have permission to view this order', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      order
    }
  });
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById
};
