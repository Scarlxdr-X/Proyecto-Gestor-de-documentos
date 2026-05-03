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
    <slot />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

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
</style>