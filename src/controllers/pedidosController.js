// =====================================================
// src/controllers/pedidosController.js — Mongoose
// =====================================================
const path        = require('path');
const fs          = require('fs');
const Pedido      = require('../models/Pedido');
const Cliente     = require('../models/Cliente');
const multer      = require('multer');

/* ── Configuración de Multer ──────────────────────── */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `comprobante_${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp|pdf/;
  const ok = allowed.test(path.extname(file.originalname).toLowerCase())
           && allowed.test(file.mimetype);
  ok ? cb(null, true) : cb(new Error('Solo se permiten imágenes o PDF'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
exports.upload = upload.single('comprobante_img');

/* ── LISTAR ─────────────────────────────────────────── */
exports.listar = async (req, res) => {
  try {
    const pedidos = await Pedido.find()
      .populate('id_cliente', 'nombre')
      .sort({ createdAt: -1 });
    
    res.render('pedidos/index', { titulo: 'Pedidos', pedidos, error: null });
  } catch (err) {
    res.render('pedidos/index', { titulo: 'Pedidos', pedidos: [], error: err.message });
  }
};

/* ── FORM CREAR ─────────────────────────────────────── */
exports.formCrear = async (req, res) => {
  const clientes = await Cliente.find().sort({ nombre: 1 });
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
    const clientes = await Cliente.find().sort({ nombre: 1 });
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
    const nuevoPedido = new Pedido({
      fecha: new Date(fecha),
      total: parseFloat(total),
      comprobante_img,
      id_cliente,
    });
    await nuevoPedido.save();
    res.redirect('/pedidos');
  } catch (err) {
    const clientes = await Cliente.find().sort({ nombre: 1 });
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
    const pedido = await Pedido.findById(req.params.id);
    if (!pedido) return res.redirect('/pedidos');

    const clientes = await Cliente.find().sort({ nombre: 1 });
    res.render('pedidos/form', {
      titulo: 'Editar Pedido',
      pedido,
      clientes,
      accion: `/pedidos/${pedido._id}?_method=PUT`,
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
    const pedidoActual = await Pedido.findById(id);
    if (!pedidoActual) return res.redirect('/pedidos');

    // Si hay un nuevo archivo, eliminar el anterior
    if (req.file && pedidoActual.comprobante_img) {
      const ruta = path.join(__dirname, '..', 'uploads', pedidoActual.comprobante_img);
      if (fs.existsSync(ruta)) fs.unlinkSync(ruta);
    }

    const actualizacion = {
      fecha: new Date(fecha),
      total: parseFloat(total),
      id_cliente,
    };

    if (req.file) {
      actualizacion.comprobante_img = req.file.filename;
    }

    await Pedido.findByIdAndUpdate(id, actualizacion, { new: true, runValidators: true });
    res.redirect('/pedidos');
  } catch (err) {
    const clientes = await Cliente.find().sort({ nombre: 1 });
    res.render('pedidos/form', {
      titulo: 'Editar Pedido',
      pedido: { ...req.body, _id: id },
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
    const pedido = await Pedido.findById(req.params.id);
    if (pedido && pedido.comprobante_img) {
      const ruta = path.join(__dirname, '..', 'uploads', pedido.comprobante_img);
      if (fs.existsSync(ruta)) fs.unlinkSync(ruta);
    }
    await Pedido.findByIdAndDelete(req.params.id);
    res.redirect('/pedidos');
  } catch (err) {
    console.error(err);
    res.redirect('/pedidos');
  }
};