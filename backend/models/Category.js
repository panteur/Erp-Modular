const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  company_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'companies', key: 'id' }
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.STRING(255)
  },
  parent_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'categories', key: 'id' }
  },
  type: {
    type: DataTypes.ENUM('product', 'service', 'both'),
    defaultValue: 'both'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'categories',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Category;
