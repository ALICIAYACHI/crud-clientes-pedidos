// =====================================================
// src/models/Pedido.js — Modelo Mongoose
// =====================================================
const mongoose = require('mongoose');

const pedidoSchema = new mongoose.Schema(
  {
    fecha: {
      type: Date,
      required: [true, 'La fecha es obligatoria'],
    },
    total: {
      type: Number,
      required: [true, 'El total es obligatorio'],
      min: 0,
    },
    comprobante_img: {
      type: String,
      default: null,
    },
    id_cliente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cliente',
      required: [true, 'El cliente es obligatorio'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Pedido', pedidoSchema);
