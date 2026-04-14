<template>
  <div class="bg-white shadow rounded-lg p-5">
    <div class="flex items-center justify-between">
      <div class="flex items-center">
        <div :class="`shrink-0 rounded-md bg-${color}-50 p-3`">
          <component :is="icon" :class="`h-6 w-6 text-${color}-600`" :stroke-width="2" />
        </div>
        <div class="ml-4">
          <p class="text-sm font-medium text-gray-500">{{ label }}</p>
          <p class="text-lg font-semibold text-gray-900">{{ value }}</p>
        </div>
      </div>
      <div v-if="$slots.action" class="ml-4 shrink-0">
        <slot name="action" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  label: string
  value: string
  color: string
  icon: Component
}>()
</script>
