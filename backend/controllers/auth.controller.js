const { User, UserProfile, Role, Company, Branch, UserSession } = require('../models');
const { comparePassword } = require('../utils/password');
const { generateAccessToken, generateRefreshToken, verifyToken } = require('../utils/jwt');
const { generateResetToken, verifyResetToken } = require('../utils/passwordReset');
const { sendMail } = require('../utils/mail');
const crypto = require('crypto');

const loginAttempts = new Map();
const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const [key, data] of loginAttempts) {
    if (now - data.firstAttempt > LOGIN_WINDOW_MS) {
      loginAttempts.delete(key);
    }
  }
}, 60 * 1000);

const getClientIp = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
};

const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const incrementLoginAttempts = (key) => {
  const now = Date.now();
  const existing = loginAttempts.get(key);
  if (existing) {
    existing.count++;
  } else {
    loginAttempts.set(key, { count: 1, firstAttempt: now });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const ip = getClientIp(req);
    const attemptKey = `${email}:${ip}`;

    const now = Date.now();
    const attempts = loginAttempts.get(attemptKey);
    if (attempts) {
      if (now - attempts.firstAttempt > LOGIN_WINDOW_MS) {
        loginAttempts.delete(attemptKey);
      } else if (attempts.count >= LOGIN_MAX_ATTEMPTS) {
        const retryAfter = Math.ceil((LOGIN_WINDOW_MS - (now - attempts.firstAttempt)) / 1000);
        return res.status(429).json({
          error: `Demasiados intentos. Intenta en ${retryAfter} segundos`
        });
      }
    }

    const user = await User.findOne({
      where: { email },
      include: [
        { model: Role, as: 'role' },
        { model: Company, as: 'company' },
        { model: UserProfile, as: 'profile' }
      ]
    });

    if (!user) {
      incrementLoginAttempts(attemptKey);
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      incrementLoginAttempts(attemptKey);
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    if (!user.is_active) {
      incrementLoginAttempts(attemptKey);
      return res.status(401).json({ error: 'Usuario inactivo' });
    }

    loginAttempts.delete(attemptKey);

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await user.update({ last_login: new Date() });

    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await UserSession.create({
      user_id: user.id,
      token_hash: tokenHash,
      expires_at: expiresAt,
      ip_address: ip,
      user_agent: req.headers['user-agent']
    });

    res.json({
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        profile: user.profile ? {
          first_name: user.profile.first_name,
          last_name: user.profile.last_name,
          phone: user.profile.phone,
          avatar: user.profile.avatar
        } : null,
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
    const { refresh_token } = req.body;
    if (!refresh_token) {
      return res.status(400).json({ error: 'Refresh token requerido' });
    }

    const tokenHash = hashToken(refresh_token);
    const session = await UserSession.findOne({ where: { token_hash: tokenHash } });

    if (session) {
      if (session.user_id !== req.userId) {
        return res.status(403).json({ error: 'El token no pertenece a este usuario' });
      }
      await session.destroy();
    }

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

    const tokenHash = hashToken(refresh_token);
    const session = await UserSession.findOne({ where: { token_hash: tokenHash } });

    if (!session) {
      return res.status(401).json({ error: 'Sesión no válida o cerrada' });
    }

    if (new Date() > session.expires_at) {
      await session.destroy();
      return res.status(401).json({ error: 'Sesión expirada' });
    }

    const user = await User.findByPk(decoded.id, {
      include: [{ model: Role, as: 'role' }]
    });

    if (!user || !user.is_active) {
      await session.destroy();
      return res.status(401).json({ error: 'Usuario no encontrado o inactivo' });
    }

    await session.destroy();

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    const newTokenHash = hashToken(newRefreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await UserSession.create({
      user_id: user.id,
      token_hash: newTokenHash,
      expires_at: expiresAt,
      ip_address: getClientIp(req),
      user_agent: req.headers['user-agent']
    });

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
        { model: Branch, as: 'branch' },
        { model: UserProfile, as: 'profile' }
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

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.json({ message: 'Si el email existe, recibirás un enlace para restablecer tu contraseña' });
    }

    const resetToken = generateResetToken(user);
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;

    await sendMail({
      to: email,
      subject: 'Restablece tu contraseña - ERP Modular',
      html: `
        <div style="font-family:Arial;max-width:600px;margin:auto">
          <div style="background:#2563eb;color:white;padding:24px;text-align:center;border-radius:8px 8px 0 0">
            <h1 style="margin:0">ERP Modular</h1>
          </div>
          <div style="padding:32px;background:#f8fafc;border:1px solid #e2e8f0">
            <h2>Restablece tu contraseña</h2>
            <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
            <p>Este enlace es válido por <strong>15 minutos</strong>.</p>
            <p style="text-align:center;margin-top:24px">
              <a href="${resetUrl}"
                 style="background:#2563eb;color:white;padding:12px 32px;border-radius:6px;text-decoration:none;display:inline-block">
                Restablecer Contraseña
              </a>
            </p>
            <p style="color:#94a3b8;font-size:13px;margin-top:24px">
              Si no solicitaste este cambio, puedes ignorar este correo.
            </p>
          </div>
          <div style="text-align:center;padding:16px;color:#94a3b8;font-size:12px">
            ERP Modular - Sistema de Gestión Empresarial
          </div>
        </div>
      `
    });

    res.json({ message: 'Si el email existe, recibirás un enlace para restablecer tu contraseña' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, new_password } = req.body;

    const decoded = verifyResetToken(token);
    if (!decoded) {
      return res.status(400).json({ error: 'Enlace inválido o expirado. Solicita un nuevo restablecimiento.' });
    }

    const user = await User.findByPk(decoded.id);
    if (!user || !user.is_active) {
      return res.status(400).json({ error: 'Usuario no encontrado o inactivo' });
    }

    const { hashPassword } = require('../utils/password');
    const passwordHash = await hashPassword(new_password);
    await user.update({ password_hash: passwordHash });

    await UserSession.destroy({ where: { user_id: user.id } });

    res.json({ message: 'Contraseña actualizada correctamente. Puedes iniciar sesión con tu nueva contraseña.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Error al restablecer la contraseña' });
  }
};

module.exports = {
  login,
  logout,
  refresh,
  me,
  forgotPassword,
  resetPassword
};
