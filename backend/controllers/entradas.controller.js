const conexion = require('../db/conexion')
const QRCode = require('qrcode')

const comprarEntrada = (req, res) => {
  const { evento_id, usuario_id } = req.body

  // Verificar stock disponible
  conexion.query('SELECT * FROM eventos WHERE id = ?', [evento_id], (error, resultados) => {
    if (error) return res.status(500).json({ mensaje: 'Error verificando evento' })
    if (resultados.length === 0) return res.status(404).json({ mensaje: 'Evento no encontrado' })

    const evento = resultados[0]
    if (evento.stock_disponible <= 0) {
      return res.status(400).json({ mensaje: 'No hay entradas disponibles' })
    }

    // Generar codigo QR unico
    const codigoQR = `ENTRADA-${evento_id}-${usuario_id}-${Date.now()}`

    // Generar imagen QR en base64
    QRCode.toDataURL(codigoQR, (errorQR, urlQR) => {
      if (errorQR) return res.status(500).json({ mensaje: 'Error generando QR' })

      // Insertar entrada en la base de datos
      const sqlEntrada = 'INSERT INTO entradas (usuario_id, evento_id, codigo_qr, estado) VALUES (?, ?, ?, "valida")'
      conexion.query(sqlEntrada, [usuario_id, evento_id, codigoQR], (errorInsert, resultado) => {
        if (errorInsert) return res.status(500).json({ mensaje: 'Error registrando entrada' })

        // Descontar stock
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
  const { usuario_id } = req.params
  const sql = `
    SELECT entradas.*, eventos.nombre as evento_nombre, eventos.fecha, eventos.lugar
    FROM entradas
    JOIN eventos ON entradas.evento_id = eventos.id
    WHERE entradas.usuario_id = ?
    ORDER BY entradas.fecha_compra DESC
  `
  conexion.query(sql, [usuario_id], (error, resultados) => {
    if (error) return res.status(500).json({ mensaje: 'Error obteniendo entradas' })
    res.json(resultados)
  })
}

module.exports = { comprarEntrada, getMisEntradas }