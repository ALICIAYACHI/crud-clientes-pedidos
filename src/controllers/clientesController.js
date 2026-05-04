// =====================================================
// src/controllers/clientesController.js
// =====================================================
const pool = require('../config/db');

/* ── LISTAR ─────────────────────────────────────────── */
exports.listar = async (req, res) => {
  try {
    const [clientes] = await pool.query(
      'SELECT * FROM clientes ORDER BY id_cliente DESC'
    );
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

  // Validación básica
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
    await pool.query(
      'INSERT INTO clientes (nombre, telefono, email) VALUES (?, ?, ?)',
      [nombre.trim(), telefono.trim(), email.trim()]
    );
    res.redirect('/clientes');
  } catch (err) {
    const msg = err.code === 'ER_DUP_ENTRY'
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
    const [[cliente]] = await pool.query(
      'SELECT * FROM clientes WHERE id_cliente = ?',
      [req.params.id]
    );
    if (!cliente) return res.redirect('/clientes');

    res.render('clientes/form', {
      titulo: 'Editar Cliente',
      cliente,
      accion: `/clientes/${cliente.id_cliente}?_method=PUT`,
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
      cliente: { ...req.body, id_cliente: id },
      accion: `/clientes/${id}?_method=PUT`,
      metodo: 'POST',
      error: 'Todos los campos son obligatorios.',
    });
  }

  try {
    await pool.query(
      'UPDATE clientes SET nombre=?, telefono=?, email=? WHERE id_cliente=?',
      [nombre.trim(), telefono.trim(), email.trim(), id]
    );
    res.redirect('/clientes');
  } catch (err) {
    const msg = err.code === 'ER_DUP_ENTRY'
      ? 'El correo ya está en uso por otro cliente.'
      : err.message;
    res.render('clientes/form', {
      titulo: 'Editar Cliente',
      cliente: { ...req.body, id_cliente: id },
      accion: `/clientes/${id}?_method=PUT`,
      metodo: 'POST',
      error: msg,
    });
  }
};

/* ── ELIMINAR ───────────────────────────────────────── */
exports.eliminar = async (req, res) => {
  try {
    await pool.query('DELETE FROM clientes WHERE id_cliente = ?', [req.params.id]);
    res.redirect('/clientes');
  } catch (err) {
    console.error(err);
    res.redirect('/clientes');
  }
};