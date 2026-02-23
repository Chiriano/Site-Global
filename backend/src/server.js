require('dotenv').config();
const express = require('express');
const cors = require('cors');

const productRoutes = require('../routes/products');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/products', productRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Alpha Convites API rodando' });
});

app.use((req, res) => {
    res.status(404).json({ error: 'Rota não encontrada' });
});

app.use((err, req, res, next) => {
    console.error('Erro não tratado:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
});

app.listen(PORT, () => {
    console.log(`[Backend] Servidor rodando em http://localhost:${PORT}`);
    console.log(`[Backend] API:        http://localhost:${PORT}/api/products`);
    console.log(`[Backend] Health:     http://localhost:${PORT}/health`);
});
