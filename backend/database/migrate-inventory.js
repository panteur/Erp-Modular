const sequelize = require('./connection');
require('../models/Category');
require('../models/Item');
require('../models/Inventory');

const migrate = async () => {
  try {
    console.log('Ejecutando migración de inventario...');

    const queryInterface = sequelize.getQueryInterface();
    const { DataTypes } = require('sequelize');

    // Crear tablas que no existen
    await sequelize.sync();

    // Agregar parent_id si no existe (para subcategorías)
    try {
      await queryInterface.addColumn('categories', 'parent_id', {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'categories', key: 'id' }
      });
      console.log('  -> Columna parent_id agregada a categories');
    } catch (err) {
      if (err.message && err.message.includes('Duplicate column')) {
        console.log('  -> Columna parent_id ya existe');
      } else {
        console.log('  -> Columna parent_id ya existe (ok)');
      }
    }

    console.log('Migración de inventario completada');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

migrate();
