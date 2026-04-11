<template>
  <el-dialog>
    <dialog id="sidebar" class="backdrop:bg-transparent lg:hidden">
      <el-dialog-backdrop
        class="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-closed:opacity-0"
      ></el-dialog-backdrop>

      <div tabindex="0" class="fixed inset-0 flex focus:outline-none">
        <el-dialog-panel
          class="group/dialog-panel relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-closed:-translate-x-full"
        >
          <div
            class="absolute top-0 left-full flex w-16 justify-center pt-5 duration-300 ease-in-out group-data-closed/dialog-panel:opacity-0"
          >
            <button type="button" command="close" commandfor="sidebar" class="-m-2.5 p-2.5">
              <span class="sr-only">Close sidebar</span>
              <X class="size-6 text-white" aria-hidden="true" />
            </button>
          </div>

          <!-- Sidebar component, swap this element with another sidebar if you like -->
          <div
            class="relative flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4"
          >
            <div class="relative flex h-16 shrink-0 items-center">
              <img
                src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                alt="Your Company"
                class="h-8 w-auto"
              />
            </div>
            <nav class="relative flex flex-1 flex-col">
              <ul role="list" class="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" class="-mx-2 space-y-1">
                    <li>
                      <RouterLink
                        to="/dashboard"
                        class="group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold"
                        :class="
                          $route.path === '/dashboard'
                            ? 'bg-gray-50 text-indigo-600'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
                        "
                      >
                        <House
                          aria-hidden="true"
                          class="size-6 shrink-0"
                          :class="
                            $route.path === '/dashboard'
                              ? 'text-indigo-600'
                              : 'text-gray-400 group-hover:text-indigo-600'
                          "
                        />
                        Dashboard
                      </RouterLink>
                    </li>
                    <li>
                      <RouterLink
                        to="/profile"
                        class="group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                      >
                        <Users aria-hidden="true" class="size-6 shrink-0 text-gray-400 group-hover:text-indigo-600" />
                        Profile
                      </RouterLink>
                    </li>
                    <li>
                      <RouterLink
                        to="/security"
                        class="group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                      >
                        <ShieldCheck aria-hidden="true" class="size-6 shrink-0 text-gray-400 group-hover:text-indigo-600" />
                        Security
                      </RouterLink>
                    </li>
                    <li>
                      <RouterLink
                        to="/notifications"
                        class="group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                      >
                        <Bell aria-hidden="true" class="size-6 shrink-0 text-gray-400 group-hover:text-indigo-600" />
                        Notifications
                      </RouterLink>
                    </li>
                    <li>
                      <RouterLink
                        to="/activity"
                        class="group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                      >
                        <ClipboardList aria-hidden="true" class="size-6 shrink-0 text-gray-400 group-hover:text-indigo-600" />
                        Activity
                      </RouterLink>
                    </li>
                  </ul>
                </li>

                <li class="mt-auto">
                  <p
                    @click="handleLogout"
                    class="group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                  >
                    <LogOut aria-hidden="true" class="size-6 shrink-0 text-gray-400 group-hover:text-indigo-600" />
                    Déconnexion
                  </p>
                </li>
              </ul>
            </nav>
          </div>
        </el-dialog-panel>
      </div>
    </dialog>
  </el-dialog>

  <!-- Static sidebar for desktop -->
  <div class="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
    <!-- Sidebar component, swap this element with another sidebar if you like -->
    <div
      class="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4"
    >
      <div class="flex h-16 shrink-0 items-center">
        <img
          src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
          alt="Your Company"
          class="h-8 w-auto"
        />
      </div>
      <nav class="flex flex-1 flex-col">
        <ul role="list" class="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" class="-mx-2 space-y-1">
              <li>
                <RouterLink
                  to="/dashboard"
                  class="group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold"
                  :class="
                    $route.path === '/dashboard'
                      ? 'bg-gray-50 text-indigo-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
                  "
                >
                  <House
                    aria-hidden="true"
                    class="size-6 shrink-0"
                    :class="
                      $route.path === '/dashboard'
                        ? 'text-indigo-600'
                        : 'text-gray-400 group-hover:text-indigo-600'
                    "
                  />
                  Dashboard
                </RouterLink>
              </li>
              <li>
                <RouterLink
                  to="/profile"
                  class="group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                >
                  <Users aria-hidden="true" class="size-6 shrink-0 text-gray-400 group-hover:text-indigo-600" />
                  Profile
                </RouterLink>
              </li>
              <li>
                <RouterLink
                  to="/security"
                  class="group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                >
                  <ShieldCheck aria-hidden="true" class="size-6 shrink-0 text-gray-400 group-hover:text-indigo-600" />
                  Security
                </RouterLink>
              </li>
              <li>
                <RouterLink
                  to="/notifications"
                  class="group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                >
                  <Bell aria-hidden="true" class="size-6 shrink-0 text-gray-400 group-hover:text-indigo-600" />
                  Notifications
                </RouterLink>
              </li>
              <li>
                <RouterLink
                  to="/activity"
                  class="group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                >
                  <ClipboardList aria-hidden="true" class="size-6 shrink-0 text-gray-400 group-hover:text-indigo-600" />
                  Activity
                </RouterLink>
              </li>
            </ul>
          </li>

          <li class="mt-auto">
            <p
              @click="handleLogout"
              class="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
            >
              <LogOut aria-hidden="true" class="size-6 shrink-0 text-gray-400 group-hover:text-indigo-600" />
              Déconnexion
            </p>
          </li>
        </ul>
      </nav>
    </div>
  </div>

  <div class="lg:pl-72 bg-gray-50 min-h-screen">
    <div
      class="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-xs sm:gap-x-6 sm:px-6 lg:px-8"
    >
      <button
        type="button"
        command="show-modal"
        commandfor="sidebar"
        class="-m-2.5 p-2.5 text-gray-700 hover:text-gray-900 lg:hidden"
      >
        <span class="sr-only">Open sidebar</span>
        <Menu aria-hidden="true" class="size-6" />
      </button>

      <!-- Separator -->
      <div aria-hidden="true" class="h-6 w-px bg-gray-200 lg:hidden"></div>

      <div class="flex flex-1 gap-x-4 justify-end lg:gap-x-6">
        <div class="flex items-center gap-x-4 lg:gap-x-6">


          <!-- Separator -->
          <div
            aria-hidden="true"
            class="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200"
          ></div>

          <RouterLink to="/profile" class="relative flex items-center">
            <span class="hidden lg:flex lg:items-center">
              <span
                aria-hidden="true"
                class="ml-4 text-sm/6 font-semibold text-gray-900"
                >{{ user?.name }}</span
              >
            </span>
          </RouterLink>
        </div>
      </div>
    </div>

    <main class="py-10">
      <div class="px-4 sm:px-6 lg:px-8">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterView, RouterLink, useRouter } from 'vue-router'
import { X, House, Users, ShieldCheck, Bell, ClipboardList, LogOut, Menu } from 'lucide-vue-next'

import { useAuthStore } from '@/stores/auth.store'

const { logout, user } = useAuthStore()
const router = useRouter()

async function handleLogout() {
  await logout()
  router.push('/login')
}
</script>
