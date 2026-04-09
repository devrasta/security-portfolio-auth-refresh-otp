import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { authApi } from '@/services/api/auth.api'
import { type RegisterCredentials, type LoginCredentials } from '@/services/api/auth.api'

type AuthUser = { id: string; email: string; name?: string; twoFactorEnabled: boolean }

function loadUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(localStorage.getItem('accessToken'))
  const user = ref<AuthUser | null>(loadUser())

  const isAuthenticated = computed(() => !!user.value && !!accessToken.value)

  async function init() {
    try {
      await refreshToken()
    } catch {
      if (!user.value) {
        accessToken.value = null
        localStorage.removeItem('accessToken')
        localStorage.removeItem('user')
      }
    }
  }

  function handleUnauthorized() {
    accessToken.value = null
    user.value = null
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
  }

  async function refreshToken() {
    const response = await authApi.refresh()
    accessToken.value = response.accessToken
    user.value = response.user
    localStorage.setItem('accessToken', response.accessToken)
    localStorage.setItem('user', JSON.stringify(response.user))
  }

  async function login(loginCredentials: LoginCredentials) {
    const response = await authApi.login(loginCredentials)
    accessToken.value = response.accessToken
    user.value = response.user
    localStorage.setItem('accessToken', response.accessToken)
    localStorage.setItem('user', JSON.stringify(response.user))
  }

  function register(userToCreate: RegisterCredentials) {
    return authApi.register(userToCreate)
  }

  async function logout() {
    await authApi.logout(accessToken.value as string)
    accessToken.value = null
    user.value = null
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
  }

  return { isAuthenticated, accessToken, register, user, login, logout, init, handleUnauthorized }
})
