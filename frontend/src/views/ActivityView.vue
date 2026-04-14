<template>
  <div>
    <h1 class="text-2xl font-semibold text-gray-900">Activité</h1>
    <p class="mt-2 text-sm text-gray-700">
      Consultez l'historique complet de votre activité
    </p>

    <!-- Filter -->
    <div class="mt-6 flex items-center gap-3">
      <select
        v-model="selectedAction"
        class="select select-neutral"
        @change="resetAndLoad"
      >
        <option value="">Toutes les actions</option>
        <option value="LOGIN_SUCCESS">Connexion réussie</option>
        <option value="LOGIN_FAILURE">Échec de connexion</option>
        <option value="LOGOUT">Déconnexion</option>
        <option value="PASSWORD_CHANGE">Changement de mot de passe</option>
        <option value="TOKEN_REFRESH">Rafraîchissement du token</option>
      </select>
    </div>

    <div class="mt-4 bg-white shadow rounded-lg">
      <div class="px-5 py-4 border-b border-gray-200">
        <h2 class="text-base font-semibold text-gray-900">
          Historique d'activité
          <span v-if="total > 0" class="ml-1 text-gray-500 font-normal">({{ total }})</span>
        </h2>
      </div>

      <div v-if="loading" class="p-5 text-center text-sm text-gray-500">
        Chargement...
      </div>

      <ul v-else class="divide-y divide-gray-200">
        <li
          v-for="log in logs"
          :key="log.id"
          class="px-5 py-3 flex items-center justify-between"
        >
          <div class="flex items-center gap-3">
            <span :class="dotClass(log.action)" class="h-2 w-2 rounded-full shrink-0"></span>
            <div>
              <p class="text-sm text-gray-900">{{ formatAction(log.action) }}</p>
              <p v-if="log.city || log.country" class="text-xs text-gray-500">
                {{ [log.city, log.country].filter(Boolean).join(', ') }}
              </p>
              <p v-if="log.ipAddress" class="text-xs text-gray-400">IP: {{ log.ipAddress }}</p>
            </div>
          </div>
          <span class="text-xs text-gray-500 whitespace-nowrap ml-4">
            {{ formatDate(log.createdAt) }}
          </span>
        </li>
        <li v-if="logs.length === 0" class="px-5 py-4 text-sm text-gray-500 text-center">
          Aucune activité trouvée
        </li>
      </ul>

      <!-- Pagination -->
      <div v-if="total > pageSize" class="px-5 py-4 border-t border-gray-200 flex items-center justify-between">
        <p class="text-sm text-gray-500">
          {{ offset + 1 }}–{{ Math.min(offset + pageSize, total) }} sur {{ total }}
        </p>
        <div class="flex gap-2">
          <button
            :disabled="offset === 0"
            class="inline-flex items-center rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            @click="prevPage"
          >
            Précédent
          </button>
          <button
            :disabled="offset + pageSize >= total"
            class="inline-flex items-center rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            @click="nextPage"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { activityApi, type ActivityLog } from '@/services/api/auth.api'

const authStore = useAuthStore()

const logs = ref<ActivityLog[]>([])
const total = ref(0)
const loading = ref(true)
const offset = ref(0)
const pageSize = 20
const selectedAction = ref('')

async function load() {
  const token = authStore.accessToken
  if (!token) return
  loading.value = true
  try {
    const res = await activityApi.getActivityLogs(token, {
      limit: pageSize,
      offset: offset.value,
      action: selectedAction.value || undefined,
    })
    logs.value = res.data
    total.value = res.total
  } catch (error) {
    console.error('Failed to load activity logs:', error)
  } finally {
    loading.value = false
  }
}

function resetAndLoad() {
  offset.value = 0
  load()
}

function prevPage() {
  offset.value = Math.max(0, offset.value - pageSize)
  load()
}

function nextPage() {
  offset.value = offset.value + pageSize
  load()
}

onMounted(load)

const actionLabels: Record<string, string> = {
  LOGIN_SUCCESS: 'Connexion réussie',
  LOGIN_FAILURE: 'Échec de connexion',
  LOGOUT: 'Déconnexion',
  TOKEN_REFRESH: 'Token rafraîchi',
  PASSWORD_CHANGE: 'Mot de passe modifié',
  TWO_FACTOR_ENABLED: 'Authentification à deux facteurs activée',
  TWO_FACTOR_DISABLED: 'Authentification à deux facteurs désactivée',
}

function formatAction(action: string): string {
  return actionLabels[action] || action
}

function dotClass(action: string): string {
  switch (action) {
    case 'LOGIN_SUCCESS': return 'bg-green-500'
    case 'LOGIN_FAILURE': return 'bg-red-500'
    case 'LOGOUT': return 'bg-gray-400'
    case 'PASSWORD_CHANGE': return 'bg-amber-500'
    case 'TOKEN_REFRESH': return 'bg-blue-500'
    default: return 'bg-gray-400'
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return 'À l\'instant'
  if (diffMin < 60) return `Il y a ${diffMin}min`
  if (diffHours < 24) return `Il y a ${diffHours}h`
  if (diffDays < 7) return `Il y a ${diffDays}j`
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>
