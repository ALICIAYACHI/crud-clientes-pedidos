// =====================================================
// src/controllers/pedidosController.js
// =====================================================
const path = require('path');
const fs   = require('fs');
const pool = require('../config/db');
const multer = require('multer');

/* ── Configuración de Multer ──────────────────────── */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext  = path.extname(file.originalname);
    const name = `comprobante_${Date.now()}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp|pdf/;
  const extOk   = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimeOk  = allowed.test(file.mimetype);
  extOk && mimeOk ? cb(null, true) : cb(new Error('Solo se permiten imágenes o PDF'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
exports.upload = upload.single('comprobante_img');   // exportamos para usar en rutas

/* ── LISTAR ─────────────────────────────────────────── */
exports.listar = async (req, res) => {
  try {
    const [pedidos] = await pool.query(`
      SELECT p.*, c.nombre AS nombre_cliente
      FROM pedidos p
      INNER JOIN clientes c ON p.id_cliente = c.id_cliente
      ORDER BY p.id_pedido DESC
    `);
    res.render('pedidos/index', { titulo: 'Pedidos', pedidos, error: null });
  } catch (err) {
    res.render('pedidos/index', { titulo: 'Pedidos', pedidos: [], error: err.message });
  }
};

/* ── FORM CREAR ─────────────────────────────────────── */
exports.formCrear = async (req, res) => {
  const [clientes] = await pool.query('SELECT id_cliente, nombre FROM clientes ORDER BY nombre');
  res.render('pedidos/form', {
    titulo: 'Nuevo Pedido',
    pedido: {},
    clientes,
    accion: '/pedidos',
    metodo: 'POST',
    error: null,
  });
};

/* ── CREAR ───────────────────────────────────────────── */
exports.crear = async (req, res) => {
  const { fecha, total, id_cliente } = req.body;
  const comprobante_img = req.file ? req.file.filename : null;

  if (!fecha || !total || !id_cliente) {
    const [clientes] = await pool.query('SELECT id_cliente, nombre FROM clientes ORDER BY nombre');
    return res.render('pedidos/form', {
      titulo: 'Nuevo Pedido',
      pedido: req.body,
      clientes,
      accion: '/pedidos',
      metodo: 'POST',
      error: 'Los campos fecha, total y cliente son obligatorios.',
    });
  }

  try {
    await pool.query(
      'INSERT INTO pedidos (fecha, total, comprobante_img, id_cliente) VALUES (?, ?, ?, ?)',
      [fecha, parseFloat(total), comprobante_img, id_cliente]
    );
    res.redirect('/pedidos');
  } catch (err) {
    const [clientes] = await pool.query('SELECT id_cliente, nombre FROM clientes ORDER BY nombre');
    res.render('pedidos/form', {
      titulo: 'Nuevo Pedido',
      pedido: req.body,
      clientes,
      accion: '/pedidos',
      metodo: 'POST',
      error: err.message,
    });
  }
};

/* ── FORM EDITAR ────────────────────────────────────── */
exports.formEditar = async (req, res) => {
  try {
    const [[pedido]]   = await pool.query('SELECT * FROM pedidos WHERE id_pedido = ?', [req.params.id]);
    const [clientes]   = await pool.query('SELECT id_cliente, nombre FROM clientes ORDER BY nombre');
    if (!pedido) return res.redirect('/pedidos');

    res.render('pedidos/form', {
      titulo: 'Editar Pedido',
      pedido,
      clientes,
      accion: `/pedidos/${pedido.id_pedido}?_method=PUT`,
      metodo: 'POST',
      error: null,
    });
  } catch (err) {
    res.redirect('/pedidos');
  }
};

/* ── ACTUALIZAR ─────────────────────────────────────── */
exports.actualizar = async (req, res) => {
  const { fecha, total, id_cliente } = req.body;
  const { id } = req.params;

  try {
    // Si sube nueva imagen, borrar la anterior
    if (req.file) {
      const [[pedidoActual]] = await pool.query(
        'SELECT comprobante_img FROM pedidos WHERE id_pedido = ?', [id]
      );
      if (pedidoActual?.comprobante_img) {
        const rutaAnterior = path.join(__dirname, '..', 'uploads', pedidoActual.comprobante_img);
        if (fs.existsSync(rutaAnterior)) fs.unlinkSync(rutaAnterior);
      }
    }

    const comprobante_img = req.file ? req.file.filename : null;

    if (comprobante_img) {
      await pool.query(
        'UPDATE pedidos SET fecha=?, total=?, comprobante_img=?, id_cliente=? WHERE id_pedido=?',
        [fecha, parseFloat(total), comprobante_img, id_cliente, id]
      );
    } else {
      await pool.query(
        'UPDATE pedidos SET fecha=?, total=?, id_cliente=? WHERE id_pedido=?',
        [fecha, parseFloat(total), id_cliente, id]
      );
    }
    res.redirect('/pedidos');
  } catch (err) {
    const [clientes] = await pool.query('SELECT id_cliente, nombre FROM clientes ORDER BY nombre');
    res.render('pedidos/form', {
      titulo: 'Editar Pedido',
      pedido: { ...req.body, id_pedido: id },
      clientes,
      accion: `/pedidos/${id}?_method=PUT`,
      metodo: 'POST',
      error: err.message,
    });
  }
};

/* ── ELIMINAR ───────────────────────────────────────── */
exports.eliminar = async (req, res) => {
  try {
    const [[pedido]] = await pool.query(
      'SELECT comprobante_img FROM pedidos WHERE id_pedido = ?', [req.params.id]
    );
    if (pedido?.comprobante_img) {
      const ruta = path.join(__dirname, '..', 'uploads', pedido.comprobante_img);
      if (fs.existsSync(ruta)) fs.unlinkSync(ruta);
    }
    await pool.query('DELETE FROM pedidos WHERE id_pedido = ?', [req.params.id]);
    res.redirect('/pedidos');
  } catch (err) {
    console.error(err);
    res.redirect('/pedidos');
  }
};