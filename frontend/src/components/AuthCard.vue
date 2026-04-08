<template>
  <div class="auth-container">
    <div class="auth-header">
      <KeySquare :size="40" />
      <h2 class="auth-title">
        <slot name="title" />
      </h2>
    </div>

    <div class="form-container">
      <slot />

      <p class="auth-footer">
        <slot name="footer" />
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { KeySquare } from 'lucide-vue-next'
</script>

<style>
@import "@/assets/auth.css";
</style>
