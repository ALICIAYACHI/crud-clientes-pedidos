// =====================================================
// app.js — Punto de entrada de la aplicación
// =====================================================
require('dotenv').config();
const express      = require('express');
const path         = require('path');
const methodOverride = require('method-override');

const clientesRouter = require('./src/routes/clientes');
const pedidosRouter  = require('./src/routes/pedidos');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Motor de plantillas ───────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

// ── Middlewares globales ──────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));          // soporte PUT/DELETE desde HTML

// ── Archivos estáticos ────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'src', 'uploads')));

// ── Rutas ─────────────────────────────────────────────
app.get('/', (req, res) => res.redirect('/clientes'));
app.use('/clientes', clientesRouter);
app.use('/pedidos',  pedidosRouter);

// ── Manejo de errores 404 ────────────────────────────
app.use((req, res) => {
  res.status(404).render('404', { titulo: 'Página no encontrada' });
});

// ── Inicio ────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});