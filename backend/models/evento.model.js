const conexion = require('../db/conexion')

const getAll = (callback) => {
  conexion.query('SELECT * FROM eventos', callback)
}

const getById = (id, callback) => {
  conexion.query('SELECT * FROM eventos WHERE id = ?', [id], callback)
}

const create = (datos, callback) => {
  const { nombre, descripcion, fecha, lugar, precio, stock_total, imagen } = datos
  const sql = 'INSERT INTO eventos (nombre, descripcion, fecha, lugar, precio, stock_total, stock_disponible, imagen) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  conexion.query(sql, [nombre, descripcion, fecha, lugar, precio, stock_total, stock_total, imagen], callback)
}

const update = (id, datos, callback) => {
  const { nombre, descripcion, fecha, lugar, precio, stock_total, imagen } = datos
  const sql = 'UPDATE eventos SET nombre=?, descripcion=?, fecha=?, lugar=?, precio=?, stock_total=?, imagen=? WHERE id=?'
  conexion.query(sql, [nombre, descripcion, fecha, lugar, precio, stock_total, imagen, id], callback)
}

const remove = (id, callback) => {
  conexion.query('DELETE FROM eventos WHERE id = ?', [id], callback)
}

module.exports = { getAll, getById, create, update, remove }