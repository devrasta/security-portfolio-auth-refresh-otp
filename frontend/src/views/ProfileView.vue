<template>
  <div>
    <h1 class="text-2xl font-semibold text-gray-900">Profil</h1>
    <p class="mt-2 text-sm text-gray-700">
      Vos informations personnelles
    </p>

    <div class="mt-8">
      <div v-if="loading" class="bg-white shadow rounded-lg p-6 text-sm text-gray-500">
        Chargement...
      </div>

      <div v-else-if="profile" class="bg-white shadow rounded-lg divide-y divide-gray-200">
        <div class="px-6 py-5">
          <h2 class="text-lg font-medium text-gray-900">Informations du compte</h2>
        </div>

        <dl class="divide-y divide-gray-200">
          <div class="px-6 py-4 grid grid-cols-3 gap-4 items-center">
            <dt class="text-sm font-medium text-gray-500">Nom</dt>
            <dd class="col-span-2 text-sm text-gray-900">{{ profile.name || '—' }}</dd>
          </div>

          <div class="px-6 py-4 grid grid-cols-3 gap-4 items-center">
            <dt class="text-sm font-medium text-gray-500">Email</dt>
            <dd class="col-span-2 text-sm text-gray-900">{{ profile.email }}</dd>
          </div>

          <div class="px-6 py-4 grid grid-cols-3 gap-4 items-center">
            <dt class="text-sm font-medium text-gray-500">Authentification 2FA</dt>
            <dd class="col-span-2">
              <span
                :class="profile.twoFactorEnabled
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'"
                class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
              >
                {{ profile.twoFactorEnabled ? 'Activée' : 'Désactivée' }}
              </span>
            </dd>
          </div>

          <div class="px-6 py-4 grid grid-cols-3 gap-4 items-center">
            <dt class="text-sm font-medium text-gray-500">Membre depuis</dt>
            <dd class="col-span-2 text-sm text-gray-900">{{ formatDate(profile.createdAt) }}</dd>
          </div>
        </dl>
      </div>

      <div v-else-if="error" class="bg-white shadow rounded-lg p-6">
        <p class="text-sm text-red-600">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { usersApi, type UserProfile } from '@/services/api/auth.api'

const authStore = useAuthStore()

const profile = ref<UserProfile | null>(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  const token = authStore.accessToken
  if (!token) return
  try {
    profile.value = await usersApi.getProfile(token)
  } catch (e) {
    error.value = 'Impossible de charger le profil.'
  } finally {
    loading.value = false
  }
})

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
</script>
