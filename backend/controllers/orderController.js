const pool = require('../config/db');

const orderController = {
  async createOrder(req, res) {
    const { items, total } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Pedido invalido: carrinho vazio.' });
    }

    if (total === undefined || total === null || Number.isNaN(Number(total))) {
      return res.status(400).json({ error: 'Total invalido.' });
    }

    for (const item of items) {
      if (!Number.isInteger(Number(item.product_id)) || Number(item.product_id) <= 0) {
        return res.status(400).json({ error: 'Item invalido: product_id obrigatorio.' });
      }
      if (!Number.isInteger(Number(item.quantity)) || Number(item.quantity) <= 0) {
        return res.status(400).json({ error: 'Item invalido: quantity deve ser inteiro maior que 0.' });
      }
      if (item.price === undefined || item.price === null || Number.isNaN(Number(item.price))) {
        return res.status(400).json({ error: 'Item invalido: price obrigatorio.' });
      }
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [orderResult] = await connection.query(
        'INSERT INTO orders (total) VALUES (?)',
        [Number(total)]
      );

      const orderId = orderResult.insertId;
      const itemValues = items.map((item) => [
        orderId,
        Number(item.product_id),
        Number(item.quantity),
        Number(item.price),
      ]);

      await connection.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES ?`,
        [itemValues]
      );

      await connection.commit();
      return res.status(201).json({
        message: 'Pedido criado com sucesso.',
        order_id: orderId,
      });
    } catch (error) {
      await connection.rollback();
      console.error('Erro ao criar pedido:', error);
      return res.status(500).json({ error: 'Erro interno ao finalizar pedido.' });
    } finally {
      connection.release();
    }
  },
};

module.exports = orderController;
