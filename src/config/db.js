// =====================================================
// src/config/db.js — Pool de conexión a MySQL
// =====================================================
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'crud_clientes',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
});

// Verificar conexión al iniciar
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅ Conectado a MySQL correctamente');
    conn.release();
  } catch (err) {
    console.error('❌ Error al conectar a MySQL:', err.message);
    process.exit(1);
  }
})();

module.exports = pool;