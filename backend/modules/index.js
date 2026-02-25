const express = require('express');
const editorRoutes = require('./editor/routes');
const uploadRoutes = require('./upload/routes');
const pdfEngineRoutes = require('./pdf-engine/routes');
const orderSystemRoutes = require('./order-system/routes');

const router = express.Router();

router.use('/editor', editorRoutes);
router.use('/upload', uploadRoutes);
router.use('/pdf-engine', pdfEngineRoutes);
router.use('/order-system', orderSystemRoutes);

module.exports = router;
