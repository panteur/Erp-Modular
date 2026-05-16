const jwt = require('jsonwebtoken');
const config = require('../config');

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      company_id: user.company_id,
      role_id: user.role_id,
      type: 'access'
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

const generateRefreshToken = (user) => {
  const crypto = require('crypto');
  return jwt.sign(
    {
      id: user.id,
      type: 'refresh',
      jti: crypto.randomUUID()
    },
    config.jwt.secret,
    { expiresIn: config.jwt.refreshExpiresIn }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken
};