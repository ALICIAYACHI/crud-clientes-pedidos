// =====================================================
// src/routes/clientes.js
// =====================================================
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/clientesController');

router.get('/',           ctrl.listar);      // GET  /clientes
router.get('/nuevo',      ctrl.formCrear);   // GET  /clientes/nuevo
router.post('/',          ctrl.crear);       // POST /clientes
router.get('/:id/editar', ctrl.formEditar);  // GET  /clientes/:id/editar
router.put('/:id',        ctrl.actualizar);  // PUT  /clientes/:id
router.delete('/:id',     ctrl.eliminar);    // DEL  /clientes/:id

module.exports = router;