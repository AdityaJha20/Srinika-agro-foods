const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const AppError = require('../utils/AppError');

// Helper to catch async errors and pass them to the express error handler
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

/**
 * @desc    Create a new product
 * @route   POST /api/products
 * @access  Private/Admin
 */
const createProduct = catchAsync(async (req, res, next) => {
  const { sku } = req.body;

  // SKU uniqueness check before insertion to avoid raw DB errors
  if (sku) {
    const existingProduct = await Product.findOne({ sku });
    if (existingProduct) {
      return next(new AppError('Product with this SKU already exists', 400));
    }
  }

  const newProduct = await Product.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      product: newProduct
    }
  });
});

/**
 * @desc    Get all products with filtering, sorting, pagination, and search
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = catchAsync(async (req, res, next) => {
  // 1) Filtering
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
  excludedFields.forEach((el) => delete queryObj[el]);

  // Support advanced filtering operators (gte, gt, lte, lt)
  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt|ne)\b/g, (match) => `$${match}`);
  let filter = JSON.parse(queryStr);

  // If a text search is provided
  if (req.query.search) {
    filter.$text = { $search: req.query.search };
  }

  let query = Product.find(filter);

  // 2) Sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    // Default sort by creation time
    query = query.sort('-createdAt');
  }

  // 3) Field Limiting
  if (req.query.fields) {
    const fields = req.query.fields.split(',').join(' ');
    query = query.select(fields);
  } else {
    // Exclude __v by default
    query = query.select('-__v');
  }

  // 4) Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  query = query.skip(skip).limit(limit);

  // Populate category information
  //query = query.populate('category', 'name description');

  // Execute query and count documents for metadata
  const [products, total] = await Promise.all([
    query,
    Product.countDocuments(filter)
  ]);

  res.status(200).json({
    status: 'success',
    results: products.length,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data: {
      products
    }
  });
});

/**
 * @desc    Get a single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid product ID format', 400));
  }

  const product = await Product.findById(id);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      product
    }
  });
});

/**
 * @desc    Update an existing product
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
const updateProduct = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { sku } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid product ID format', 400));
  }

  // If SKU is being updated, verify it doesn't conflict with another product
  if (sku) {
    const existingProduct = await Product.findOne({ sku, _id: { $ne: id } });
    if (existingProduct) {
      return next(new AppError('Product with this SKU already exists', 400));
    }
  }

  const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true
  }).populate('category', 'name description');

  if (!updatedProduct) {
    return next(new AppError('Product not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      product: updatedProduct
    }
  });
});

/**
 * @desc    Delete a product by ID
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
const deleteProduct = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid product ID format', 400));
  }

  const deletedProduct = await Product.findByIdAndDelete(id);

  if (!deletedProduct) {
    return next(new AppError('Product not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Product deleted successfully',
    data: null
  });
});

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
};
