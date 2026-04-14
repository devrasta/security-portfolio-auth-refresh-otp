<script setup lang="ts">
import { ref } from 'vue'
import * as v from 'valibot'
import { useSeoMeta } from '@unhead/vue'
import { useAuthStore } from '../stores/auth.store';
import { useRouter } from "vue-router";
import AuthCard from '../components/AuthCard.vue';
import FormField from '../components/FormField.vue';

const router = useRouter();
const { login } = useAuthStore()

useSeoMeta({
  title: 'Connexion',
  description: 'Page de connexion au tableau de bord',
})
const loginSchema = v.object({
  email: v.pipe(v.string(), v.email('Adresse email invalide')),
  password: v.pipe(v.string(), v.minLength(1, 'Le mot de passe est requis')),
})

type LoginForm = v.InferOutput<typeof loginSchema>

const form = ref<LoginForm>({
  email: '',
  password: '',
})

const errors = ref<Partial<Record<keyof LoginForm, string>>>({})
const isSubmitting = ref(false)

const resultResponse = ref<string | null>(null)
const handleSubmit = async (event: Event) => {
  event.preventDefault()
  errors.value = {}
  resultResponse.value = null

  const result = v.safeParse(loginSchema, form.value)

  if (!result.success) {
    const fieldErrors = v.flatten(result.issues).nested
    errors.value = {
      email: fieldErrors?.email?.[0],
      password: fieldErrors?.password?.[0],
    }
    return
  }

  isSubmitting.value = true
  try {
    const loginResponse = await login(result.output)
    console.log("loginResponse", loginResponse)
    if(loginResponse?.twoFactorRequired) {
      return router.push('/login/totp')
    }
    router.push('/dashboard');
  } catch (error) {
    resultResponse.value = error instanceof Error ? error.message : 'Une erreur est survenue';
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <AuthCard>
    <template #title>Connectez vous au tableau de bord</template>

    <form @submit="handleSubmit" class="space-y-6">
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
        autocomplete="current-password"
        v-model="form.password"
        :error="errors.password"
      />

        <button
          type="submit"
          :disabled="isSubmitting"
          :class="['submit-btn', isSubmitting ? 'submit-btn--loading' : 'submit-btn--active']"
        >
          {{ isSubmitting ? 'Connexion en cours...' : 'Se connecter' }}
        </button>
    </form>

    <p v-if="resultResponse" class="form-error mt-4 text-center">
      {{ resultResponse }}
    </p>

    <template #footer>
      Pas encore de compte?
      <RouterLink to="/register" class="auth-link">Inscrivez vous</RouterLink>
    </template>
  </AuthCard>
</template>
