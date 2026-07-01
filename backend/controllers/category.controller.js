const Category = require('../models/Category');

// Helper to catch async errors and pass them to the express error handler
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

/**
 * @desc    Get all categories
 * @route   GET /api/v1/categories
 * @access  Public
 */
const getCategories = catchAsync(async (req, res, next) => {
  const categories = await Category.find({});

  res.status(200).json({
    status: 'success',
    results: categories.length,
    data: {
      categories
    }
  });
});

module.exports = {
  getCategories
};
