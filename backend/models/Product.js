const pool = require('../config/db');

const Product = {
  async getAllProducts() {
    const [rows] = await pool.query(
      'SELECT * FROM products ORDER BY created_at DESC'
    );
    return rows;
  },

  async getProductById(id) {
    const [rows] = await pool.query(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  async createProduct(data) {
    const { name, description, price, image_url, category } = data;
    const [result] = await pool.query(
      `INSERT INTO products (name, description, price, image_url, category)
       VALUES (?, ?, ?, ?, ?)`,
      [name, description, price, image_url, category]
    );
    const [rows] = await pool.query(
      'SELECT * FROM products WHERE id = ?',
      [result.insertId]
    );
    return rows[0];
  },
};

module.exports = Product;
