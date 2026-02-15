import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { authApi } from '@/services/api/auth.api'
import { type RegisterCredentials, type LoginCredentials } from '@/services/api/auth.api'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(localStorage.getItem('accessToken'))
  const user = ref<{ id: string; email: string; name?: string } | null>(null)

  const isAuthenticated = computed(() => !!user.value && !!accessToken.value)

  async function init() {
    // Au reload, on tente un refresh via le cookie httpOnly
    // pour obtenir un access token frais + les infos user
    try {
      await refreshToken()
    } catch {
      accessToken.value = null
      localStorage.removeItem('accessToken')
    }
  }

  async function refreshToken() {
    const response = await authApi.refresh()
    accessToken.value = response.accessToken
    user.value = response.user
    localStorage.setItem('accessToken', response.accessToken)
  }

  async function login(loginCredentials: LoginCredentials) {
    const response = await authApi.login(loginCredentials)

    accessToken.value = response.accessToken
    user.value = response.user
    localStorage.setItem('accessToken', response.accessToken)
    return;
  }

  function register(userToCreate: RegisterCredentials) {
    return authApi.register(userToCreate)
  }

  async function logout() {
    await authApi.logout(accessToken.value as string)
    accessToken.value = null
    user.value = null
    localStorage.removeItem('accessToken')
  }

  return { isAuthenticated, accessToken, register, user, login, logout, init }
})
