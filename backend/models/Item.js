const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const Item = sequelize.define('Item', {
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
  type: {
    type: DataTypes.ENUM('product', 'service'),
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  sku: {
    type: DataTypes.STRING(50),
    unique: true
  },
  barcode: {
    type: DataTypes.STRING(50)
  },
  category_id: {
    type: DataTypes.INTEGER,
    references: { model: 'categories', key: 'id' }
  },
  unit: {
    type: DataTypes.STRING(20),
    defaultValue: 'unidad'
  },
  sale_price: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0
  },
  cost_price: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0
  },
  tax_rate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 19
  },
  stock_min: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0
  },
  stock_max: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  image: {
    type: DataTypes.STRING(255)
  }
}, {
  tableName: 'items',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Item;
