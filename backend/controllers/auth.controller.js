const Usuario = require('../models/usuario.model')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const registro = (req, res) => {
  const { nombre, email, password } = req.body

  Usuario.getByEmail(email, (error, resultados) => {
    if (error) return res.status(500).json({ mensaje: 'Error en el servidor' })
    if (resultados.length > 0) return res.status(400).json({ mensaje: 'El email ya esta registrado' })

    const passwordEncriptada = bcrypt.hashSync(password, 10)
    Usuario.create({ nombre, email, passwordEncriptada }, (errorInsert) => {
      if (errorInsert) return res.status(500).json({ mensaje: 'Error al registrar usuario' })
      res.status(201).json({ mensaje: 'Usuario registrado correctamente' })
    })
  })
}

const login = (req, res) => {
  const { email, password } = req.body

  Usuario.getByEmail(email, (error, resultados) => {
    if (error) return res.status(500).json({ mensaje: 'Error en el servidor' })
    if (resultados.length === 0) return res.status(401).json({ mensaje: 'Email o contrasena incorrectos' })

    const usuario = resultados[0]
    const passwordValida = bcrypt.compareSync(password, usuario.contraseña)
    if (!passwordValida) return res.status(401).json({ mensaje: 'Email o contrasena incorrectos' })

    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )

    res.json({ token, usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol } })
  })
}

module.exports = { registro, login }