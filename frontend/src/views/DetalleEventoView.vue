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
            <button @click="abrirModalResumen" class="btn-comprar" :disabled="evento.stock_disponible <= 0">
              {{ evento.stock_disponible <= 0 ? 'Agotado' : 'Comprar entrada' }}
            </button>
            <router-link to="/" class="btn-volver">← Volver</router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal resumen -->
    <div class="modal-overlay" v-if="mostrarResumen" @click.self="cerrarResumen">
      <div class="modal">
        <h2>Resumen de compra</h2>
        <p class="modal-subtitulo">Estas a punto de comprar una entrada para:</p>
        <div class="modal-info" v-if="evento">
          <p><strong>{{ evento.nombre }}</strong></p>
          <p>📅 {{ formatearFecha(evento.fecha) }}</p>
          <p>📍 {{ evento.lugar }}</p>
          <p class="modal-precio">{{ formatearPrecio(evento.precio) }}</p>
        </div>
        <div class="modal-acciones">
          <button @click="procederPago" class="btn-confirmar">Proceder al pago</button>
          <button @click="cerrarResumen" class="btn-cancelar">Cancelar</button>
        </div>
      </div>
    </div>

    <!-- Modal pago -->
    <div class="modal-overlay" v-if="mostrarPago" @click.self="cerrarPago">
      <div class="modal">
        <h2>💳 Datos de pago</h2>
        <p class="modal-subtitulo">Ingresa los datos de tu tarjeta</p>
        <div class="formulario-pago">
          <div class="campo">
            <label>Nombre del titular</label>
            <input v-model="pago.nombre" placeholder="Como aparece en la tarjeta" />
          </div>
          <div class="campo">
            <label>Numero de tarjeta</label>
            <input v-model="pago.numero" placeholder="0000 0000 0000 0000" maxlength="19" @input="formatearNumero" />
          </div>
          <div class="campo-fila">
            <div class="campo">
              <label>Fecha de vencimiento</label>
              <input v-model="pago.vencimiento" placeholder="MM/AA" maxlength="5" @input="formatearVencimiento" />
            </div>
            <div class="campo">
              <label>CVV</label>
              <input v-model="pago.cvv" placeholder="000" maxlength="3" type="password" />
            </div>
          </div>
          <p class="error-pago" v-if="errorPago">{{ errorPago }}</p>
        </div>
        <div class="modal-acciones">
          <button @click="confirmarPago" class="btn-confirmar" :disabled="procesando">
            {{ procesando ? 'Procesando...' : `Pagar ${formatearPrecio(evento?.precio)}` }}
          </button>
          <button @click="cerrarPago" class="btn-cancelar">Cancelar</button>
        </div>
      </div>
    </div>

    <!-- Modal procesando -->
    <div class="modal-overlay" v-if="procesando">
      <div class="modal modal-procesando">
        <div class="spinner"></div>
        <p>Procesando pago...</p>
      </div>
    </div>

    <!-- Modal QR -->
    <div class="modal-overlay" v-if="entradaComprada" @click.self="cerrarQR">
      <div class="modal">
        <h2>Pago exitoso 🎉</h2>
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
const mostrarResumen = ref(false)
const mostrarPago = ref(false)
const procesando = ref(false)
const entradaComprada = ref(null)
const errorPago = ref('')

const pago = ref({
  nombre: '',
  numero: '',
  vencimiento: '',
  cvv: ''
})

const abrirModalResumen = () => mostrarResumen.value = true
const cerrarResumen = () => mostrarResumen.value = false
const cerrarQR = () => entradaComprada.value = null

const procederPago = () => {
  mostrarResumen.value = false
  mostrarPago.value = true
}

const cerrarPago = () => {
  mostrarPago.value = false
  pago.value = { nombre: '', numero: '', vencimiento: '', cvv: '' }
  errorPago.value = ''
}

const formatearNumero = () => {
  let val = pago.value.numero.replace(/\D/g, '')
  val = val.match(/.{1,4}/g)?.join(' ') || val
  pago.value.numero = val
}

const formatearVencimiento = () => {
  let val = pago.value.vencimiento.replace(/\D/g, '')
  if (val.length >= 2) val = val.slice(0, 2) + '/' + val.slice(2)
  pago.value.vencimiento = val
}

const validarPago = () => {
  if (!pago.value.nombre) return 'Ingresa el nombre del titular'
  if (pago.value.numero.replace(/\s/g, '').length < 16) return 'Numero de tarjeta invalido'
  if (pago.value.vencimiento.length < 5) return 'Fecha de vencimiento invalida'
  if (pago.value.cvv.length < 3) return 'CVV invalido'
  return ''
}

const confirmarPago = async () => {
  const error = validarPago()
  if (error) {
    errorPago.value = error
    return
  }

  mostrarPago.value = false
  procesando.value = true

  // Simular procesamiento de pago
  await new Promise(resolve => setTimeout(resolve, 2000))

  try {
    const usuario = JSON.parse(localStorage.getItem('usuario'))
    const respuesta = await api.post('/api/entradas/comprar', {
      evento_id: evento.value.id,
      usuario_id: usuario.id
    })
    entradaComprada.value = respuesta.data.entrada
    evento.value.stock_disponible--
  } catch (e) {
    alert(e.response?.data?.mensaje || 'Error al procesar el pago')
  } finally {
    procesando.value = false
    pago.value = { nombre: '', numero: '', vencimiento: '', cvv: '' }
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

.modal-procesando {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #2a2a2a;
  border-top-color: #4f46e5;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
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

.formulario-pago {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  flex: 1;
}

.campo label {
  font-size: 0.8rem;
  color: #888;
}

.campo input {
  background: #0f0f0f;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  padding: 0.7rem 1rem;
  color: #ffffff;
  font-size: 0.9rem;
  outline: none;
}

.campo input:focus {
  border-color: #4f46e5;
}

.campo-fila {
  display: flex;
  gap: 1rem;
}

.error-pago {
  color: #ff6b6b;
  font-size: 0.85rem;
  text-align: center;
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