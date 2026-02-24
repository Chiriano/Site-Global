const Product = require('../models/Product');

function normalizeProductImageUrl(imageUrl, forceRelative = false) {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return null;
  }

  const cleanValue = imageUrl.trim();
  if (cleanValue === '') {
    return null;
  }

  const productsPrefix = '/uploads/products/';

  if (cleanValue.startsWith('http://') || cleanValue.startsWith('https://')) {
    if (!forceRelative) {
      return cleanValue;
    }

    try {
      const parsedUrl = new URL(cleanValue);
      const fileName = parsedUrl.pathname.split('/').pop();
      return fileName ? `${productsPrefix}${fileName}` : null;
    } catch (error) {
      return null;
    }
  }

  if (cleanValue.startsWith(productsPrefix)) {
    return cleanValue;
  }

  if (cleanValue.startsWith('/uploads/')) {
    const fileName = cleanValue.split('/').pop();
    return fileName ? `${productsPrefix}${fileName}` : null;
  }

  if (cleanValue.startsWith('uploads/products/')) {
    return `/${cleanValue}`;
  }

  if (cleanValue.includes('/')) {
    if (!forceRelative) {
      return cleanValue;
    }

    const fileName = cleanValue.split('/').pop();
    return fileName ? `${productsPrefix}${fileName}` : null;
  }

  return `${productsPrefix}${cleanValue}`;
}

const productController = {
  async listProducts(req, res) {
    try {
      const products = await Product.getAllProducts();
      const normalizedProducts = products.map((product) => ({
        ...product,
        image_url: normalizeProductImageUrl(product.image_url, false),
      }));
      return res.status(200).json(normalizedProducts);
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

      return res.status(200).json({
        ...product,
        image_url: normalizeProductImageUrl(product.image_url, false),
      });
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
        image_url: normalizeProductImageUrl(image_url, true),
        category: category || null,
      });

      return res.status(201).json({
        ...product,
        image_url: normalizeProductImageUrl(product.image_url, false),
      });
    } catch (err) {
      console.error('Erro ao criar produto:', err);
      return res.status(500).json({ error: 'Erro interno ao criar produto' });
    }
  },

  async listProductsByCategory(req, res) {
    try {
      const { category } = req.params;
      const normalizedCategory = String(category || '').trim().replace(/-/g, ' ');

      if (!normalizedCategory) {
        return res.status(400).json({ error: 'Categoria obrigatoria' });
      }

      const products = await Product.getProductsByCategory(normalizedCategory);
      const normalizedProducts = products.map((product) => ({
        ...product,
        image_url: normalizeProductImageUrl(product.image_url, false),
      }));

      return res.status(200).json(normalizedProducts);
    } catch (err) {
      console.error('Erro ao listar produtos por categoria:', err);
      return res.status(500).json({ error: 'Erro interno ao buscar produtos por categoria' });
    }
  },
};

module.exports = productController;
