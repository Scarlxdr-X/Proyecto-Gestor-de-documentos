const Entrada = require('../models/entrada.model')
const Evento = require('../models/evento.model')
const QRCode = require('qrcode')

const comprarEntrada = (req, res) => {
  const { evento_id, usuario_id } = req.body

  Evento.getById(evento_id, (error, resultados) => {
    if (error) return res.status(500).json({ mensaje: 'Error verificando evento' })
    if (resultados.length === 0) return res.status(404).json({ mensaje: 'Evento no encontrado' })

    const evento = resultados[0]
    if (evento.stock_disponible <= 0) {
      return res.status(400).json({ mensaje: 'No hay entradas disponibles' })
    }

    const codigoQR = `ENTRADA-${evento_id}-${usuario_id}-${Date.now()}`

    QRCode.toDataURL(codigoQR, (errorQR, urlQR) => {
      if (errorQR) return res.status(500).json({ mensaje: 'Error generando QR' })

      Entrada.create({ usuario_id, evento_id, codigo_qr: codigoQR }, (errorInsert, resultado) => {
        if (errorInsert) return res.status(500).json({ mensaje: 'Error registrando entrada' })

        const conexion = require('../db/conexion')
        conexion.query('UPDATE eventos SET stock_disponible = stock_disponible - 1 WHERE id = ?', [evento_id], (errorStock) => {
          if (errorStock) return res.status(500).json({ mensaje: 'Error actualizando stock' })

          res.status(201).json({
            mensaje: 'Entrada comprada exitosamente',
            entrada: {
              id: resultado.insertId,
              codigo_qr: codigoQR,
              qr_imagen: urlQR,
              evento: evento.nombre,
              fecha: evento.fecha,
              lugar: evento.lugar
            }
          })
        })
      })
    })
  })
}

const getMisEntradas = (req, res) => {
  Entrada.getByUsuario(req.params.usuario_id, (error, resultados) => {
    if (error) return res.status(500).json({ mensaje: 'Error obteniendo entradas' })
    res.json(resultados)
  })
}

const validarQR = (req, res) => {
  const { codigo_qr } = req.body

  Entrada.getByCodigoQR(codigo_qr, (error, resultados) => {
    if (error) return res.status(500).json({ mensaje: 'Error validando QR' })
    if (resultados.length === 0) return res.status(404).json({ mensaje: 'QR no encontrado', valido: false })

    const entrada = resultados[0]

    if (entrada.estado === 'usada') {
      return res.json({ mensaje: 'Esta entrada ya fue usada', valido: false, entrada })
    }

    Entrada.marcarUsada(codigo_qr, (errorUpdate) => {
      if (errorUpdate) return res.status(500).json({ mensaje: 'Error actualizando entrada' })
      res.json({ mensaje: 'Entrada valida', valido: true, entrada })
    })
  })
}

module.exports = { comprarEntrada, getMisEntradas, validarQR }