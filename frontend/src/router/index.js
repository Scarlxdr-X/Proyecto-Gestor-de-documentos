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
      component: HomeView
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
      component: DetalleEventoView
    }
  ]
})

export default router