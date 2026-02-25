const pool = require('../../config/db');

async function bootstrapModulesSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS w2p_orders (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      order_code VARCHAR(64) NOT NULL UNIQUE,
      customer_id BIGINT NULL,
      customer_name VARCHAR(150) NULL,
      customer_email VARCHAR(190) NULL,
      status VARCHAR(40) NOT NULL DEFAULT 'pending',
      total DECIMAL(10,2) NOT NULL DEFAULT 0,
      currency VARCHAR(8) NOT NULL DEFAULT 'BRL',
      payload JSON NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS w2p_order_events (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      order_id BIGINT NOT NULL,
      status VARCHAR(40) NOT NULL,
      note TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_w2p_order_events_order
        FOREIGN KEY (order_id) REFERENCES w2p_orders(id)
        ON DELETE CASCADE
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS w2p_order_assets (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      order_id BIGINT NOT NULL,
      asset_type VARCHAR(40) NOT NULL,
      asset_url TEXT NOT NULL,
      meta JSON NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_w2p_order_assets_order
        FOREIGN KEY (order_id) REFERENCES w2p_orders(id)
        ON DELETE CASCADE
    )
  `);
}

module.exports = {
  bootstrapModulesSchema,
};
