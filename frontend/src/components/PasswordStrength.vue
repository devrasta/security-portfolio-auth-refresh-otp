<script setup lang="ts">
defineProps<{ strength: number }>()

const labels = ['', 'Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort']
const colors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-400', 'bg-blue-500', 'bg-green-500']
</script>

<template>
  <div class="mt-2 space-y-1">
    <div class="flex gap-1">
      <div
        v-for="i in 4"
        :key="i"
        :class="['h-1.5 flex-1 rounded-full transition-colors duration-300', i <= strength ? colors[strength] : 'bg-gray-200']"
      />
    </div>
    <p v-if="strength > 0" :class="['text-xs', colors[strength]?.replace('bg-', 'text-') || '']">
      {{ labels[strength] }}
    </p>
  </div>
</template>
