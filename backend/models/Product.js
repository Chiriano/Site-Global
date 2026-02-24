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

  async getProductsByCategory(category) {
    const term = `%${category}%`;
    const [rows] = await pool.query(
      `SELECT id, name, description, price, image_url, category
       FROM products
       WHERE category LIKE ? OR name LIKE ?
       ORDER BY created_at DESC`,
      [term, term]
    );
    return rows;
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

  async updateProduct(id, data) {
    const { name, description, price, image_url, category } = data;
    await pool.query(
      `UPDATE products
       SET name = ?, description = ?, price = ?, image_url = ?, category = ?
       WHERE id = ?`,
      [name, description, price, image_url, category, id]
    );
    const [rows] = await pool.query(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  async deleteProduct(id) {
    const [result] = await pool.query(
      'DELETE FROM products WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  },
};

module.exports = Product;
