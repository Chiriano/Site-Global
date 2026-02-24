const Product = require('../models/Product');

function toRelativeImageUrl(fileName) {
  if (!fileName) {
    return null;
  }
  return `/uploads/products/${fileName}`;
}

const adminProductController = {
  async listProductsAdmin(req, res) {
    try {
      const products = await Product.getAllProducts();
      return res.status(200).json(products);
    } catch (error) {
      console.error('Erro ao listar produtos (admin):', error);
      return res.status(500).json({ error: 'Erro interno ao listar produtos' });
    }
  },

  async createProductAdmin(req, res) {
    try {
      const { name, description, price, category } = req.body;

      if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Nome do produto e obrigatorio' });
      }

      if (price === undefined || price === null || Number.isNaN(Number(price))) {
        return res.status(400).json({ error: 'Preco invalido' });
      }

      const imageUrl = req.file ? toRelativeImageUrl(req.file.filename) : null;

      const createdProduct = await Product.createProduct({
        name: name.trim(),
        description: description ? description.trim() : null,
        price: Number(price),
        image_url: imageUrl,
        category: category ? category.trim() : null,
      });

      return res.status(201).json(createdProduct);
    } catch (error) {
      console.error('Erro ao criar produto (admin):', error);
      return res.status(500).json({ error: 'Erro interno ao criar produto' });
    }
  },

  async updateProductAdmin(req, res) {
    try {
      const { id } = req.params;
      const numericId = Number(id);

      if (!Number.isInteger(numericId) || numericId <= 0) {
        return res.status(400).json({ error: 'ID invalido' });
      }

      const existingProduct = await Product.getProductById(numericId);
      if (!existingProduct) {
        return res.status(404).json({ error: 'Produto nao encontrado' });
      }

      const { name, description, price, category } = req.body;
      const nextName = name !== undefined ? name.trim() : existingProduct.name;
      const nextDescription = description !== undefined ? description.trim() : existingProduct.description;
      const nextCategory = category !== undefined ? category.trim() : existingProduct.category;
      const nextPrice = price !== undefined ? Number(price) : Number(existingProduct.price);

      if (!nextName) {
        return res.status(400).json({ error: 'Nome do produto e obrigatorio' });
      }

      if (Number.isNaN(nextPrice)) {
        return res.status(400).json({ error: 'Preco invalido' });
      }

      const nextImageUrl = req.file
        ? toRelativeImageUrl(req.file.filename)
        : existingProduct.image_url;

      const updatedProduct = await Product.updateProduct(numericId, {
        name: nextName,
        description: nextDescription,
        price: nextPrice,
        image_url: nextImageUrl,
        category: nextCategory,
      });

      return res.status(200).json(updatedProduct);
    } catch (error) {
      console.error('Erro ao atualizar produto (admin):', error);
      return res.status(500).json({ error: 'Erro interno ao atualizar produto' });
    }
  },

  async deleteProductAdmin(req, res) {
    try {
      const { id } = req.params;
      const numericId = Number(id);

      if (!Number.isInteger(numericId) || numericId <= 0) {
        return res.status(400).json({ error: 'ID invalido' });
      }

      const existingProduct = await Product.getProductById(numericId);
      if (!existingProduct) {
        return res.status(404).json({ error: 'Produto nao encontrado' });
      }

      const deleted = await Product.deleteProduct(numericId);
      if (!deleted) {
        return res.status(500).json({ error: 'Falha ao deletar produto' });
      }

      return res.status(200).json({ message: 'Produto deletado com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar produto (admin):', error);
      return res.status(500).json({ error: 'Erro interno ao deletar produto' });
    }
  },
};

module.exports = adminProductController;
