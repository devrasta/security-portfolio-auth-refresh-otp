import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import Dashboard from '@/views/DashboardView.vue'
import NotFound from '@/views/NotFound.vue'
import { useAuthStore } from '@/stores/auth.store'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/login/totp',
      name: 'login-totp',
      component: () => import('../views/TwoFactorVerifierView.vue'),
    },
    {
      path: '/',
      component: DashboardLayout,
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: Dashboard,
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('../views/ProfileView.vue'),
        },
        {
          path: 'security',
          name: 'security',
          component: () => import('../views/SecurityView.vue'),
        },
        {
          path: 'notifications',
          name: 'notifications',
          component: () => import('../views/NotificationsView.vue'),
        },
        {
          path: 'activity',
          name: 'activity',
          component: () => import('../views/ActivityView.vue'),
        },
      ],
    },
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
  ],
})

let initialized = false

router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  if (!initialized) {
    initialized = true
    if (!authStore.isAuthenticated) {
      await authStore.init()
    } else {
      authStore.init()
    }
  }

  const publicPages = ['/login', '/register', '/', '/about']
  if (!authStore.isAuthenticated && !publicPages.includes(to.path)) {
    return { name: 'login' }
  }
})
export default router
