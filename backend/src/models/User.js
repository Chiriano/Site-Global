const pool = require('../../config/db');

const User = {
  async findByEmail(email) {
    const [rows] = await pool.query(
      `SELECT id, name, email, password, role, created_at
       FROM users
       WHERE email = ?
       LIMIT 1`,
      [email]
    );
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await pool.query(
      `SELECT id, name, email, role, created_at
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  async createUser({ name, email, password, role = 'user' }) {
    const [result] = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES (?, ?, ?, ?)`,
      [name, email, password, role]
    );

    return this.findById(result.insertId);
  },
};

module.exports = User;
