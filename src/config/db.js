// =====================================================
// src/config/db.js — Conexión a MongoDB con Mongoose
// =====================================================
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error('MONGODB_URI no está definida en el archivo .env');
    }

    await mongoose.connect(mongoURI);

    console.log('✅ Conectado a MongoDB Atlas correctamente');
  } catch (err) {
    console.error('❌ Error al conectar a MongoDB:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;