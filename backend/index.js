const express = require('express')
const cors = require('cors')
require('dotenv').config()
const conexion = require('./db/conexion')

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ mensaje: 'Backend Gestor de Eventos funcionando' })
})

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`)
})