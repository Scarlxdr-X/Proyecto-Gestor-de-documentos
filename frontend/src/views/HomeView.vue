<template>
  <div class="contenedor">
    <h1 class="titulo">Eventos disponibles</h1>
    <p v-if="cargando" class="estado">Cargando eventos...</p>
    <p v-if="error" class="error">{{ error }}</p>
    <div class="eventos-grid" v-if="!cargando && eventos.length > 0">
      <div class="evento-card" v-for="evento in eventos" :key="evento.id">
        <h2>{{ evento.nombre }}</h2>
        <p class="descripcion">{{ evento.descripcion }}</p>
        <div class="info">
          <p><span>📅</span> {{ evento.fecha }}</p>
          <p><span>📍</span> {{ evento.lugar }}</p>
          <p><span>💰</span> ${{ evento.precio }}</p>
          <p><span>🎟️</span> {{ evento.stock_disponible }} disponibles</p>
        </div>
        <router-link :to="`/eventos/${evento.id}`" class="btn">Ver detalle</router-link>
      </div>
    </div>
    <p v-if="!cargando && eventos.length === 0" class="estado">No hay eventos disponibles</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'

const eventos = ref([])
const cargando = ref(true)
const error = ref('')

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
.contenedor {
  min-height: 100vh;
  padding: 2rem;
  background-color: #0f0f0f;
}

.titulo {
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #ffffff;
  text-align: center;
}

.eventos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.evento-card {
  background-color: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  padding: 1.5rem;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.evento-card h2 {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.descripcion {
  color: #888;
  font-size: 0.9rem;
}

.info {
  margin: 0.5rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.9rem;
  color: #ccc;
}

.btn {
  display: inline-block;
  margin-top: 1rem;
  background: #4f46e5;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  text-decoration: none;
  text-align: center;
  font-size: 0.9rem;
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