const Evento = require('../models/evento.model')

const getEventos = (req, res) => {
  Evento.getAll((error, resultados) => {
    if (error) return res.status(500).json({ mensaje: 'Error obteniendo eventos' })
    res.json(resultados)
  })
}

const getEventoById = (req, res) => {
  Evento.getById(req.params.id, (error, resultados) => {
    if (error) return res.status(500).json({ mensaje: 'Error obteniendo evento' })
    if (resultados.length === 0) return res.status(404).json({ mensaje: 'Evento no encontrado' })
    res.json(resultados[0])
  })
}

const createEvento = (req, res) => {
  Evento.create(req.body, (error, resultado) => {
    if (error) return res.status(500).json({ mensaje: 'Error creando evento' })
    res.status(201).json({ mensaje: 'Evento creado', id: resultado.insertId })
  })
}

const updateEvento = (req, res) => {
  Evento.update(req.params.id, req.body, (error) => {
    if (error) return res.status(500).json({ mensaje: 'Error actualizando evento' })
    res.json({ mensaje: 'Evento actualizado' })
  })
}

const deleteEvento = (req, res) => {
  Evento.remove(req.params.id, (error) => {
    if (error) return res.status(500).json({ mensaje: 'Error eliminando evento' })
    res.json({ mensaje: 'Evento eliminado' })
  })
}

module.exports = { getEventos, getEventoById, createEvento, updateEvento, deleteEvento }