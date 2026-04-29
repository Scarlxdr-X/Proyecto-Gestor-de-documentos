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
      <h1 class="titulo">Validar Entrada QR</h1>

      <div class="validar-card">
        <p class="instruccion">Ingresa el codigo QR de la entrada para validarla</p>
        <div class="input-grupo">
          <input
            v-model="codigoQR"
            placeholder="ENTRADA-1-1-1234567890"
            @keyup.enter="validar"
          />
          <button @click="validar" class="btn-validar" :disabled="validando || !codigoQR">
            {{ validando ? 'Validando...' : 'Validar' }}
          </button>
        </div>

        <!-- Resultado valido -->
        <div class="resultado valida" v-if="resultado && resultado.valido">
          <div class="resultado-icono">✅</div>
          <h2>Entrada Valida</h2>
          <div class="resultado-info">
            <p><strong>Evento:</strong> {{ resultado.entrada.evento_nombre }}</p>
            <p><strong>Fecha:</strong> {{ formatearFecha(resultado.entrada.fecha) }}</p>
            <p><strong>Lugar:</strong> {{ resultado.entrada.lugar }}</p>
          </div>
          <p class="resultado-mensaje">La entrada ha sido marcada como usada</p>
        </div>

        <!-- Resultado invalido -->
        <div class="resultado invalida" v-if="resultado && !resultado.valido">
          <div class="resultado-icono">❌</div>
          <h2>Entrada No Valida</h2>
          <p class="resultado-mensaje">{{ resultado.mensaje }}</p>
          <div class="resultado-info" v-if="resultado.entrada">
            <p><strong>Evento:</strong> {{ resultado.entrada.evento_nombre }}</p>
            <p><strong>Estado:</strong> {{ resultado.entrada.estado }}</p>
          </div>
        </div>

        <!-- Error -->
        <div class="resultado invalida" v-if="error">
          <div class="resultado-icono">⚠️</div>
          <h2>Error</h2>
          <p class="resultado-mensaje">{{ error }}</p>
        </div>
      </div>

      <!-- Historial de validaciones -->
      <div class="historial-card" v-if="historial.length > 0">
        <h2>Historial de esta sesion</h2>
        <div class="historial-lista">
          <div class="historial-item" v-for="(item, index) in historial" :key="index" :class="item.valido ? 'valido' : 'invalido'">
            <span class="historial-icono">{{ item.valido ? '✅' : '❌' }}</span>
            <div>
              <p class="historial-evento">{{ item.evento }}</p>
              <p class="historial-codigo">{{ item.codigo }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'
import { formatearFecha } from '../utils/formato'

const router = useRouter()
const codigoQR = ref('')
const validando = ref(false)
const resultado = ref(null)
const error = ref('')
const historial = ref([])

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

const validar = async () => {
  if (!codigoQR.value) return
  validando.value = true
  resultado.value = null
  error.value = ''

  try {
    const respuesta = await api.post('/api/entradas/validar', { codigo_qr: codigoQR.value })
    resultado.value = respuesta.data

    historial.value.unshift({
      valido: respuesta.data.valido,
      evento: respuesta.data.entrada?.evento_nombre || 'Desconocido',
      codigo: codigoQR.value
    })

    codigoQR.value = ''
  } catch (e) {
    if (e.response?.status === 404) {
      resultado.value = { valido: false, mensaje: 'QR no encontrado en el sistema' }
    } else {
      error.value = 'Error al validar la entrada'
    }
  } finally {
    validando.value = false
  }
}
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
  max-width: 700px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.titulo {
  font-size: 1.8rem;
  text-align: center;
}

.validar-card {
  background-color: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.instruccion {
  color: #888;
  font-size: 0.9rem;
  text-align: center;
}

.input-grupo {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input-grupo input {
  width: 100%;
  background: #0f0f0f;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  padding: 0.7rem 1rem;
  color: #ffffff;
  font-size: 0.9rem;
  outline: none;
  box-sizing: border-box;
}

.input-grupo input:focus {
  border-color: #4f46e5;
}

.btn-validar {
  width: 100%;
  background: #4f46e5;
  color: white;
  border: none;
  padding: 0.7rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
}

.btn-validar:hover:not(:disabled) {
  background: #4338ca;
}

.btn-validar:disabled {
  background: #333;
  cursor: not-allowed;
}

.resultado {
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
  text-align: center;
}

.resultado.valida {
  background: #052e16;
  border: 1px solid #166534;
}

.resultado.invalida {
  background: #2d0a0a;
  border: 1px solid #7f1d1d;
}

.resultado-icono {
  font-size: 2.5rem;
}

.resultado h2 {
  font-size: 1.3rem;
}

.resultado-info {
  background: rgba(0,0,0,0.3);
  border-radius: 8px;
  padding: 1rem;
  width: 100%;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-size: 0.9rem;
  color: #ccc;
}

.resultado-mensaje {
  color: #888;
  font-size: 0.85rem;
}

.historial-card {
  background-color: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  padding: 1.5rem;
}

.historial-card h2 {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: #888;
}

.historial-lista {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.historial-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.7rem 1rem;
  border-radius: 8px;
}

.historial-item.valido {
  background: #052e16;
}

.historial-item.invalido {
  background: #2d0a0a;
}

.historial-icono {
  font-size: 1.2rem;
}

.historial-evento {
  font-size: 0.9rem;
  color: #ccc;
}

.historial-codigo {
  font-size: 0.75rem;
  color: #555;
}
</style>