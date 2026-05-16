const jwt = require('jsonwebtoken');
const config = require('../config');

const RESET_TOKEN_EXPIRES_IN = '15m';

const generateResetToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      type: 'reset',
      jti: require('crypto').randomUUID()
    },
    config.jwt.secret,
    { expiresIn: RESET_TOKEN_EXPIRES_IN }
  );
};

const verifyResetToken = (token) => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    if (decoded.type !== 'reset') return null;
    return decoded;
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateResetToken,
  verifyResetToken,
  RESET_TOKEN_EXPIRES_IN
};
