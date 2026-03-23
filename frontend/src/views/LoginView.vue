<template>
  <div>
    <h2>Iniciar Sesión</h2>
    <input v-model="email" placeholder="Email" />
    <input v-model="password" type="password" placeholder="Contraseña" />
    <button @click="login">Entrar</button>
    <p>{{ mensaje }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '../api'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const password = ref('')
const mensaje = ref('')

const login = async () => {
  try {
    const respuesta = await api.post('/auth/login', {
      email: email.value,
      password: password.value
    })
    localStorage.setItem('token', respuesta.data.token)
    localStorage.setItem('usuario', JSON.stringify(respuesta.data.usuario))
    router.push('/')
  } catch (error) {
    mensaje.value = error.response?.data?.mensaje || 'Error al iniciar sesión'
  }
}
</script>