require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const productRoutes = require('./routes/products');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve os arquivos estáticos do frontend (pasta raiz do projeto)
app.use(express.static(path.join(__dirname, '..')));

// Rotas da API
app.use('/api/products', productRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Alpha Convites API rodando' });
});

// 404
app.use((req, res) => {
    res.status(404).json({ error: 'Rota não encontrada' });
});

// Erro genérico
app.use((err, req, res, next) => {
    console.error('Erro não tratado:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log(`Site disponível em  http://localhost:${PORT}/index.html`);
});
