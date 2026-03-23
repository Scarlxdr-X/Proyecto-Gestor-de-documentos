<template>
  <div>
    <h2>Registro</h2>
    <input v-model="nombre" placeholder="Nombre" />
    <input v-model="email" placeholder="Email" />
    <input v-model="password" type="password" placeholder="Contraseña" />
    <button @click="registrar">Registrarse</button>
    <p>{{ mensaje }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '../api'
import { useRouter } from 'vue-router'

const router = useRouter()
const nombre = ref('')
const email = ref('')
const password = ref('')
const mensaje = ref('')

const registrar = async () => {
  try {
    const respuesta = await api.post('/auth/registro', {
      nombre: nombre.value,
      email: email.value,
      password: password.value
    })
    mensaje.value = respuesta.data.mensaje
    router.push('/login')
  } catch (error) {
    mensaje.value = error.response?.data?.mensaje || 'Error al registrarse'
  }
}
</script>