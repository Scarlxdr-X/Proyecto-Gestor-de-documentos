const express = require('express')
const router = express.Router()
const { comprarEntrada, getMisEntradas } = require('../controllers/entradas.controller')

router.post('/comprar', comprarEntrada)
router.get('/mis-entradas/:usuario_id', getMisEntradas)

module.exports = router