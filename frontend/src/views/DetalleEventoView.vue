<template>
  <div class="contenedor">
    <p v-if="cargando" class="estado">Cargando evento...</p>
    <p v-if="error" class="error">{{ error }}</p>
    <div class="tarjeta" v-if="evento">
      <h1>{{ evento.nombre }}</h1>
      <p class="descripcion">{{ evento.descripcion }}</p>
      <div class="info">
        <p><span>📅</span> {{ evento.fecha }}</p>
        <p><span>📍</span> {{ evento.lugar }}</p>
        <p><span>💰</span> ${{ evento.precio }}</p>
        <p><span>🎟️</span> {{ evento.stock_disponible }} disponibles</p>
      </div>
      <div class="acciones">
        <button @click="comprar" class="btn-comprar">Comprar entrada</button>
        <router-link to="/" class="btn-volver">Volver</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../api'

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
.contenedor {
  min-height: 100vh;
  padding: 2rem;
  background-color: #0f0f0f;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tarjeta {
  background-color: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  padding: 2rem;
  max-width: 600px;
  width: 100%;
  color: #ffffff;
}

h1 {
  font-size: 1.8rem;
  margin-bottom: 1rem;
}

.descripcion {
  color: #888;
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
}

.info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.95rem;
  color: #ccc;
  margin-bottom: 2rem;
}

.acciones {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.btn-comprar {
  background: #4f46e5;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
}

.btn-comprar:hover {
  background: #4338ca;
}

.btn-volver {
  color: #888;
  text-decoration: none;
  font-size: 0.9rem;
}

.btn-volver:hover {
  color: #fff;
}
</style>