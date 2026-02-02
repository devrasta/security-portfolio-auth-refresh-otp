<script setup lang="ts">
import { ref } from 'vue'
import { KeySquare } from 'lucide-vue-next';
import * as v from 'valibot'
import { useSeoMeta } from '@unhead/vue'
import { useAuthStore } from '../stores/auth.store';
import { useRouter } from "vue-router";

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
    await login(result.output)
    router.push('/dashboard');
  } catch (error) {
    resultResponse.value = error as string;
  } finally {
    isSubmitting.value = false
  }
}
</script>
<template>
  <div class="auth-container">
    <div class="auth-header">
      <KeySquare class="dark:stroke-white" :size="40" />
      <h2 class="auth-title">
        Connectez vous au tableau de bord
      </h2>
    </div>

    <div class="form-container">
      <form @submit="handleSubmit" class="space-y-6">
        <div>
          <label for="email" class="form-label">Addresse email</label>
          <div class="mt-2">
            <input
              id="email"
              v-model="form.email"
              type="email"
              name="email"
              autocomplete="email"
              :class="['form-input', errors.email ? 'form-input--error' : 'form-input--valid']"
            />
          </div>
          <p v-if="errors.email" class="form-error">
            {{ errors.email }}
          </p>
        </div>

        <div>
          <div class="flex items-center justify-between">
            <label for="password" class="form-label">Mot de passe</label>
          </div>
          <div class="mt-2">
            <input
              id="password"
              v-model="form.password"
              type="password"
              name="password"
              autocomplete="current-password"
              :class="['form-input', errors.password ? 'form-input--error' : 'form-input--valid']"
            />
          </div>
          <p v-if="errors.password" class="form-error">
            {{ errors.password }}
          </p>
        </div>

        <div>
          <button
            type="submit"
            :disabled="isSubmitting"
            :class="['submit-btn', isSubmitting ? 'submit-btn--loading' : 'submit-btn--active']"
          >
            {{ isSubmitting ? 'Connexion en cours...' : 'Se connecter' }}
          </button>
        </div>
      </form>

      <p class="auth-footer">
        Pas encore de compte?
        <RouterLink to="/register" class="auth-link">Inscrivez vous</RouterLink>
      </p>
    </div>
  </div>
</template>
<style scoped>
@reference "@/assets/base.css";

.auth-container {
  @apply flex min-h-full flex-col justify-center px-6 py-12 mt-6 lg:px-8;
}

.auth-header {
  @apply sm:mx-auto sm:w-full sm:max-w-sm flex items-center flex-col;
}

.auth-title {
  @apply mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900 dark:text-white;
}

.form-container {
  @apply mt-10 sm:mx-auto sm:w-full sm:max-w-sm;
}

.form-label {
  @apply block text-sm/6 font-medium text-gray-900 dark:text-gray-100;
}

.form-input {
  @apply block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500;
}

.form-input--error {
  @apply outline-red-500 focus:outline-red-600 dark:outline-red-500 dark:focus:outline-red-500;
}

.form-input--valid {
  @apply outline-gray-300 focus:outline-indigo-600 dark:focus:outline-indigo-500;
}

.form-error {
  @apply mt-1 text-sm text-red-600 dark:text-red-400;
}

.submit-btn {
  @apply flex w-full justify-center rounded-md px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2;
}

.submit-btn--loading {
  @apply bg-indigo-400 cursor-not-allowed dark:bg-indigo-600;
}

.submit-btn--active {
  @apply bg-indigo-600 hover:bg-indigo-500 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500;
}

.auth-footer {
  @apply mt-10 text-center text-sm/6 text-gray-500 dark:text-gray-400;
}

.auth-link {
  @apply font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300;
}
</style>
