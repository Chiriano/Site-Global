const express = require('express');
const pool = require('../../config/db');
const { createId } = require('../common/id');

const router = express.Router();

router.post('/orders', async (req, res) => {
  const {
    customer_id = null,
    customer_name = null,
    customer_email = null,
    items = [],
    total = 0,
    currency = 'BRL',
    editor_session_id = null,
    uploaded_file_id = null,
    production_pdf_id = null,
  } = req.body || {};

  if (!Array.isArray(items) || !items.length) {
    return res.status(400).json({ error: 'items obrigatorio com pelo menos um item.' });
  }

  const safeTotal = Number(total || 0);
  if (Number.isNaN(safeTotal) || safeTotal <= 0) {
    return res.status(400).json({ error: 'total invalido.' });
  }

  const orderCode = createId('ord');
  const payload = {
    items,
    editor_session_id,
    uploaded_file_id,
    production_pdf_id,
  };

  try {
    const [insertResult] = await pool.query(
      `INSERT INTO w2p_orders
      (order_code, customer_id, customer_name, customer_email, status, total, currency, payload)
      VALUES (?, ?, ?, ?, 'pending', ?, ?, ?)`,
      [
        orderCode,
        customer_id,
        customer_name,
        customer_email,
        safeTotal,
        currency,
        JSON.stringify(payload),
      ]
    );

    const orderId = insertResult.insertId;
    await pool.query(
      'INSERT INTO w2p_order_events (order_id, status, note) VALUES (?, ?, ?)',
      [orderId, 'pending', 'Pedido criado no fluxo Web-to-Print']
    );

    return res.status(201).json({
      order: {
        order_id: orderId,
        order_code: orderCode,
        status: 'pending',
        total: safeTotal,
        currency,
      },
    });
  } catch (error) {
    console.error('[order-system] Falha ao criar pedido:', error);
    return res.status(500).json({ error: 'Erro interno ao criar pedido Web-to-Print.' });
  }
});

router.get('/orders/:orderCode', async (req, res) => {
  try {
    const [orders] = await pool.query(
      'SELECT * FROM w2p_orders WHERE order_code = ? LIMIT 1',
      [req.params.orderCode]
    );

    if (!orders.length) {
      return res.status(404).json({ error: 'Pedido nao encontrado.' });
    }

    const order = orders[0];
    const [events] = await pool.query(
      'SELECT status, note, created_at FROM w2p_order_events WHERE order_id = ? ORDER BY id ASC',
      [order.id]
    );
    const [assets] = await pool.query(
      'SELECT asset_type, asset_url, meta, created_at FROM w2p_order_assets WHERE order_id = ? ORDER BY id ASC',
      [order.id]
    );

    return res.status(200).json({
      order: {
        ...order,
        payload: order.payload ? JSON.parse(order.payload) : null,
        events,
        assets: assets.map((asset) => ({
          ...asset,
          meta: asset.meta ? JSON.parse(asset.meta) : null,
        })),
      },
    });
  } catch (error) {
    console.error('[order-system] Falha ao consultar pedido:', error);
    return res.status(500).json({ error: 'Erro interno ao consultar pedido.' });
  }
});

router.get('/orders/customer/:customerId', async (req, res) => {
  try {
    const [orders] = await pool.query(
      'SELECT order_code, status, total, currency, created_at, updated_at FROM w2p_orders WHERE customer_id = ? ORDER BY id DESC',
      [req.params.customerId]
    );

    return res.status(200).json({ orders });
  } catch (error) {
    console.error('[order-system] Falha ao consultar historico:', error);
    return res.status(500).json({ error: 'Erro interno ao consultar historico do cliente.' });
  }
});

module.exports = router;
