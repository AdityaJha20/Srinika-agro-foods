const express = require('express');
const productController = require('../controllers/product.controller');

const router = express.Router();

// Public routes for browsing products
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

// Admin/protected routes for managing products
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
