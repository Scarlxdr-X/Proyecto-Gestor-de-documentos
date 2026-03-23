const conexion = require('../db/conexion')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const registro = (req, res) => {
  const { nombre, email, password } = req.body

  const checkEmail = 'SELECT * FROM usuarios WHERE email = ?'
  conexion.query(checkEmail, [email], (error, resultados) => {
    if (error) return res.status(500).json({ mensaje: 'Error en el servidor' })
    if (resultados.length > 0) return res.status(400).json({ mensaje: 'El email ya está registrado' })

    const passwordEncriptada = bcrypt.hashSync(password, 10)
    const sql = 'INSERT INTO usuarios (nombre, email, contraseña, rol) VALUES (?, ?, ?, "usuario")'
    conexion.query(sql, [nombre, email, passwordEncriptada], (error, resultado) => {
      if (error) return res.status(500).json({ mensaje: 'Error al registrar usuario' })
      res.status(201).json({ mensaje: 'Usuario registrado correctamente' })
    })
  })
}

const login = (req, res) => {
  const { email, password } = req.body

  const sql = 'SELECT * FROM usuarios WHERE email = ?'
  conexion.query(sql, [email], (error, resultados) => {
    if (error) return res.status(500).json({ mensaje: 'Error en el servidor' })
    if (resultados.length === 0) return res.status(401).json({ mensaje: 'Email o contraseña incorrectos' })

    const usuario = resultados[0]
    const passwordValida = bcrypt.compareSync(password, usuario.contraseña)
    if (!passwordValida) return res.status(401).json({ mensaje: 'Email o contraseña incorrectos' })

    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )

    res.json({ token, usuario: { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol } })
  })
}

module.exports = { registro, login }