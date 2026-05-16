const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const UserProfile = sequelize.define('UserProfile', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  first_name: {
    type: DataTypes.STRING(100)
  },
  last_name: {
    type: DataTypes.STRING(100)
  },
  phone: {
    type: DataTypes.STRING(20)
  },
  document_type: {
    type: DataTypes.STRING(20)
  },
  document_number: {
    type: DataTypes.STRING(50)
  },
  birth_date: {
    type: DataTypes.DATEONLY
  },
  address: {
    type: DataTypes.STRING(255)
  },
  avatar: {
    type: DataTypes.STRING(255)
  },
  emergency_contact_name: {
    type: DataTypes.STRING(100)
  },
  emergency_contact_phone: {
    type: DataTypes.STRING(20)
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'user_profiles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = UserProfile;
