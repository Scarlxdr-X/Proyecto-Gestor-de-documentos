<template>
  <MainLayout>
    <div class="contenedor">
      <div class="perfil-card">
        <div class="perfil-avatar">{{ iniciales }}</div>
        <div class="perfil-info">
          <h1>{{ usuario.nombre }}</h1>
          <p class="perfil-email">{{ usuario.email }}</p>
          <span class="perfil-rol">{{ usuario.rol }}</span>
        </div>
      </div>

      <div class="seccion">
        <h2>Mis Entradas</h2>
        <p v-if="cargando" class="estado">Cargando entradas...</p>
        <p v-if="error" class="error">{{ error }}</p>
        <p v-if="!cargando && entradas.length === 0" class="estado">No has comprado entradas aun</p>
        <div class="entradas-grid" v-if="!cargando && entradas.length > 0">
          <div class="entrada-card" v-for="entrada in entradas" :key="entrada.id">
            <div class="entrada-info">
              <h3>{{ entrada.evento_nombre }}</h3>
              <p>📅 {{ formatearFecha(entrada.fecha) }}</p>
              <p>📍 {{ entrada.lugar }}</p>
              <p class="entrada-fecha-compra">Comprado el {{ formatearFecha(entrada.fecha_compra) }}</p>
              <span class="entrada-estado" :class="entrada.estado">{{ entrada.estado }}</span>
            </div>
            <div class="entrada-qr">
              <img :src="generarQRUrl(entrada.codigo_qr)" :alt="entrada.codigo_qr" />
              <p class="entrada-codigo">{{ entrada.codigo_qr }}</p>
              <a :href="generarQRUrl(entrada.codigo_qr)" :download="`QR-${entrada.evento_nombre}.png`" target="_blank" class="btn-descargar">
                ⬇️ Descargar QR
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '../api'
import { formatearFecha } from '../utils/formato'
import MainLayout from '../layouts/MainLayout.vue'

const entradas = ref([])
const cargando = ref(true)
const error = ref('')

const usuario = computed(() => {
  const data = localStorage.getItem('usuario')
  return data ? JSON.parse(data) : { nombre: '', email: '', rol: '' }
})

const iniciales = computed(() => {
  if (!usuario.value.nombre) return '?'
  return usuario.value.nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
})

const generarQRUrl = (codigo) => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${codigo}`
}

onMounted(async () => {
  try {
    const respuesta = await api.get(`/api/entradas/mis-entradas/${usuario.value.id}`)
    entradas.value = respuesta.data
  } catch (e) {
    error.value = 'Error cargando entradas'
  } finally {
    cargando.value = false
  }
})
</script>

<style scoped>
.contenedor {
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.perfil-card {
  background-color: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.perfil-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #4f46e5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  flex-shrink: 0;
}

.perfil-info {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.perfil-info h1 {
  font-size: 1.5rem;
  margin: 0;
}

.perfil-email {
  color: #888;
  font-size: 0.9rem;
}

.perfil-rol {
  background: #4f46e5;
  color: white;
  padding: 0.2rem 0.7rem;
  border-radius: 20px;
  font-size: 0.75rem;
  width: fit-content;
  text-transform: capitalize;
}

.seccion h2 {
  font-size: 1.3rem;
  margin-bottom: 1.5rem;
  color: #ffffff;
}

.entradas-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.entrada-card {
  background-color: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.entrada-info {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.entrada-info h3 {
  font-size: 1.1rem;
  margin: 0;
}

.entrada-info p {
  color: #ccc;
  font-size: 0.9rem;
}

.entrada-fecha-compra {
  color: #555 !important;
  font-size: 0.8rem !important;
}

.entrada-estado {
  padding: 0.2rem 0.7rem;
  border-radius: 20px;
  font-size: 0.75rem;
  width: fit-content;
}

.entrada-estado.valida {
  background: #064e3b;
  color: #34d399;
}

.entrada-estado.usada {
  background: #3b0764;
  color: #a78bfa;
}

.entrada-qr {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.entrada-qr img {
  width: 120px;
  height: 120px;
  border-radius: 8px;
}

.entrada-codigo {
  font-size: 0.65rem;
  color: #555;
  text-align: center;
  max-width: 120px;
  word-break: break-all;
}

.btn-descargar {
  display: block;
  background: #1a1a2e;
  border: 1px solid #4f46e5;
  color: #a5b4fc;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  text-decoration: none;
  font-size: 0.8rem;
  text-align: center;
  transition: background 0.2s;
}

.btn-descargar:hover {
  background: #4f46e5;
  color: white;
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