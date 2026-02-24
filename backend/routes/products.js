const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/', productController.listProducts);
router.get('/category/:category', productController.listProductsByCategory);
router.get('/:id', productController.getProduct);
router.post('/', productController.createProduct);

module.exports = router;
