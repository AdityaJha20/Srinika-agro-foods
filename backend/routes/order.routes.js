const express = require('express');
const orderController = require('../controllers/order.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

// All order routes require authentication
router.use(protect);

// POST /api/v1/orders          – Place a new order
router.post('/', orderController.createOrder);

// GET /api/v1/orders/my-orders – Get current user's order history
// NOTE: This route MUST be registered before /:id to prevent "my-orders"
//       from being matched as a MongoDB ObjectId param.
router.get('/my-orders', orderController.getMyOrders);

// GET /api/v1/orders/:id       – Get a specific order by ID
router.get('/:id', orderController.getOrderById);

module.exports = router;
