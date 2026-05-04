// =====================================================
// src/routes/pedidos.js
// =====================================================
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/pedidosController');

router.get('/',           ctrl.listar);                     // GET  /pedidos
router.get('/nuevo',      ctrl.formCrear);                  // GET  /pedidos/nuevo
router.post('/',          ctrl.upload, ctrl.crear);         // POST /pedidos
router.get('/:id/editar', ctrl.formEditar);                 // GET  /pedidos/:id/editar
router.put('/:id',        ctrl.upload, ctrl.actualizar);    // PUT  /pedidos/:id
router.delete('/:id',     ctrl.eliminar);                   // DEL  /pedidos/:id

module.exports = router;