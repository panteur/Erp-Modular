const mysql = require('mysql2/promise');

async function createDatabase() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Panteur7899968@'
  });

  await connection.execute('CREATE DATABASE IF NOT EXISTS erp_modular CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
  console.log('Base de datos creada exitosamente');
  await connection.end();
}

createDatabase().catch(console.error);