<template>
  <MainLayout>
    <div class="contenedor">
      <h1 class="titulo">Validar Entrada QR</h1>

      <div class="validar-card">
        <div class="tabs">
          <button @click="tab = 'codigo'" :class="{ activo: tab === 'codigo' }">Ingresar codigo</button>
          <button @click="tab = 'imagen'" :class="{ activo: tab === 'imagen' }">Subir imagen QR</button>
        </div>

        <!-- Tab codigo -->
        <div v-if="tab === 'codigo'">
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
        </div>

        <!-- Tab imagen -->
        <div v-if="tab === 'imagen'">
          <p class="instruccion">Sube una imagen del codigo QR para validarla</p>
          <div
            class="zona-subida"
            @dragover.prevent
            @drop.prevent="onDrop"
            @click="$refs.inputImagen.click()"
          >
            <input
              ref="inputImagen"
              type="file"
              accept="image/*"
              style="display: none"
              @change="onImagenSeleccionada"
            />
            <div v-if="!imagenPreview">
              <p class="zona-icono">📁</p>
              <p>Haz clic o arrastra una imagen aqui</p>
              <p class="zona-subtitulo">PNG, JPG o WEBP</p>
            </div>
            <img v-if="imagenPreview" :src="imagenPreview" class="imagen-preview" />
          </div>
          <button
            v-if="imagenPreview"
            @click="leerQRImagen"
            class="btn-validar"
            :disabled="validando"
          >
            {{ validando ? 'Leyendo QR...' : 'Leer y Validar QR' }}
          </button>
          <button v-if="imagenPreview" @click="limpiarImagen" class="btn-limpiar">
            Cambiar imagen
          </button>
        </div>

        <!-- Canvas oculto para procesar imagen -->
        <canvas ref="canvas" style="display: none"></canvas>

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

      <!-- Historial -->
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
  </MainLayout>
</template>

<script setup>
import { ref } from 'vue'
import jsQR from 'jsqr'
import api from '../api'
import { formatearFecha } from '../utils/formato'
import MainLayout from '../layouts/MainLayout.vue'

const tab = ref('codigo')
const codigoQR = ref('')
const validando = ref(false)
const resultado = ref(null)
const error = ref('')
const historial = ref([])
const imagenPreview = ref(null)
const imagenFile = ref(null)
const canvas = ref(null)
const inputImagen = ref(null)

const limpiarResultado = () => {
  resultado.value = null
  error.value = ''
}

const limpiarImagen = () => {
  imagenPreview.value = null
  imagenFile.value = null
  limpiarResultado()
}

const onImagenSeleccionada = (e) => {
  const file = e.target.files[0]
  if (!file) return
  imagenFile.value = file
  imagenPreview.value = URL.createObjectURL(file)
  limpiarResultado()
}

const onDrop = (e) => {
  const file = e.dataTransfer.files[0]
  if (!file) return
  imagenFile.value = file
  imagenPreview.value = URL.createObjectURL(file)
  limpiarResultado()
}

const leerQRImagen = () => {
  if (!imagenFile.value) return
  validando.value = true
  error.value = ''
  resultado.value = null

  const img = new Image()
  img.onload = () => {
    const ctx = canvas.value.getContext('2d')
    canvas.value.width = img.width
    canvas.value.height = img.height
    ctx.drawImage(img, 0, 0)
    const imageData = ctx.getImageData(0, 0, img.width, img.height)
    const code = jsQR(imageData.data, imageData.width, imageData.height)

    if (!code) {
      error.value = 'No se pudo leer el codigo QR de la imagen'
      validando.value = false
      return
    }

    codigoQR.value = code.data
    validar()
  }
  img.src = imagenPreview.value
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

.tabs {
  display: flex;
  gap: 0.5rem;
  background: #0f0f0f;
  padding: 0.4rem;
  border-radius: 10px;
}

.tabs button {
  flex: 1;
  background: transparent;
  border: none;
  color: #888;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.tabs button.activo {
  background: #4f46e5;
  color: white;
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

.zona-subida {
  border: 2px dashed #2a2a2a;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  color: #888;
  font-size: 0.9rem;
  transition: border-color 0.2s;
  min-height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.zona-subida:hover {
  border-color: #4f46e5;
}

.zona-icono {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.zona-subtitulo {
  font-size: 0.8rem;
  color: #555;
  margin-top: 0.3rem;
}

.imagen-preview {
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
  object-fit: contain;
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

.btn-limpiar {
  width: 100%;
  background: transparent;
  color: #888;
  border: 1px solid #2a2a2a;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.btn-limpiar:hover {
  color: #ffffff;
  border-color: #888;
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