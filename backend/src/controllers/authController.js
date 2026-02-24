const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function sanitizeUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    created_at: user.created_at,
  };
}

const authController = {
  async register(req, res) {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ error: 'name, email e password sao obrigatorios.' });
      }

      if (String(password).length < 6) {
        return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres.' });
      }

      const normalizedEmail = String(email).trim().toLowerCase();
      const normalizedName = String(name).trim();

      const existingUser = await User.findByEmail(normalizedEmail);
      if (existingUser) {
        return res.status(409).json({ error: 'Email ja cadastrado.' });
      }

      const hashedPassword = await bcrypt.hash(String(password), 10);

      const createdUser = await User.createUser({
        name: normalizedName,
        email: normalizedEmail,
        password: hashedPassword,
      });

      return res.status(201).json({
        message: 'Usuario cadastrado com sucesso.',
        user: sanitizeUser(createdUser),
      });
    } catch (error) {
      console.error('Erro no register:', error);
      return res.status(500).json({ error: 'Erro interno ao cadastrar usuario.' });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'email e password sao obrigatorios.' });
      }

      if (!process.env.JWT_SECRET) {
        return res.status(500).json({ error: 'JWT_SECRET nao configurado no servidor.' });
      }

      const normalizedEmail = String(email).trim().toLowerCase();
      const user = await User.findByEmail(normalizedEmail);

      if (!user) {
        return res.status(401).json({ error: 'Credenciais invalidas.' });
      }

      const passwordMatch = await bcrypt.compare(String(password), user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Credenciais invalidas.' });
      }

      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(200).json({
        token,
        user: sanitizeUser(user),
      });
    } catch (error) {
      console.error('Erro no login:', error);
      return res.status(500).json({ error: 'Erro interno ao autenticar usuario.' });
    }
  },

  async me(req, res) {
    try {
      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({ error: 'Usuario nao encontrado.' });
      }

      return res.status(200).json({
        user: sanitizeUser(user),
      });
    } catch (error) {
      console.error('Erro na rota /me:', error);
      return res.status(500).json({ error: 'Erro interno ao buscar usuario autenticado.' });
    }
  },
};

module.exports = authController;
