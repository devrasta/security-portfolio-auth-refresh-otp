import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createHead } from '@unhead/vue/client'
import App from './App.vue'
import router from './router'
import { setUnauthorizedHandler } from './services/api/auth.api'
import { useAuthStore } from './stores/auth.store'

const app = createApp(App)
const head = createHead()
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(head)

const authStore = useAuthStore()
setUnauthorizedHandler(() => {
  authStore.handleUnauthorized()
  router.push({ name: 'login' })
})

app.mount('#app')
