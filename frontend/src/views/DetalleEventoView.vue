<template>
  <MainLayout>
    <div class="contenedor">
      <p v-if="cargando" class="estado">Cargando evento...</p>
      <p v-if="error" class="error">{{ error }}</p>
      <div class="tarjeta" v-if="evento">
        <img :src="evento.imagen" :alt="evento.nombre" class="evento-imagen" />
        <div class="evento-contenido">
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
            <button @click="abrirModal" class="btn-comprar" :disabled="evento.stock_disponible <= 0">
              {{ evento.stock_disponible <= 0 ? 'Agotado' : 'Comprar entrada' }}
            </button>
            <router-link to="/" class="btn-volver">← Volver</router-link>
          </div>
        </div>
      </div>
    </div>

    <div class="modal-overlay" v-if="mostrarModal" @click.self="cerrarModal">
      <div class="modal">
        <h2>Confirmar compra</h2>
        <p class="modal-subtitulo">Estas a punto de comprar una entrada para:</p>
        <div class="modal-info" v-if="evento">
          <p><strong>{{ evento.nombre }}</strong></p>
          <p>📅 {{ formatearFecha(evento.fecha) }}</p>
          <p>📍 {{ evento.lugar }}</p>
          <p class="modal-precio">{{ formatearPrecio(evento.precio) }}</p>
        </div>
        <div class="modal-acciones">
          <button @click="confirmarCompra" class="btn-confirmar" :disabled="comprando">
            {{ comprando ? 'Procesando...' : 'Confirmar compra' }}
          </button>
          <button @click="cerrarModal" class="btn-cancelar">Cancelar</button>
        </div>
      </div>
    </div>

    <div class="modal-overlay" v-if="entradaComprada" @click.self="cerrarQR">
      <div class="modal">
        <h2>Compra exitosa 🎉</h2>
        <p class="modal-subtitulo">Guarda tu codigo QR para ingresar al evento</p>
        <div class="qr-contenedor">
          <img :src="entradaComprada.qr_imagen" alt="Codigo QR" class="qr-imagen" />
        </div>
        <p class="qr-codigo">{{ entradaComprada.codigo_qr }}</p>
        <div class="modal-acciones">
          <router-link to="/" class="btn-confirmar">Volver al inicio</router-link>
          <button @click="cerrarQR" class="btn-cancelar">Cerrar</button>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../api'
import { formatearFecha, formatearPrecio } from '../utils/formato'
import MainLayout from '../layouts/MainLayout.vue'

const route = useRoute()
const evento = ref(null)
const cargando = ref(true)
const error = ref('')
const mostrarModal = ref(false)
const comprando = ref(false)
const entradaComprada = ref(null)

const abrirModal = () => mostrarModal.value = true
const cerrarModal = () => mostrarModal.value = false
const cerrarQR = () => entradaComprada.value = null

const confirmarCompra = async () => {
  comprando.value = true
  try {
    const usuario = JSON.parse(localStorage.getItem('usuario'))
    const respuesta = await api.post('/api/entradas/comprar', {
      evento_id: evento.value.id,
      usuario_id: usuario.id
    })
    entradaComprada.value = respuesta.data.entrada
    mostrarModal.value = false
    evento.value.stock_disponible--
  } catch (e) {
    alert(e.response?.data?.mensaje || 'Error al comprar entrada')
  } finally {
    comprando.value = false
  }
}

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
</script>

<style scoped>
.contenedor {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.tarjeta {
  background-color: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  overflow: hidden;
}

.evento-imagen {
  width: 100%;
  height: 300px;
  object-fit: cover;
}

.evento-contenido {
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

.btn-comprar:hover:not(:disabled) {
  background: #4338ca;
}

.btn-comprar:disabled {
  background: #333;
  cursor: not-allowed;
  color: #666;
}

.btn-volver {
  color: #888;
  text-decoration: none;
  font-size: 0.9rem;
}

.btn-volver:hover {
  color: #ffffff;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.modal {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  padding: 2rem;
  max-width: 420px;
  width: 90%;
}

.modal h2 {
  font-size: 1.4rem;
  margin-bottom: 0.5rem;
}

.modal-subtitulo {
  color: #888;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.modal-info {
  background: #0f0f0f;
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-size: 0.9rem;
  color: #ccc;
}

.modal-precio {
  font-size: 1.2rem;
  font-weight: bold;
  color: #4f46e5;
  margin-top: 0.5rem;
}

.modal-acciones {
  display: flex;
  gap: 1rem;
}

.btn-confirmar {
  background: #4f46e5;
  color: white;
  border: none;
  padding: 0.7rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  text-decoration: none;
  text-align: center;
  flex: 1;
}

.btn-confirmar:hover:not(:disabled) {
  background: #4338ca;
}

.btn-confirmar:disabled {
  background: #333;
  cursor: not-allowed;
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

.qr-contenedor {
  display: flex;
  justify-content: center;
  margin: 1.5rem 0;
}

.qr-imagen {
  width: 200px;
  height: 200px;
  border-radius: 8px;
}

.qr-codigo {
  text-align: center;
  font-size: 0.75rem;
  color: #555;
  margin-bottom: 1.5rem;
  word-break: break-all;
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