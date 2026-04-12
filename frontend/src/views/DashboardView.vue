<template>
  <div class="space-y-8">
    <div>
      <h1 class="text-2xl font-semibold text-gray-900">
        Bienvenue, {{ userName }}
      </h1>
      <p v-if="lastLogin" class="mt-1 text-sm text-gray-500">
        Last login: {{ formatDate(lastLogin.createdAt) }}
      </p>
    </div>

    <div>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Sessions actives"
          :value="`${sessions.length} session${sessions.length > 1 ? 's' : ''}`"
          color="green"
          :icon="ShieldCheck"
        />
        <StatCard
          label="Nombre de connexions"
          :value="`${loginCount} login${loginCount > 1 ? 's' : ''}`"
          color="amber"
          :icon="Zap"
        />
      </div>
    </div>




    <div class="bg-white shadow rounded-lg">
      <div class="px-5 py-4 border-b border-gray-200">
        <h2 class="text-base font-semibold text-gray-900">
          Sessions actives ({{ sessions.length }})
        </h2>
      </div>
      <div v-if="loading" class="p-5 text-center text-sm text-gray-500">
        Loading...
      </div>
      <ul v-else class="divide-y divide-gray-200">
        <li v-for="session in sessions" :key="session.id" class="px-5 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-start gap-3">
              <div class="shrink-0 mt-0.5">
                <svg v-if="isMobile(session.userAgent)" class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <svg v-else class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">
                  {{ parseUserAgent(session.userAgent) }}
                </p>
                <p v-if="session.ipAddress" class="text-xs text-gray-500 mt-0.5">
                  IP: {{ session.ipAddress }}
                </p>
                <p class="text-xs text-gray-500 mt-0.5">
                  Created: {{ formatDate(session.createdAt) }}
                </p>
              </div>
            </div>
            <button
              @click="revokeSession(session.id)"
              class="text-xs font-medium text-red-600 hover:text-red-800"
            >
              Revoke
            </button>
          </div>
        </li>
        <li v-if="sessions.length === 0" class="px-5 py-4 text-sm text-gray-500 text-center">
          No active sessions
        </li>
      </ul>
    </div>

    <!-- Recent Activity -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-5 py-4 border-b border-gray-200">
        <h2 class="text-base font-semibold text-gray-900">
          Recent Activity
        </h2>
      </div>
      <div v-if="loading" class="p-5 text-center text-sm text-gray-500">
        Loading...
      </div>
      <ul v-else class="divide-y divide-gray-200">
        <li v-for="log in recentActivity" :key="log.id" class="px-5 py-3 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span :class="activityDotClass(log.action)" class="h-2 w-2 rounded-full shrink-0"></span>
            <div>
              <p class="text-sm text-gray-900">{{ formatAction(log.action) }}</p>
              <p v-if="log.city || log.country" class="text-xs text-gray-500">
                {{ [log.city, log.country].filter(Boolean).join(', ') }}
              </p>
            </div>
          </div>
          <span class="text-xs text-gray-500 whitespace-nowrap ml-4">
            {{ formatDate(log.createdAt) }}
          </span>
        </li>
        <li v-if="recentActivity.length === 0" class="px-5 py-4 text-sm text-gray-500 text-center">
          No recent activity
        </li>
      </ul>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import StatCard from '@/components/StatCard.vue'
import { sessionsApi, activityApi, type Session, type ActivityLog } from '@/services/api/auth.api'
import { ShieldCheck, Zap } from 'lucide-vue-next'

const authStore = useAuthStore()

const sessions = ref<Session[]>([])
const recentActivity = ref<ActivityLog[]>([])
const loading = ref(true)
const userName = computed(() => authStore.user?.name || authStore.user?.email)

const lastLogin = computed(() =>
  recentActivity.value.find((log) => log.action === 'LOGIN_SUCCESS'),
)

const loginCount = computed(
  () => recentActivity.value.filter((log) => log.action === 'LOGIN_SUCCESS').length,
)

onMounted(async () => {
  const token = authStore.accessToken
  if (!token) return

  try {
    const [sessionsRes, activityRes] = await Promise.all([
      sessionsApi.getActiveSessions(token),
      activityApi.getRecentActivity(token, 10),
    ])
    sessions.value = sessionsRes.data
    recentActivity.value = activityRes
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
  } finally {
    loading.value = false
  }
})

async function revokeSession(sessionId: string) {
  const token = authStore.accessToken
  if (!token) return

  try {
    await sessionsApi.revokeSession(token, sessionId)
    sessions.value = sessions.value.filter((s) => s.id !== sessionId)
  } catch (error) {
    console.error('Failed to revoke session:', error)
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

function parseUserAgent(ua: string | null): string {
  if (!ua) return 'Unknown device'
  if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome'
  if (ua.includes('Firefox')) return 'Firefox'
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari'
  if (ua.includes('Edg')) return 'Edge'
  if (ua.includes('bruno')) return 'Bruno (API Client)'
  return ua.substring(0, 40)
}

function isMobile(ua: string | null): boolean {
  if (!ua) return false
  return /Mobile|Android|iPhone|iPad/i.test(ua)
}

const actionLabels: Record<string, string> = {
  LOGIN_SUCCESS: 'Successful login',
  LOGIN_FAILURE: 'Failed login attempt',
  LOGOUT: 'Logged out',
  TOKEN_REFRESH: 'Token refreshed',
  PASSWORD_CHANGE: 'Password changed',
}

function formatAction(action: string): string {
  return actionLabels[action] || action
}

function activityDotClass(action: string): string {
  switch (action) {
    case 'LOGIN_SUCCESS':
      return 'bg-green-500'
    case 'LOGIN_FAILURE':
      return 'bg-red-500'
    case 'LOGOUT':
      return 'bg-gray-400'
    case 'PASSWORD_CHANGE':
      return 'bg-amber-500'
    case 'TOKEN_REFRESH':
      return 'bg-blue-500'
    default:
      return 'bg-gray-400'
  }
}
</script>
