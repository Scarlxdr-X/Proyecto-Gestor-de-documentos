import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegistroView from '../views/RegistroView.vue'
import EventosView from '../views/EventosView.vue'
import DetalleEventoView from '../views/DetalleEventoView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: HomeView,
      meta: { requiereAuth: true }
    },
    {
      path: '/login',
      component: LoginView
    },
    {
      path: '/registro',
      component: RegistroView
    },
    {
      path: '/eventos',
      component: EventosView
    },
    {
      path: '/eventos/:id',
      component: DetalleEventoView,
      meta: { requiereAuth: true }
    }
  ]
})

router.beforeEach((to) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiereAuth && !token) {
    return '/login'
  }
})

export default router