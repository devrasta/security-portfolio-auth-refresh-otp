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
            :class="totpEnabled
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-600'"
            class="ml-4 shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
          >
            {{ totpEnabled ? 'Activée' : 'Désactivée' }}
          </span>
        </div>

        <!-- Disable 2FA modal -->
        <dialog id="disable-2fa-modal" class="modal">
          <div class="modal-box">
            <h3 class="text-lg font-bold text-gray-900">Désactiver la 2FA</h3>
            <p class="mt-2 text-sm text-gray-600">
              Pour confirmer la désactivation, saisissez le code à 6 chiffres de votre application d'authentification.
            </p>
            <div class="mt-4">
              <label for="disableCode" class="block text-sm font-medium text-gray-700">Code de vérification</label>
              <input
                id="disableCode"
                v-model="disableCode"
                type="text"
                inputmode="numeric"
                pattern="\d{6}"
                maxlength="6"
                autocomplete="one-time-code"
                placeholder="123456"
                class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 font-mono tracking-widest placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                :class="disableCodeError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''"
              />
              <p v-if="disableCodeError" class="mt-1 text-sm text-red-600">{{ disableCodeError }}</p>
            </div>
            <div v-if="disableError" class="mt-3 rounded-md bg-red-50 p-3">
              <p class="text-sm text-red-700">{{ disableError }}</p>
            </div>
            <div class="modal-action mt-6">
              <button
                :disabled="isDisabling"
                class="inline-flex justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                @click="confirmDisable"
              >
                {{ isDisabling ? 'Désactivation…' : 'Je confirme' }}
              </button>
              <form method="dialog">
                <button
                  class="inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  @click="cancelDisable"
                >
                  Annuler
                </button>
              </form>
            </div>
          </div>
          <form method="dialog" class="modal-backdrop">
            <button @click="cancelDisable">close</button>
          </form>
        </dialog>

        <!-- Already enabled -->
        <div v-if="totpEnabled" class="mt-4 space-y-4">
          <div class="rounded-md bg-green-50 p-4">
            <p class="text-sm text-green-700">
              L'authentification à deux facteurs est active sur votre compte.
            </p>
          </div>
          <div>
            <button
              class="inline-flex justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
              @click="openDisableModal"
            >
              Désactiver l'authentification à deux facteurs
            </button>
          </div>
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
              <div class="text-sm text-green-700">
                <p>{{ twoFaSuccess }}</p>

                <div  v-if="tempBackupCodes.length > 0">
                  <h3 class="text-md font-medium text-gray-900 mb-2">Codes de secours temporaires</h3>
                  <h4 class="text-sm text-gray-700">
                    Ces codes de secours sont affichés <b>une seule fois</b> après l'activation de l'authentification à deux facteurs. <br/>
                    Ils vous permettront d'accéder à votre compte si vous perdez l'accès à votre application d'authentification.<br/>
                    <b>Veuillez les sauvegarder dans un endroit sûr.</b>
                  </h4>
                  <p class="text-sm text-gray-700" v-for="code in tempBackupCodes" :key="code">
                    {{ code }}
                  </p>
                </div>
              </div>

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

      <div class="rounded-md bg-green-50 p-4 text-green-700" v-if="tempBackupCodes.length > 0">

                <div >
                  <div class="flex justify-between items-center mb-2">

                  <h3 class="text-md font-medium mb-2">Codes de secours temporaires</h3>

                  <button @click="copyCodes" class="btn-action text-sm">
                    {{ copied ? '✓ Copié' : '📋 Tout copier' }}
                  </button>
                </div>

                  <p class="text-sm text-gray-700" v-for="code in tempBackupCodes" :key="code">
                    {{ code }}
                  </p>
                  <h4 class="text-sm text-gray-500 mt-2">
                    Ces codes de secours sont affichés <b>une seule fois</b>, ils vous permettront d'accéder à votre compte si vous perdez l'accès à votre application d'authentification.<br/>
                    <b>Veuillez les sauvegarder dans un endroit sûr.</b>
                  </h4>
                </div>
              </div>



    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
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
const copied = ref(false);

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

const copyCodes = async () => {
  try {
    await navigator.clipboard.writeText(tempBackupCodes.value.join('\n'));
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};

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
const tempBackupCodes = ref<string[]>([])
const totpEnabled = ref(false)

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
    const { backupCodes } = await twoFactorApi.enable(authStore.accessToken!, totpCode.value)
    authStore.setTwoFactorEnabled(true)
    twoFaSuccess.value = 'Authentification à deux facteurs activée avec succès !'
    qrCode.value = null
    totpCode.value = ''
    tempBackupCodes.value = backupCodes
  } catch (error) {
    twoFaError.value = error instanceof ApiError ? error.message : 'Une erreur est survenue, veuillez réessayer.'
  } finally {
    isEnabling.value = false
  }
}
// ── Disable 2FA ──────────────────────────────────────────
const disableCode = ref('')
const disableCodeError = ref('')
const disableError = ref('')
const isDisabling = ref(false)

function openDisableModal() {
  disableCode.value = ''
  disableCodeError.value = ''
  disableError.value = ''
  const modal = document.getElementById('disable-2fa-modal') as HTMLDialogElement | null
  modal?.showModal()
}

function cancelDisable() {
  disableCode.value = ''
  disableCodeError.value = ''
  disableError.value = ''
}

async function confirmDisable() {
  disableCodeError.value = ''
  disableError.value = ''

  if (!/^\d{6}$/.test(disableCode.value)) {
    disableCodeError.value = 'Le code doit contenir exactement 6 chiffres.'
    return
  }

  isDisabling.value = true
  try {
    await twoFactorApi.disable(authStore.accessToken!, disableCode.value)
    authStore.setTwoFactorEnabled(false)
    totpEnabled.value = false
    const modal = document.getElementById('disable-2fa-modal') as HTMLDialogElement | null
    modal?.close()
  } catch (error) {
    disableError.value = error instanceof ApiError ? error.message : 'Une erreur est survenue, veuillez réessayer.'
  } finally {
    isDisabling.value = false
  }
}

onMounted(() => {
  if (authStore.accessToken) {
    twoFactorApi.status(authStore.accessToken).then(({ isEnabled }) => {
      authStore.setTwoFactorEnabled(isEnabled)
      totpEnabled.value = isEnabled;
    })
  }
})
</script>
