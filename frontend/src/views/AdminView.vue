<template>
  <div class="pagina">
    <nav class="navbar">
      <router-link to="/" class="logo">🎟️ Gestión de Eventos</router-link>
      <div class="nav-links">
    <router-link to="/">Inicio</router-link>
    <router-link to="/perfil">Perfil</router-link>
    <router-link v-if="esAdmin" to="/admin">Admin</router-link>
    <router-link v-if="esAdmin" to="/validar-qr">Validar QR</router-link>
    <button @click="cerrarSesion" class="btn-logout">Cerrar sesión</button>
</div>
    </nav>

    <div class="contenedor">
      <div class="header">
        <h1>Panel de Administrador</h1>
        <button @click="abrirFormulario" class="btn-nuevo">+ Nuevo Evento</button>
      </div>

      <div class="formulario-card" v-if="mostrarFormulario">
        <h2>{{ eventoEditando ? 'Editar Evento' : 'Nuevo Evento' }}</h2>
        <div class="formulario">
          <input v-model="form.nombre" placeholder="Nombre del evento" />
          <textarea v-model="form.descripcion" placeholder="Descripcion"></textarea>
          <input v-model="form.fecha" type="datetime-local" />
          <input v-model="form.lugar" placeholder="Lugar" />
          <input v-model="form.precio" type="number" placeholder="Precio" />
          <input v-model="form.stock_total" type="number" placeholder="Stock total" />
          <input v-model="form.imagen" placeholder="URL de la imagen" />
          <div class="form-acciones">
            <button @click="guardarEvento" class="btn-guardar">
              {{ eventoEditando ? 'Actualizar' : 'Crear Evento' }}
            </button>
            <button @click="cerrarFormulario" class="btn-cancelar">Cancelar</button>
          </div>
        </div>
      </div>

      <div class="tabla-card">
        <p v-if="cargando" class="estado">Cargando eventos...</p>
        <table v-if="!cargando && eventos.length > 0">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Fecha</th>
              <th>Lugar</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="evento in eventos" :key="evento.id">
              <td>{{ evento.nombre }}</td>
              <td>{{ formatearFecha(evento.fecha) }}</td>
              <td>{{ evento.lugar }}</td>
              <td>{{ formatearPrecio(evento.precio) }}</td>
              <td>{{ evento.stock_disponible }}/{{ evento.stock_total }}</td>
              <td class="acciones-tabla">
                <button @click="editarEvento(evento)" class="btn-editar">Editar</button>
                <button @click="eliminarEvento(evento.id)" class="btn-eliminar">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-if="!cargando && eventos.length === 0" class="estado">No hay eventos</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'
import { formatearFecha, formatearPrecio } from '../utils/formato'

const router = useRouter()
const eventos = ref([])
const cargando = ref(true)
const mostrarFormulario = ref(false)
const eventoEditando = ref(null)

const form = ref({
  nombre: '',
  descripcion: '',
  fecha: '',
  lugar: '',
  precio: '',
  stock_total: '',
  imagen: ''
})

const usuario = computed(() => {
  const data = localStorage.getItem('usuario')
  return data ? JSON.parse(data) : { nombre: '', email: '', rol: '' }
})

const esAdmin = computed(() => usuario.value?.rol === 'admin')

const cerrarSesion = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('usuario')
  router.push('/login')
}

const cargarEventos = async () => {
  try {
    const respuesta = await api.get('/api/eventos')
    eventos.value = respuesta.data
  } catch (e) {
    console.error('Error cargando eventos')
  } finally {
    cargando.value = false
  }
}

const abrirFormulario = () => {
  eventoEditando.value = null
  form.value = { nombre: '', descripcion: '', fecha: '', lugar: '', precio: '', stock_total: '', imagen: '' }
  mostrarFormulario.value = true
}

const cerrarFormulario = () => {
  mostrarFormulario.value = false
  eventoEditando.value = null
}

const editarEvento = (evento) => {
  eventoEditando.value = evento
  form.value = {
    nombre: evento.nombre,
    descripcion: evento.descripcion,
    fecha: evento.fecha.slice(0, 16),
    lugar: evento.lugar,
    precio: evento.precio,
    stock_total: evento.stock_total,
    imagen: evento.imagen
  }
  mostrarFormulario.value = true
}

const guardarEvento = async () => {
  try {
    if (eventoEditando.value) {
      await api.put(`/api/eventos/${eventoEditando.value.id}`, form.value)
    } else {
      await api.post('/api/eventos', form.value)
    }
    cerrarFormulario()
    cargarEventos()
  } catch (e) {
    alert('Error guardando evento')
  }
}

const eliminarEvento = async (id) => {
  if (!confirm('Seguro que quieres eliminar este evento?')) return
  try {
    await api.delete(`/api/eventos/${id}`)
    cargarEventos()
  } catch (e) {
    alert('Error eliminando evento')
  }
}

onMounted(cargarEventos)
</script>

<style scoped>
.pagina {
  min-height: 100vh;
  background-color: #0f0f0f;
  color: #ffffff;
  display: flex;
  flex-direction: column;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2.5rem;
  background-color: #1a1a1a;
  border-bottom: 1px solid #2a2a2a;
}

.logo {
  font-size: 1.2rem;
  font-weight: bold;
  color: #ffffff;
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-links a {
  color: #888;
  text-decoration: none;
  font-size: 0.9rem;
}

.nav-links a:hover {
  color: #ffffff;
}

.btn-logout {
  background: transparent;
  border: none;
  color: #888;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-logout:hover {
  color: #ffffff;
}

.contenedor {
  padding: 2rem;
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header h1 {
  font-size: 1.8rem;
}

.btn-nuevo {
  background: #4f46e5;
  color: white;
  border: none;
  padding: 0.7rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
}

.btn-nuevo:hover {
  background: #4338ca;
}

.formulario-card {
  background-color: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  padding: 2rem;
}

.formulario-card h2 {
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
}

.formulario {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.formulario input,
.formulario textarea {
  background: #0f0f0f;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  padding: 0.7rem 1rem;
  color: #ffffff;
  font-size: 0.9rem;
  outline: none;
}

.formulario input:focus,
.formulario textarea:focus {
  border-color: #4f46e5;
}

.formulario textarea {
  min-height: 100px;
  resize: vertical;
}

.form-acciones {
  display: flex;
  gap: 1rem;
}

.btn-guardar {
  background: #4f46e5;
  color: white;
  border: none;
  padding: 0.7rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  flex: 1;
}

.btn-guardar:hover {
  background: #4338ca;
}

.btn-cancelar {
  background: transparent;
  color: #888;
  border: 1px solid #2a2a2a;
  padding: 0.7rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  flex: 1;
}

.btn-cancelar:hover {
  color: #ffffff;
  border-color: #888;
}

.tabla-card {
  background-color: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  padding: 1.5rem;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

thead tr {
  border-bottom: 1px solid #2a2a2a;
}

th {
  text-align: left;
  padding: 0.8rem 1rem;
  color: #888;
  font-weight: normal;
}

td {
  padding: 0.8rem 1rem;
  border-bottom: 1px solid #1f1f1f;
  color: #ccc;
}

tbody tr:hover {
  background: #222;
}

.acciones-tabla {
  display: flex;
  gap: 0.5rem;
}

.btn-editar {
  background: #1e3a5f;
  color: #60a5fa;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
}

.btn-editar:hover {
  background: #1e40af;
}

.btn-eliminar {
  background: #3b1f1f;
  color: #f87171;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
}

.btn-eliminar:hover {
  background: #7f1d1d;
}

.estado {
  text-align: center;
  color: #888;
  padding: 2rem;
}
</style>