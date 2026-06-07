const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host:     'localhost',
  user:     'root',
  password: 'password', 
  database: 'nombre_bd',
});

module.exports = db;
