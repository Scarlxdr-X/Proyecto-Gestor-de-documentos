import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegistroView from '../views/RegistroView.vue'
import EventosView from '../views/EventosView.vue'
import DetalleEventoView from '../views/DetalleEventoView.vue'
import PerfilView from '../views/PerfilView.vue'
import AdminView from '../views/AdminView.vue'
import ValidarQRView from '../views/ValidarQRView.vue'

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
    },
    {
      path: '/perfil',
      component: PerfilView,
      meta: { requiereAuth: true }
    },
    {
      path: '/admin',
      component: AdminView,
      meta: { requiereAuth: true, requiereAdmin: true }
    },
    {
      path: '/validar-qr',
      component: ValidarQRView,
      meta: { requiereAuth: true, requiereAdmin: true }
    }
  ]
})

router.beforeEach((to) => {
  const token = localStorage.getItem('token')
  const usuario = localStorage.getItem('usuario') ? JSON.parse(localStorage.getItem('usuario')) : null

  if (to.meta.requiereAuth && !token) {
    return '/login'
  }

  if (to.meta.requiereAdmin && usuario?.rol !== 'admin') {
    return '/'
  }
})

export default router