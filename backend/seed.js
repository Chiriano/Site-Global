require('dotenv').config();
const mysql = require('mysql2/promise');

async function seed() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    });

    console.log('Conectado ao MySQL.');

    // DDL precisa de query(), não execute()
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
    console.log(`Banco "${process.env.DB_NAME}" verificado.`);

    await conn.query(`USE \`${process.env.DB_NAME}\``);

    await conn.query(`
        CREATE TABLE IF NOT EXISTS products (
            id          INT AUTO_INCREMENT PRIMARY KEY,
            name        VARCHAR(255) NOT NULL,
            description TEXT,
            price       DECIMAL(10,2) NOT NULL,
            image_url   TEXT,
            category    VARCHAR(100),
            created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    console.log('Tabela "products" verificada.');

    const [rows] = await conn.query('SELECT COUNT(*) AS total FROM products');
    if (rows[0].total > 0) {
        console.log(`Tabela já possui ${rows[0].total} produto(s). Seed ignorado.`);
        await conn.end();
        return;
    }

    const products = [
        ['Cartões de Visita', 'Cartão couchê 300g, frente e verso colorido, acabamento fosco ou brilhante.',  9.99,  'https://placehold.co/150x150/ffffff/333333?text=Card',      'Mais Vendidos'],
        ['Flyers',            'Flyer couchê 150g, impressão frente e verso, formato A5.',                    12.99, 'https://placehold.co/150x150/ffffff/333333?text=Flyer',     'Mais Vendidos'],
        ['Adesivos',          'Vinil recortado ou impresso, resistente à água e ao sol.',                     7.99, 'https://placehold.co/150x150/ffffff/333333?text=Adesivo',   'Mais Vendidos'],
        ['Embalagens',        'Caixa kraft ou branca personalizada com logotipo.',                           19.99, 'https://placehold.co/150x150/ffffff/333333?text=Embalagem', 'Embalagens'],
        ['Brindes',           'Canetas, canecas e chaveiros com a sua marca.',                               14.99, 'https://placehold.co/150x150/ffffff/333333?text=Brinde',    'Brindes'],
        ['Roupas',            'Camisetas e uniformes com bordado ou silk screen.',                           34.99, 'https://placehold.co/150x150/ffffff/333333?text=Roupa',     'Roupas'],
        ['Carimbos',          'Carimbo automático personalizado com entrega rápida.',                        29.99, 'https://placehold.co/150x150/ffffff/333333?text=Carimbo',   'Mais Vendidos'],
        ['Banners e Lonas',   'Lona 440g com ilhoses, impressão digital de alta resolução.',                 49.99, 'https://placehold.co/150x150/ffffff/333333?text=Banner',    'Materiais Promocionais'],
    ];

    for (const [name, description, price, image_url, category] of products) {
        await conn.execute(
            'INSERT INTO products (name, description, price, image_url, category) VALUES (?, ?, ?, ?, ?)',
            [name, description, price, image_url, category]
        );
    }

    console.log(`${products.length} produtos inseridos com sucesso.`);
    await conn.end();
    console.log('Seed concluído.');
}

seed().catch(err => {
    console.error('Erro no seed:', err.message);
    process.exit(1);
});
