const sequelize = require('./connection');
const { Company, Branch, SystemModule, Role, User } = require('../models');
const { hashPassword } = require('../utils/password');

const migrate = async () => {
  try {
    console.log('Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('Conexión exitosa');

    console.log('Sincronizando modelos...');
    await sequelize.sync({ force: true });
    console.log('Modelos sincronizados');

    console.log('Migración completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('Error en migración:', error);
    process.exit(1);
  }
};

migrate();