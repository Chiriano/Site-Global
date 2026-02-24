const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const productRoutes = require('./routes/products');
const adminProductRoutes = require('./routes/adminProducts');
const orderRoutes = require('./routes/orders');
const authRoutes = require('./src/routes/authRoutes');
const { authenticateToken, requireAdmin } = require('./src/middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/products', productRoutes);
app.use('/api/admin/products', authenticateToken, requireAdmin, adminProductRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Alpha Convites API rodando' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Rota nao encontrada' });
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Arquivo muito grande. Limite de 5MB.' });
    }
    return res.status(400).json({ error: `Erro no upload: ${err.message}` });
  }

  if (err && err.message && err.message.includes('Tipo de arquivo invalido')) {
    return res.status(400).json({ error: err.message });
  }

  console.error('Erro nao tratado:', err);
  return res.status(500).json({ error: 'Erro interno do servidor' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`Site disponivel em http://localhost:${PORT}/index.html`);
});
