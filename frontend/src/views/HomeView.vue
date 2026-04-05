<template>
  <div class="pagina">
    <nav class="navbar">
      <span class="logo">🎟️ Gestión de Eventos</span>
      <div class="nav-links">
        <router-link to="/">Inicio</router-link>
        <button @click="cerrarSesion" class="btn-logout">Cerrar sesión</button>
      </div>
    </nav>
    <div class="contenedor">
      <h1 class="titulo">Eventos disponibles</h1>
      <p v-if="cargando" class="estado">Cargando eventos...</p>
      <p v-if="error" class="error">{{ error }}</p>
      <div class="eventos-grid" v-if="!cargando && eventos.length > 0">
        <div class="evento-card" v-for="evento in eventos" :key="evento.id">
          <div class="card-body">
            <h2>{{ evento.nombre }}</h2>
            <p class="descripcion">{{ evento.descripcion }}</p>
            <div class="info">
              <p>📅 {{ formatearFecha(evento.fecha) }}</p>
              <p>📍 {{ evento.lugar }}</p>
              <p>💰 {{ formatearPrecio(evento.precio) }}</p>
              <p>🎟️ {{ evento.stock_disponible }} disponibles</p>
            </div>
          </div>
          <router-link :to="`/eventos/${evento.id}`" class="btn">Ver detalle</router-link>
        </div>
      </div>
      <p v-if="!cargando && eventos.length === 0" class="estado">No hay eventos disponibles</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'
import { formatearFecha, formatearPrecio } from '../utils/formato'

const router = useRouter()
const eventos = ref([])
const cargando = ref(true)
const error = ref('')

const cerrarSesion = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('usuario')
  router.push('/login')
}

onMounted(async () => {
  try {
    const respuesta = await api.get('/api/eventos')
    eventos.value = respuesta.data
  } catch (e) {
    error.value = 'Error cargando eventos'
  } finally {
    cargando.value = false
  }
})
</script>

<style scoped>
.pagina {
  min-height: 100vh;
  background-color: #0f0f0f;
  color: #ffffff;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #1a1a1a;
  border-bottom: 1px solid #2a2a2a;
}

.logo {
  font-size: 1.2rem;
  font-weight: bold;
  color: #ffffff;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
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
  max-width: 1200px;
  margin: 0 auto;
}

.titulo {
  font-size: 2rem;
  margin-bottom: 2rem;
  text-align: center;
}

.eventos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.evento-card {
  background-color: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1rem;
  transition: border-color 0.2s;
}

.evento-card:hover {
  border-color: #4f46e5;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.evento-card h2 {
  font-size: 1.2rem;
}

.descripcion {
  color: #888;
  font-size: 0.9rem;
}

.info {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-size: 0.9rem;
  color: #ccc;
  margin-top: 0.5rem;
}

.btn {
  display: block;
  background: #4f46e5;
  color: white;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  text-decoration: none;
  text-align: center;
  font-size: 0.9rem;
  transition: background 0.2s;
}

.btn:hover {
  background: #4338ca;
}

.estado {
  text-align: center;
  color: #888;
  margin-top: 2rem;
}

.error {
  text-align: center;
  color: #ff6b6b;
  margin-top: 2rem;
}
</style>