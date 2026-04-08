<template>
  <main class="relative isolate min-h-screen py-40">
    <img
      src="/rich_forest.jpg"
      alt=""
      class="absolute inset-0 -z-10 size-full object-cover object-top"
    />
    <div
      class="mx-auto max-w-2xl px-6 text-center sm:py-20 lg:px-8 border-2 backdrop-brightness-50 md:py-32"
    >
      <p class="text-8xl font-semibold text-white">404</p>
      <h1 class="mt-4 text-5xl font-semibold tracking-tight text-balance text-white sm:text-7xl">
        Page introuvable
      </h1>
      <div class="mt-10 flex justify-center text-gray-300 underline">
        <RouterLink to="/"> Retour à l'accueil </RouterLink>
      </div>
    </div>
  </main>
</template>
