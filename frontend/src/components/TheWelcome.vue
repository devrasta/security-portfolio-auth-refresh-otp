<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { ShieldCheck } from 'lucide-vue-next';
</script>

<template>
  <div class="bg-white">
    <header class="absolute inset-x-0 top-0 z-50">
      <nav aria-label="Global" class="flex items-center justify-between p-6 lg:px-8">
        <div class="flex lg:flex-1">
          <a href="#" class="-m-1.5 p-1.5 flex items-center gap-2">
            <ShieldCheck :size="20" />
            <span class="text-lg font-semibold text-gray-900">AuthSystem</span>
          </a>
        </div>
        <div class="hidden lg:flex lg:flex-1 lg:justify-end gap-x-6 items-center">
          <RouterLink to="/login" class="text-sm/6 font-semibold text-gray-900 hover:text-indigo-600">
            Se connecter
          </RouterLink>
          <RouterLink to="/register" class="rounded-md bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500">
            Créer un compte
          </RouterLink>
        </div>
      </nav>
    </header>

    <main class="isolate">
      <!-- Hero section -->
      <div class="relative pt-14">
        <div
          aria-hidden="true"
          class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        >
          <div
            style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%);"
            class="relative left-[calc(50%-11rem)] aspect-1155/678 w-144.5 -translate-x-1/2 rotate-30 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-288.75"
          ></div>
        </div>
        <div class="py-24 sm:py-32 lg:pb-40">
          <div class="mx-auto max-w-7xl px-6 lg:px-8">
            <div class="mx-auto max-w-2xl text-center">
              <h1 class="text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl">
                Système d'authentification sécurisé avec 2FA
              </h1>
              <p class="mt-8 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">
                Projet de démonstration d'une architecture d'authentification moderne : JWT, refresh tokens, gestion de sessions et authentification à deux facteurs TOTP.
              </p>
              <div class="mt-10 flex items-center justify-center gap-x-6">
                <RouterLink
                  to="/register"
                  class="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Créer un compte
                </RouterLink>
                <RouterLink to="/login" class="text-sm/6 font-semibold text-gray-900">
                  Se connecter
                </RouterLink>
              </div>
            </div>
            <div class="mt-16 flow-root sm:mt-24">
              <div class="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-gray-900/10 ring-inset lg:-m-4 lg:rounded-2xl lg:p-4">
                <!-- Placeholder pour screenshot de l'app -->
                <div class="w-full h-64 rounded-md bg-linear-to-br from-indigo-50 to-purple-50 flex items-center justify-center text-gray-400 text-sm">
                  <img src="/dashboard_screenshot.png" alt="Screenshot de l'application" class="max-h-full max-w-full object-contain" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Feature section -->
      <div class="mx-auto max-w-7xl px-6 sm:mt-4 lg:px-8">
        <div class="mx-auto max-w-2xl lg:text-center">
          <h2 class="text-base/7 font-semibold text-indigo-600">Sécurité en couches</h2>
          <p class="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl lg:text-balance">
            Toutes les briques d'une auth robuste
          </p>
          <p class="mt-6 text-lg/8 text-gray-700">
            Ce projet explore les bonnes pratiques de sécurité applicative autour de l'authentification : du stockage des tokens à la 2FA, en passant par la gestion des sessions.
          </p>
        </div>
        <div class="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl class="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            <!-- JWT + Refresh tokens -->
            <div class="relative pl-16">
              <dt class="text-base/7 font-semibold text-gray-900">
                <div class="absolute top-0 left-0 flex size-10 items-center justify-center rounded-lg bg-indigo-600">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" class="size-6 text-white">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 0 1 21.75 8.25Z" />
                  </svg>
                </div>
                JWT & Refresh Tokens
              </dt>
              <dd class="mt-2 text-base/7 text-gray-600">
                Access tokens à durée de vie courte, refresh tokens httpOnly en cookie. Rotation automatique et détection de réutilisation suspecte (token theft).
              </dd>
            </div>

            <!-- 2FA TOTP -->
            <div class="relative pl-16">
              <dt class="text-base/7 font-semibold text-gray-900">
                <div class="absolute top-0 left-0 flex size-10 items-center justify-center rounded-lg bg-indigo-600">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" class="size-6 text-white">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 8.25h3" />
                  </svg>
                </div>
                Authentification à deux facteurs (TOTP)
              </dt>
              <dd class="mt-2 text-base/7 text-gray-600">
                Configuration via QR code compatible Google Authenticator ou Authy. Activation, désactivation et codes de secours à usage unique.
              </dd>
            </div>

            <!-- Gestion des sessions -->
            <div class="relative pl-16">
              <dt class="text-base/7 font-semibold text-gray-900">
                <div class="absolute top-0 left-0 flex size-10 items-center justify-center rounded-lg bg-indigo-600">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" class="size-6 text-white">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0H3" />
                  </svg>
                </div>
                Gestion des sessions
              </dt>
              <dd class="mt-2 text-base/7 text-gray-600">
                Visualisation de toutes les sessions actives avec IP et user-agent. Révocation individuelle ou globale depuis le tableau de bord.
              </dd>
            </div>

            <!-- Journalisation -->
            <div class="relative pl-16">
              <dt class="text-base/7 font-semibold text-gray-900">
                <div class="absolute top-0 left-0 flex size-10 items-center justify-center rounded-lg bg-indigo-600">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" class="size-6 text-white">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
                  </svg>
                </div>
                Journal d'activité
              </dt>
              <dd class="mt-2 text-base/7 text-gray-600">
                Traçabilité complète des événements de sécurité : connexions, échecs d'authentification, changements de mot de passe et actions sensibles.
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- CTA section -->
      <div class="relative -z-10 mt-32 px-6 lg:px-8">
        <div
          aria-hidden="true"
          class="absolute inset-x-0 top-1/2 -z-10 flex -translate-y-1/2 transform-gpu justify-center overflow-hidden blur-3xl sm:top-auto sm:right-[calc(50%-6rem)] sm:bottom-0 sm:translate-y-0 sm:justify-end"
        >
          <div
            style="clip-path: polygon(73.6% 48.6%, 91.7% 88.5%, 100% 53.9%, 97.4% 18.1%, 92.5% 15.4%, 75.7% 36.3%, 55.3% 52.8%, 46.5% 50.9%, 45% 37.4%, 50.3% 13.1%, 21.3% 36.2%, 0.1% 0.1%, 5.4% 49.1%, 21.4% 36.4%, 58.9% 100%, 73.6% 48.6%);"
            class="aspect-1108/632 w-277 flex-none bg-linear-to-r from-[#ff80b5] to-[#9089fc] opacity-25"
          ></div>
        </div>
        <div class="mx-auto max-w-2xl text-center">
          <h2 class="text-4xl font-semibold tracking-tight text-balance text-gray-900 sm:text-5xl">
            Explorez le projet et testez les fonctionnalités
          </h2>
          <p class="mx-auto mt-6 max-w-xl text-lg/8 text-pretty text-gray-600">
            Créez un compte, activez la 2FA, inspectez vos sessions et consultez votre journal d'activité depuis le tableau de bord.
          </p>
          <div class="mt-10 flex items-center justify-center gap-x-6">
            <RouterLink
              to="/register"
              class="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Commencer
            </RouterLink>
            <RouterLink to="/login" class="text-sm/6 font-semibold text-gray-900">
              Se connecter
            </RouterLink>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-white mt-32">
      <div class="mx-auto max-w-7xl overflow-hidden px-6 py-12 lg:px-8">
        <p class="text-center text-sm/6 text-gray-500">
          Projet AppSec Walkthrough — Auth System Refresh 2FA
        </p>
      </div>
    </footer>
  </div>
</template>
