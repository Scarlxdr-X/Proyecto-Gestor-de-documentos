const express = require('express')
const router = express.Router()
const { comprarEntrada, getMisEntradas, validarQR } = require('../controllers/entradas.controller')

router.post('/validar', validarQR)
router.post('/comprar', comprarEntrada)
router.get('/mis-entradas/:usuario_id', getMisEntradas)

module.exports = router