<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useSeoMeta } from '@unhead/vue'


useSeoMeta({
  title: 'Secure auth app',
  description: 'secure authentication system with Vue.js and Nest.js',
})
</script>

<template>
  <header></header>

  <RouterView />
</template>

<style scoped></style>
