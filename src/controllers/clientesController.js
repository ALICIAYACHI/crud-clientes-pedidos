// =====================================================
// src/controllers/clientesController.js — Mongoose
// =====================================================
const Cliente = require('../models/Cliente');

/* ── LISTAR ─────────────────────────────────────────── */
exports.listar = async (req, res) => {
  try {
    const clientes = await Cliente.find().sort({ createdAt: -1 });
    res.render('clientes/index', { titulo: 'Clientes', clientes, error: null });
  } catch (err) {
    console.error(err);
    res.render('clientes/index', { titulo: 'Clientes', clientes: [], error: err.message });
  }
};

/* ── FORM CREAR ─────────────────────────────────────── */
exports.formCrear = (req, res) => {
  res.render('clientes/form', {
    titulo: 'Nuevo Cliente',
    cliente: {},
    accion: '/clientes',
    metodo: 'POST',
    error: null,
  });
};

/* ── CREAR ───────────────────────────────────────────── */
exports.crear = async (req, res) => {
  const { nombre, telefono, email } = req.body;

  if (!nombre || !telefono || !email) {
    return res.render('clientes/form', {
      titulo: 'Nuevo Cliente',
      cliente: req.body,
      accion: '/clientes',
      metodo: 'POST',
      error: 'Todos los campos son obligatorios.',
    });
  }

  try {
    const nuevoCliente = new Cliente({
      nombre: nombre.trim(),
      telefono: telefono.trim(),
      email: email.trim(),
    });
    await nuevoCliente.save();
    res.redirect('/clientes');
  } catch (err) {
    const msg = err.code === 11000 || err.keyPattern?.email
      ? 'El correo ya está registrado.'
      : err.message;
    res.render('clientes/form', {
      titulo: 'Nuevo Cliente',
      cliente: req.body,
      accion: '/clientes',
      metodo: 'POST',
      error: msg,
    });
  }
};

/* ── FORM EDITAR ────────────────────────────────────── */
exports.formEditar = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id);
    if (!cliente) return res.redirect('/clientes');

    res.render('clientes/form', {
      titulo: 'Editar Cliente',
      cliente,
      accion: `/clientes/${cliente._id}?_method=PUT`,
      metodo: 'POST',
      error: null,
    });
  } catch (err) {
    console.error(err);
    res.redirect('/clientes');
  }
};

/* ── ACTUALIZAR ─────────────────────────────────────── */
exports.actualizar = async (req, res) => {
  const { nombre, telefono, email } = req.body;
  const { id } = req.params;

  if (!nombre || !telefono || !email) {
    return res.render('clientes/form', {
      titulo: 'Editar Cliente',
      cliente: { ...req.body, _id: id },
      accion: `/clientes/${id}?_method=PUT`,
      metodo: 'POST',
      error: 'Todos los campos son obligatorios.',
    });
  }

  try {
    await Cliente.findByIdAndUpdate(
      id,
      {
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        email: email.trim(),
      },
      { new: true, runValidators: true }
    );
    res.redirect('/clientes');
  } catch (err) {
    const msg = err.code === 11000 || err.keyPattern?.email
      ? 'El correo ya está en uso por otro cliente.'
      : err.message;
    res.render('clientes/form', {
      titulo: 'Editar Cliente',
      cliente: { ...req.body, _id: id },
      accion: `/clientes/${id}?_method=PUT`,
      metodo: 'POST',
      error: msg,
    });
  }
};

/* ── ELIMINAR ───────────────────────────────────────── */
exports.eliminar = async (req, res) => {
  try {
    await Cliente.findByIdAndDelete(req.params.id);
    res.redirect('/clientes');
  } catch (err) {
    console.error(err);
    res.redirect('/clientes');
  }
};