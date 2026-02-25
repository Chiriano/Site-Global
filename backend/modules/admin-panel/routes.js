const express = require('express');
const pool = require('../../config/db');
const editorService = require('../editor/service');

const router = express.Router();

router.get('/dashboard', async (req, res) => {
  try {
    const [[ordersCount]] = await pool.query('SELECT COUNT(*) AS total_orders FROM w2p_orders');
    const [[pendingCount]] = await pool.query("SELECT COUNT(*) AS pending_orders FROM w2p_orders WHERE status IN ('pending','in_production')");
    const [[revenue]] = await pool.query("SELECT COALESCE(SUM(total), 0) AS total_revenue FROM w2p_orders WHERE status <> 'cancelled'");

    return res.status(200).json({
      dashboard: {
        total_orders: Number(ordersCount.total_orders || 0),
        pending_orders: Number(pendingCount.pending_orders || 0),
        total_revenue: Number(revenue.total_revenue || 0),
      },
    });
  } catch (error) {
    console.error('[admin-panel] Erro dashboard:', error);
    return res.status(500).json({ error: 'Erro interno ao carregar dashboard.' });
  }
});

router.get('/print-queue', async (req, res) => {
  try {
    const [queue] = await pool.query(
      `SELECT order_code, customer_name, status, total, created_at
       FROM w2p_orders
       WHERE status IN ('pending', 'approved', 'in_production')
       ORDER BY created_at ASC`
    );
    return res.status(200).json({ queue });
  } catch (error) {
    console.error('[admin-panel] Erro fila:', error);
    return res.status(500).json({ error: 'Erro interno ao carregar fila de impressao.' });
  }
});

router.get('/finance', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT DATE(created_at) AS day, SUM(total) AS total
       FROM w2p_orders
       WHERE status <> 'cancelled'
       GROUP BY DATE(created_at)
       ORDER BY day DESC
       LIMIT 30`
    );
    return res.status(200).json({ finance: rows });
  } catch (error) {
    console.error('[admin-panel] Erro financeiro:', error);
    return res.status(500).json({ error: 'Erro interno ao carregar financeiro.' });
  }
});

router.get('/templates', (req, res) => {
  return res.status(200).json({ templates: editorService.listTemplates() });
});

router.patch('/orders/:orderCode/status', async (req, res) => {
  const { status, note } = req.body || {};
  if (!status) {
    return res.status(400).json({ error: 'status obrigatorio.' });
  }

  try {
    const [orders] = await pool.query(
      'SELECT id, order_code FROM w2p_orders WHERE order_code = ? LIMIT 1',
      [req.params.orderCode]
    );
    if (!orders.length) {
      return res.status(404).json({ error: 'Pedido nao encontrado.' });
    }

    const order = orders[0];
    await pool.query('UPDATE w2p_orders SET status = ? WHERE id = ?', [status, order.id]);
    await pool.query(
      'INSERT INTO w2p_order_events (order_id, status, note) VALUES (?, ?, ?)',
      [order.id, status, note || 'Status atualizado pelo admin']
    );

    return res.status(200).json({ message: 'Status atualizado.', order_code: order.order_code, status });
  } catch (error) {
    console.error('[admin-panel] Erro ao atualizar status:', error);
    return res.status(500).json({ error: 'Erro interno ao atualizar status.' });
  }
});

router.post('/orders/:orderCode/assets', async (req, res) => {
  const { asset_type, asset_url, meta } = req.body || {};
  if (!asset_type || !asset_url) {
    return res.status(400).json({ error: 'asset_type e asset_url sao obrigatorios.' });
  }

  try {
    const [orders] = await pool.query(
      'SELECT id FROM w2p_orders WHERE order_code = ? LIMIT 1',
      [req.params.orderCode]
    );
    if (!orders.length) {
      return res.status(404).json({ error: 'Pedido nao encontrado.' });
    }

    await pool.query(
      'INSERT INTO w2p_order_assets (order_id, asset_type, asset_url, meta) VALUES (?, ?, ?, ?)',
      [orders[0].id, asset_type, asset_url, JSON.stringify(meta || {})]
    );

    return res.status(201).json({ message: 'Asset anexado ao pedido.' });
  } catch (error) {
    console.error('[admin-panel] Erro ao anexar asset:', error);
    return res.status(500).json({ error: 'Erro interno ao anexar asset.' });
  }
});

module.exports = router;
