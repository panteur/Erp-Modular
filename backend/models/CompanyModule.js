const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const CompanyModule = sequelize.define('CompanyModule', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  company_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'companies',
      key: 'id'
    }
  },
  module_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'modules',
      key: 'id'
    }
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  settings: {
    type: DataTypes.JSON,
    defaultValue: {}
  }
}, {
  tableName: 'company_modules',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = CompanyModule;