const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host:     'localhost',
  user:     'root',
  password: 'tu_password',  // ← cambia esto
  database: 'nombre_tu_bd', // ← cambia esto
});

module.exports = db;