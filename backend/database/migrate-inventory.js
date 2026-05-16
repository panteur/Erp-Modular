const sequelize = require('./connection');
require('../models/Category');
require('../models/Item');
require('../models/Inventory');

const migrate = async () => {
  try {
    console.log('Creando tablas de inventario...');
    await sequelize.sync();
    console.log('Tablas de inventario creadas');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

migrate();
