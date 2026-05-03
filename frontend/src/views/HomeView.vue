<template>
  <MainLayout>
    <div class="contenedor">
      <h1 class="titulo">Eventos disponibles</h1>
      <p v-if="cargando" class="estado">Cargando eventos...</p>
      <p v-if="error" class="error">{{ error }}</p>
      <div class="eventos-grid" v-if="!cargando && eventos.length > 0">
        <div class="evento-card" v-for="evento in eventos" :key="evento.id">
          <div class="card-imagen">
            <img :src="evento.imagen" :alt="evento.nombre" />
          </div>
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
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'
import { formatearFecha, formatearPrecio } from '../utils/formato'
import MainLayout from '../layouts/MainLayout.vue'

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
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  flex: 1;
  width: 100%;
}

.titulo {
  font-size: 2rem;
  margin-bottom: 2rem;
  text-align: center;
}

.eventos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.evento-card {
  background-color: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: border-color 0.2s;
}

.evento-card:hover {
  border-color: #4f46e5;
}

.card-imagen {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.card-imagen img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.evento-card:hover .card-imagen img {
  transform: scale(1.05);
}

.card-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
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
  padding: 0.8rem 1rem;
  text-decoration: none;
  text-align: center;
  font-size: 0.9rem;
  transition: background 0.2s;
  margin: 1rem 1.5rem 1.5rem;
  border-radius: 8px;
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