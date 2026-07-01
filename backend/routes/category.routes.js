const express = require('express');
const categoryController = require('../controllers/category.controller');

const router = express.Router();

// GET all categories
router.get('/', categoryController.getCategories);

module.exports = router;
