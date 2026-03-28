<template>
  <div class="w-full">
    <label 
      v-if="label" 
      :for="id"
      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
    >
      {{ label }}
      <span v-if="required" class="text-red-500 ml-0.5">*</span>
    </label>
    <div class="relative">
      <select 
        :id="id"
        :value="modelValue"
        :disabled="disabled"
        :required="required"
        class="w-full px-3 py-2 pr-10 border rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed appearance-none dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:disabled:bg-slate-900"
        :class="error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'"
        @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      >
        <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
        <slot />
      </select>
      <div class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <i class="ti ti-chevron-down text-gray-400"></i>
      </div>
    </div>
    <p v-if="error" class="mt-1.5 text-sm text-red-600 dark:text-red-400">{{ error }}</p>
    <p v-else-if="hint" class="mt-1.5 text-sm text-gray-500 dark:text-gray-400">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  id?: string
  label?: string
  modelValue?: string | number
  placeholder?: string
  error?: string
  hint?: string
  disabled?: boolean
  required?: boolean
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
