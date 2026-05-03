const conexion = require('../db/conexion')

const getByEmail = (email, callback) => {
  conexion.query('SELECT * FROM usuarios WHERE email = ?', [email], callback)
}

const create = (datos, callback) => {
  const { nombre, email, passwordEncriptada } = datos
  const sql = 'INSERT INTO usuarios (nombre, email, contraseña, rol) VALUES (?, ?, ?, "usuario")'
  conexion.query(sql, [nombre, email, passwordEncriptada], callback)
}

module.exports = { getByEmail, create }