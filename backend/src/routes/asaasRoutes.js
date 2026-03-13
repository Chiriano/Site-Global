const express = require('express');
const { createPayment, getPaymentStatus } = require('../controllers/asaasController');

const router = express.Router();

// POST /api/asaas/payment — cria cobrança (PIX ou Boleto)
router.post('/payment', createPayment);

// GET /api/asaas/payment/:id — consulta status
router.get('/payment/:id', getPaymentStatus);

module.exports = router;
