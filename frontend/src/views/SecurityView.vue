<template>
  <div>
    <h1 class="text-2xl font-semibold text-gray-900">Security</h1>
    <p class="mt-2 text-sm text-gray-700">
      Gérez vos paramètres de sécurité
    </p>

    <div class="mt-8 space-y-6">
      <!-- Change Password -->
      <div class="bg-white shadow rounded-lg p-6">
        <h2 class="text-lg font-medium text-gray-900">Changer le mot de passe</h2>
        <p class="mt-1 text-sm text-gray-600">
          Mettez à jour votre mot de passe. Il doit contenir au moins 12 caractères,
          une majuscule, une minuscule et un chiffre ou caractère spécial.
        </p>

        <form class="mt-6 space-y-4 max-w-md" @submit.prevent="handleChangePassword">
          <div>
            <label for="currentPassword" class="block text-sm font-medium text-gray-700">Mot de passe actuel</label>
            <div class="mt-1">
              <input
                id="currentPassword"
                v-model="form.currentPassword"
                type="password"
                autocomplete="current-password"
                class="block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                :class="errors.currentPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''"
              />
            </div>
            <p v-if="errors.currentPassword" class="mt-1 text-sm text-red-600">{{ errors.currentPassword }}</p>
          </div>

          <div>
            <label for="newPassword" class="block text-sm font-medium text-gray-700">Nouveau mot de passe</label>
            <div class="mt-1">
              <input
                id="newPassword"
                v-model="form.newPassword"
                type="password"
                autocomplete="new-password"
                class="block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                :class="errors.newPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''"
              />
            </div>
            <PasswordStrength v-if="form.newPassword" :strength="passwordStrength" />
            <p v-if="errors.newPassword" class="mt-1 text-sm text-red-600">{{ errors.newPassword }}</p>
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirmer le nouveau mot de passe</label>
            <div class="mt-1">
              <input
                id="confirmPassword"
                v-model="form.confirmPassword"
                type="password"
                autocomplete="new-password"
                class="block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                :class="errors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''"
              />
            </div>
            <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">{{ errors.confirmPassword }}</p>
          </div>

          <div v-if="successMessage" class="rounded-md bg-green-50 p-3">
            <p class="text-sm text-green-700">{{ successMessage }}</p>
          </div>

          <div v-if="apiError" class="rounded-md bg-red-50 p-3">
            <p class="text-sm text-red-700">{{ apiError }}</p>
          </div>

          <div class="pt-2">
            <button
              type="submit"
              :disabled="isSubmitting"
              class="inline-flex justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isSubmitting ? 'Enregistrement...' : 'Changer le mot de passe' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Two-Factor Authentication -->
      <div class="bg-white shadow rounded-lg p-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-medium text-gray-900">Authentification à deux facteurs</h2>
            <p class="mt-1 text-sm text-gray-600">
              Renforcez la sécurité de votre compte avec une application d'authentification (Google Authenticator, Authy…).
            </p>
          </div>
          <span
            :class="authStore.user?.twoFactorEnabled
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-600'"
            class="ml-4 shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
          >
            {{ authStore.user?.twoFactorEnabled ? 'Activée' : 'Désactivée' }}
          </span>
        </div>

        <!-- Already enabled -->
        <div v-if="authStore.user?.twoFactorEnabled" class="mt-4 rounded-md bg-green-50 p-4">
          <p class="text-sm text-green-700">
            L'authentification à deux facteurs est active sur votre compte.
          </p>
        </div>

        <!-- Setup flow -->
        <div v-else class="mt-6">
          <!-- Step 1: trigger setup -->
          <div v-if="!qrCode">
            <button
              :disabled="isLoadingQr"
              class="inline-flex justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              @click="startSetup"
            >
              {{ isLoadingQr ? 'Chargement…' : 'Configurer la 2FA' }}
            </button>
            <p v-if="setupError" class="mt-2 text-sm text-red-600">{{ setupError }}</p>
          </div>

          <!-- Step 2: scan QR + enter code -->
          <div v-else class="space-y-6 max-w-sm">
            <div>
              <p class="text-sm text-gray-700 mb-3">
                Scannez ce QR code avec votre application d'authentification puis saisissez le code à 6 chiffres pour confirmer.
              </p>
              <img :src="qrCode" alt="QR Code 2FA" class="rounded-md border border-gray-200" />
            </div>

            <div>
              <label for="totpCode" class="block text-sm font-medium text-gray-700">Code de vérification</label>
              <div class="mt-1">
                <input
                  id="totpCode"
                  v-model="totpCode"
                  type="text"
                  inputmode="numeric"
                  pattern="\d{6}"
                  maxlength="6"
                  autocomplete="one-time-code"
                  placeholder="123456"
                  class="block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 font-mono tracking-widest placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  :class="totpError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''"
                />
              </div>
              <p v-if="totpError" class="mt-1 text-sm text-red-600">{{ totpError }}</p>
            </div>

            <div v-if="twoFaSuccess" class="rounded-md bg-green-50 p-3">
              <p class="text-sm text-green-700">{{ twoFaSuccess }}</p>
            </div>
            <div v-if="twoFaError" class="rounded-md bg-red-50 p-3">
              <p class="text-sm text-red-700">{{ twoFaError }}</p>
            </div>

            <div class="flex gap-3">
              <button
                :disabled="isEnabling"
                class="inline-flex justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                @click="confirmEnable"
              >
                {{ isEnabling ? 'Activation…' : 'Activer' }}
              </button>
              <button
                class="inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                @click="cancelSetup"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { authApi, twoFactorApi, ApiError } from '@/services/api/auth.api'
import PasswordStrength from '@/components/PasswordStrength.vue'

const authStore = useAuthStore()

const form = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const errors = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const passwordStrength = ref(0)
const isSubmitting = ref(false)
const successMessage = ref('')
const apiError = ref('')

watch(
  () => form.value.newPassword,
  async (password) => {
    if (!password) {
      passwordStrength.value = 0
      return
    }
    try {
      const { strength } = await authApi.checkPasswordStrength(password)
      passwordStrength.value = strength
    } catch {
      passwordStrength.value = 0
    }
  },
)

function validate(): boolean {
  errors.value = { currentPassword: '', newPassword: '', confirmPassword: '' }

  if (!form.value.currentPassword) {
    errors.value.currentPassword = 'Le mot de passe actuel est requis'
  }

  if (!form.value.newPassword) {
    errors.value.newPassword = 'Le nouveau mot de passe est requis'
  } else if (form.value.newPassword.length < 12) {
    errors.value.newPassword = 'Le mot de passe doit contenir au moins 12 caractères'
  } else if (!/(?=.*\d)|(?=.*\W+)/.test(form.value.newPassword) || !/(?=.*[A-Z])/.test(form.value.newPassword) || !/(?=.*[a-z])/.test(form.value.newPassword)) {
    errors.value.newPassword = 'Le mot de passe doit contenir une majuscule, une minuscule et un chiffre ou caractère spécial'
  }

  if (!form.value.confirmPassword) {
    errors.value.confirmPassword = 'Veuillez confirmer le nouveau mot de passe'
  } else if (form.value.newPassword !== form.value.confirmPassword) {
    errors.value.confirmPassword = 'Les mots de passe ne correspondent pas'
  }

  return !errors.value.currentPassword && !errors.value.newPassword && !errors.value.confirmPassword
}

async function handleChangePassword() {
  successMessage.value = ''
  apiError.value = ''

  if (!validate()) return

  isSubmitting.value = true
  try {
    await authStore.changePassword(form.value.currentPassword, form.value.newPassword)
    successMessage.value = 'Mot de passe modifié avec succès.'
    form.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
    passwordStrength.value = 0
  } catch (error) {
    if (error instanceof ApiError) {
      apiError.value = error.message
    } else {
      apiError.value = 'Une erreur est survenue, veuillez réessayer.'
    }
  } finally {
    isSubmitting.value = false
  }
}

// ── 2FA ──────────────────────────────────────────────────
const qrCode = ref<string | null>(null)
const totpCode = ref('')
const totpError = ref('')
const setupError = ref('')
const twoFaSuccess = ref('')
const twoFaError = ref('')
const isLoadingQr = ref(false)
const isEnabling = ref(false)

async function startSetup() {
  setupError.value = ''
  isLoadingQr.value = true
  try {
    const data = await twoFactorApi.setup(authStore.accessToken!)
    qrCode.value = data.qrCode
  } catch (error) {
    setupError.value = error instanceof ApiError ? error.message : 'Impossible de charger le QR code.'
  } finally {
    isLoadingQr.value = false
  }
}

function cancelSetup() {
  qrCode.value = null
  totpCode.value = ''
  totpError.value = ''
  twoFaError.value = ''
  twoFaSuccess.value = ''
}

async function confirmEnable() {
  totpError.value = ''
  twoFaError.value = ''
  twoFaSuccess.value = ''

  if (!/^\d{6}$/.test(totpCode.value)) {
    totpError.value = 'Le code doit contenir exactement 6 chiffres.'
    return
  }

  isEnabling.value = true
  try {
    await twoFactorApi.enable(authStore.accessToken!, totpCode.value)
    authStore.setTwoFactorEnabled(true)
    twoFaSuccess.value = 'Authentification à deux facteurs activée avec succès !'
    qrCode.value = null
    totpCode.value = ''
  } catch (error) {
    twoFaError.value = error instanceof ApiError ? error.message : 'Une erreur est survenue, veuillez réessayer.'
  } finally {
    isEnabling.value = false
  }
}
</script>
