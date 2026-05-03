const conexion = require('../db/conexion')

const create = (datos, callback) => {
  const { usuario_id, evento_id, codigo_qr } = datos
  const sql = 'INSERT INTO entradas (usuario_id, evento_id, codigo_qr, estado) VALUES (?, ?, ?, "valida")'
  conexion.query(sql, [usuario_id, evento_id, codigo_qr], callback)
}

const getByUsuario = (usuario_id, callback) => {
  const sql = `
    SELECT entradas.*, eventos.nombre as evento_nombre, eventos.fecha, eventos.lugar
    FROM entradas
    JOIN eventos ON entradas.evento_id = eventos.id
    WHERE entradas.usuario_id = ?
    ORDER BY entradas.fecha_compra DESC
  `
  conexion.query(sql, [usuario_id], callback)
}

const getByCodigoQR = (codigo_qr, callback) => {
  const sql = `
    SELECT entradas.*, eventos.nombre as evento_nombre, eventos.fecha, eventos.lugar
    FROM entradas
    JOIN eventos ON entradas.evento_id = eventos.id
    WHERE entradas.codigo_qr = ?
  `
  conexion.query(sql, [codigo_qr], callback)
}

const marcarUsada = (codigo_qr, callback) => {
  conexion.query('UPDATE entradas SET estado = "usada" WHERE codigo_qr = ?', [codigo_qr], callback)
}

module.exports = { create, getByUsuario, getByCodigoQR, marcarUsada }