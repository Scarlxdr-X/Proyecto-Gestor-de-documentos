const express = require('express')
const cors = require('cors')
require('dotenv').config()
const conexion = require('./db/conexion')
const crearTablas = require('./db/tablas')
const authRoutes = require('./routes/auth.routes')
const eventosRoutes = require('./routes/eventos.routes')

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())

app.use('/auth', authRoutes)
app.use('/api/eventos', eventosRoutes)

app.get('/', (req, res) => {
  res.json({ mensaje: 'Backend Gestor de Eventos funcionando' })
})

crearTablas()

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`)
})