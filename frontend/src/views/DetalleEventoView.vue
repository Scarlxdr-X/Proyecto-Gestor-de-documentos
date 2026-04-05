<template>
  <div class="pagina">
    <nav class="navbar">
      <span class="logo">🎟️ Gestión de Eventos</span>
      <div class="nav-links">
        <router-link to="/">Inicio</router-link>
        <router-link to="/login">Cerrar sesión</router-link>
      </div>
    </nav>
    <div class="contenedor">
      <p v-if="cargando" class="estado">Cargando evento...</p>
      <p v-if="error" class="error">{{ error }}</p>
      <div class="tarjeta" v-if="evento">
        <h1>{{ evento.nombre }}</h1>
        <p class="descripcion">{{ evento.descripcion }}</p>
        <div class="info">
          <div class="info-item">
            <span class="label">📅 Fecha</span>
            <span>{{ formatearFecha(evento.fecha) }}</span>
          </div>
          <div class="info-item">
            <span class="label">📍 Lugar</span>
            <span>{{ evento.lugar }}</span>
          </div>
          <div class="info-item">
            <span class="label">💰 Precio</span>
            <span>{{ formatearPrecio(evento.precio) }}</span>
          </div>
          <div class="info-item">
            <span class="label">🎟️ Disponibles</span>
            <span>{{ evento.stock_disponible }} entradas</span>
          </div>
        </div>
        <div class="acciones">
          <button @click="comprar" class="btn-comprar">Comprar entrada</button>
          <router-link to="/" class="btn-volver">← Volver</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../api'
import { formatearFecha, formatearPrecio } from '../utils/formato'

const route = useRoute()
const evento = ref(null)
const cargando = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const respuesta = await api.get(`/api/eventos/${route.params.id}`)
    evento.value = respuesta.data
  } catch (e) {
    error.value = 'Error cargando el evento'
  } finally {
    cargando.value = false
  }
})

const comprar = () => {
  alert('Función de compra próximamente')
}
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
}

.nav-links {
  display: flex;
  gap: 1.5rem;
}

.nav-links a {
  color: #888;
  text-decoration: none;
  font-size: 0.9rem;
}

.nav-links a:hover {
  color: #ffffff;
}

.contenedor {
  padding: 2rem;
  max-width: 700px;
  margin: 0 auto;
}

.tarjeta {
  background-color: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  padding: 2rem;
}

h1 {
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
}

.descripcion {
  color: #888;
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
}

.info {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-bottom: 2rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 0;
  border-bottom: 1px solid #2a2a2a;
  font-size: 0.95rem;
}

.label {
  color: #888;
}

.acciones {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.btn-comprar {
  background: #4f46e5;
  color: white;
  border: none;
  padding: 0.7rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background 0.2s;
}

.btn-comprar:hover {
  background: #4338ca;
}

.btn-volver {
  color: #888;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;
}

.btn-volver:hover {
  color: #ffffff;
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