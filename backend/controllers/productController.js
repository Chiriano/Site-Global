const Product = require('../models/Product');

const productController = {
  async listProducts(req, res) {
    try {
      const products = await Product.getAllProducts();
      return res.status(200).json(products);
    } catch (err) {
      console.error('Erro ao listar produtos:', err);
      return res.status(500).json({ error: 'Erro interno ao buscar produtos' });
    }
  },

  async getProduct(req, res) {
    try {
      const { id } = req.params;

      if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const product = await Product.getProductById(id);

      if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      return res.status(200).json(product);
    } catch (err) {
      console.error('Erro ao buscar produto:', err);
      return res.status(500).json({ error: 'Erro interno ao buscar produto' });
    }
  },

  async createProduct(req, res) {
    try {
      const { name, description, price, image_url, category } = req.body;

      if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'O campo "name" é obrigatório' });
      }

      if (price === undefined || price === null || isNaN(Number(price))) {
        return res.status(400).json({ error: 'O campo "price" é obrigatório e deve ser numérico' });
      }

      const product = await Product.createProduct({
        name: name.trim(),
        description: description || null,
        price: Number(price),
        image_url: image_url || null,
        category: category || null,
      });

      return res.status(201).json(product);
    } catch (err) {
      console.error('Erro ao criar produto:', err);
      return res.status(500).json({ error: 'Erro interno ao criar produto' });
    }
  },
};

module.exports = productController;
