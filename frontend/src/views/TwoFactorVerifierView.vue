<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as v from 'valibot'
import { useSeoMeta } from '@unhead/vue'
import { useAuthStore } from '../stores/auth.store'
import { useRouter } from 'vue-router'
import { twoFactorApi } from '../services/api/auth.api'
import AuthCard from '../components/AuthCard.vue'

const router = useRouter()
const authStore = useAuthStore()

useSeoMeta({
  title: 'Valider la double authentification',
  description: 'Validez la double authentification avec votre Authenticator',
})

const totpSchema = v.object({
  code: v.pipe(
    v.string(),
    v.regex(/^\d{6}$/, 'Le code doit contenir exactement 6 chiffres'),
  ),
})

type TotpForm = v.InferOutput<typeof totpSchema>

const qrCode = ref<string | null>(null)
const secret = ref<string | null>(null)
const form = ref<TotpForm>({ code: '' })
const codeError = ref<string | undefined>(undefined)
const isLoadingQr = ref(true)
const isSubmitting = ref(false)
const resultResponse = ref<string | null>(null)
const successMessage = ref<string | null>(null)

// onMounted(async () => {
//   try {
//     const data = await twoFactorApi.setup(authStore.accessToken as string)
//     qrCode.value = data.qrCode
//     secret.value = data.secret
//   } catch (error) {
//     resultResponse.value = error instanceof Error ? error.message : 'Impossible de charger le QR code'
//   } finally {
//     isLoadingQr.value = false
//   }
// })

const handleSubmit = async (event: Event) => {
  event.preventDefault()
  // codeError.value = undefined
  // resultResponse.value = null
  // successMessage.value = null

  // const result = v.safeParse(totpSchema, form.value)
  // if (!result.success) {
  //   codeError.value = v.flatten(result.issues).nested?.code?.[0]
  //   return
  // }

  // isSubmitting.value = true
  // try {
  //   await twoFactorApi.enable(authStore.accessToken as string, result.output.code)
  //   successMessage.value = 'Double authentification activée avec succès !'
  //   setTimeout(() => router.push('/security'), 2000)
  // } catch (error) {
  //   resultResponse.value = error instanceof Error ? error.message : 'Une erreur est survenue'
  // } finally {
  //   isSubmitting.value = false
  // }
}
</script>

<template>
  <AuthCard>
    <template #title>Double authentification</template>

    <div class="space-y-6">
      <p class="text-sm text-gray-400 text-center">
        Saisissez le code à 6 chiffres affiché sur votre application d'authentification
      </p>

      <form @submit="handleSubmit" class="space-y-4">
        <div>
          <label for="totp-code" class="form-label">Code de vérification</label>
          <div class="mt-2">
            <input
              id="totp-code"
              v-model="form.code"
              type="text"
              inputmode="numeric"
              pattern="\d{6}"
              maxlength="6"
              autocomplete="one-time-code"
              placeholder="123456"
              :class="['form-input text-center text-xl tracking-[0.5em] font-mono', codeError ? 'form-input--error' : 'form-input--valid']"
            />
          </div>
          <p v-if="codeError" class="form-error">{{ codeError }}</p>
        </div>

        <button
          type="submit"
          :disabled="isSubmitting || isLoadingQr"
          :class="['submit-btn', (isSubmitting || isLoadingQr) ? 'submit-btn--loading' : 'submit-btn--active']"
        >
          {{ isSubmitting ? 'Vérification...' : 'Valider le code' }}
        </button>
      </form>

      <p v-if="successMessage" class="text-sm text-green-400 text-center">
        {{ successMessage }}
      </p>

      <p v-if="resultResponse" class="form-error text-center">
        {{ resultResponse }}
      </p>
    </div>
  </AuthCard>
</template>
