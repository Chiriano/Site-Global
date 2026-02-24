const express = require('express');
const adminProductController = require('../controllers/adminProductController');
const productUpload = require('../middlewares/productUpload');

const router = express.Router();
const adminAuthPlaceholder = (req, res, next) => next();

router.get('/', adminAuthPlaceholder, adminProductController.listProductsAdmin);
router.post('/', adminAuthPlaceholder, productUpload.single('image'), adminProductController.createProductAdmin);
router.put('/:id', adminAuthPlaceholder, productUpload.single('image'), adminProductController.updateProductAdmin);
router.delete('/:id', adminAuthPlaceholder, adminProductController.deleteProductAdmin);

module.exports = router;
