<template>
  <div>
    <label :for="id" class="form-label">{{ label }}</label>
    <div class="mt-2">
      <input
        :id="id"
        :value="modelValue"
        :type="type"
        :name="id"
        :autocomplete="autocomplete"
        :class="['form-input', error ? 'form-input--error' : 'form-input--valid']"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
    </div>
    <p v-if="error" class="form-error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  id: string
  label: string
  type?: string
  modelValue: string
  error?: string
  autocomplete?: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
