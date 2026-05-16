const { User, Role, Company, Branch, UserSession } = require('../models');
const { comparePassword } = require('../utils/password');
const { generateAccessToken, generateRefreshToken, verifyToken } = require('../utils/jwt');
const crypto = require('crypto');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email },
      include: [
        { model: Role, as: 'role' },
        { model: Company, as: 'company' }
      ]
    });

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    if (!user.is_active) {
      return res.status(401).json({ error: 'Usuario inactivo' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await user.update({ last_login: new Date() });

    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await UserSession.create({
      user_id: user.id,
      token_hash: tokenHash,
      expires_at: expiresAt,
      ip_address: req.ip,
      user_agent: req.headers['user-agent']
    });

    res.json({
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role ? {
          id: user.role.id,
          name: user.role.name,
          permissions: user.role.permissions
        } : null,
        company: user.company ? {
          id: user.company.id,
          name: user.company.name
        } : null
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

const logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(' ')[1];
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    await UserSession.destroy({ where: { token_hash: tokenHash } });

    res.json({ message: 'Sesión cerrada correctamente' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

const refresh = async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({ error: 'Refresh token requerido' });
    }

    const decoded = verifyToken(refresh_token);
    if (!decoded || decoded.type !== 'refresh') {
      return res.status(401).json({ error: 'Refresh token inválido' });
    }

    const user = await User.findByPk(decoded.id, {
      include: [{ model: Role, as: 'role' }]
    });

    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'Usuario no encontrado o inactivo' });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    const tokenHash = crypto.createHash('sha256').update(refresh_token).digest('hex');
    const session = await UserSession.findOne({ where: { token_hash: tokenHash } });

    if (session) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      await session.update({ expires_at: expiresAt });
    }

    res.json({
      access_token: newAccessToken,
      refresh_token: newRefreshToken
    });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

const me = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ['password_hash'] },
      include: [
        { model: Role, as: 'role' },
        { model: Company, as: 'company' },
        { model: Branch, as: 'branch' }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Me error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

module.exports = {
  login,
  logout,
  refresh,
  me
};