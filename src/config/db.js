// =====================================================
// src/config/db.js — Conexión a PostgreSQL (Render)
// =====================================================
const { Pool } = require('pg');

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }, // obligatorio en Render
      }
    : {
        host:     process.env.DB_HOST     || 'localhost',
        port:     process.env.DB_PORT     || 5432,
        user:     process.env.DB_USER     || 'postgres',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME     || 'crud_clientes',
      }
);

(async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Conectado a PostgreSQL correctamente');
    client.release();
  } catch (err) {
    console.error('❌ Error al conectar a PostgreSQL:', err.message);
  }
})();

module.exports = pool;