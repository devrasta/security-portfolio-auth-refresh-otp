<script setup lang="ts">
import { ref, watch } from 'vue'
import * as v from 'valibot'
import { useAuthStore } from '../stores/auth.store';
import { authApi } from '../services/api/auth.api';
import { useRouter } from "vue-router";
import AuthCard from '../components/AuthCard.vue';
import FormField from '../components/FormField.vue';
import PasswordStrength from '../components/PasswordStrength.vue';

const router = useRouter();
const { register } = useAuthStore()
const registerSchema = v.object({
  name: v.pipe(v.string(), v.minLength(2, 'Le nom doit contenir au moins 2 caractères')),
  email: v.pipe(v.string(), v.email('Adresse email invalide')),
  password: v.pipe(v.string(), v.minLength(8, 'Le mot de passe doit contenir au moins 8 caractères')),
})
const resultResponse = ref<string | null>(null)
const resultStatus = ref<'success' | 'error'>('success')
type RegisterForm = v.InferOutput<typeof registerSchema>

const form = ref<RegisterForm>({
  name: '',
  email: '',
  password: '',
})

const errors = ref<Partial<Record<keyof RegisterForm, string>>>({})
const isSubmitting = ref(false)
const passwordStrength = ref(0)

let debounceTimer: ReturnType<typeof setTimeout> | null = null
watch(() => form.value.password, (password) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  if (!password) { passwordStrength.value = 0; return }
  debounceTimer = setTimeout(async () => {
    const { strength } = await authApi.checkPasswordStrength(password)
    passwordStrength.value = strength
  }, 400)
})

const handleSubmit = async (event: Event) => {
  event.preventDefault()
  errors.value = {}
  resultResponse.value = null
  resultStatus.value = 'success'

  const result = v.safeParse(registerSchema, form.value)

  if (!result.success) {
    for (const issue of result.issues) {
      const field = issue.path?.[0]?.key as keyof RegisterForm | undefined
      if (field && !errors.value[field]) {
        errors.value[field] = issue.message
      }
    }
    return
  }

  isSubmitting.value = true
  try {
    await register(result.output)
    resultStatus.value = 'success'
    resultResponse.value = 'Inscription réussie !';
    setTimeout(() => {
      router.push('/login');
    }, 2000);
  } catch (error) {
    resultStatus.value = 'error'
    resultResponse.value = error instanceof Error ? error.message : 'Une erreur est survenue';
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <AuthCard>
    <template #title>Créez votre compte</template>

    <form @submit="handleSubmit" class="space-y-6">
      <FormField
        id="name"
        label="Nom complet"
        type="text"
        autocomplete="name"
        v-model="form.name"
        :error="errors.name"
      />

      <FormField
        id="email"
        label="Addresse email"
        type="email"
        autocomplete="email"
        v-model="form.email"
        :error="errors.email"
      />
      

      <FormField
        id="password"
        label="Mot de passe"
        type="password"
        autocomplete="new-password"
        v-model="form.password"
        :error="errors.password"
      />
      <PasswordStrength :strength="passwordStrength" />

      <div>
        <button
          type="submit"
          :disabled="isSubmitting"
          :class="['submit-btn', isSubmitting ? 'submit-btn--loading' : 'submit-btn--active']"
        >
          {{ isSubmitting ? 'Inscription en cours...' : "S'inscrire" }}
        </button>
      </div>
    </form>

    <template #footer>
      Vous avez déjà un compte?
      <RouterLink to="/login" class="auth-link">Connectez vous</RouterLink>
    </template>
      <p v-if="resultResponse" :class="['form-error', 'mt-4', 'text-center', resultStatus === 'success' ? 'text-green-500' : 'text-red-500']">
        {{ resultResponse }}
      </p>
  </AuthCard>
</template>
