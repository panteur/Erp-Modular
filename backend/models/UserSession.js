const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const UserSession = sequelize.define('UserSession', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  token_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  ip_address: {
    type: DataTypes.STRING(45)
  },
  user_agent: {
    type: DataTypes.STRING(500)
  }
}, {
  tableName: 'user_sessions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = UserSession;