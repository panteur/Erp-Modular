const bcrypt = require('bcryptjs');
const config = require('../config');

const hashPassword = async (password) => {
  return await bcrypt.hash(password, config.bcrypt.saltRounds);
};

const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

module.exports = {
  hashPassword,
  comparePassword
};