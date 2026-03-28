<template>
  <div class="text-center py-12">
    <div class="flex justify-center mb-4">
      <i v-if="icon" class="ti text-6xl" :class="[icon, iconClass]"></i>
      <slot v-else name="icon">
        <i class="ti ti-inbox text-gray-300 dark:text-slate-600 text-6xl"></i>
      </slot>
    </div>
    <h3 class="text-lg font-medium text-gray-900 dark:text-white">{{ title }}</h3>
    <p v-if="description" class="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-sm mx-auto">{{ description }}</p>
    <div v-if="$slots.action" class="mt-6">
      <slot name="action" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description?: string
  icon?: string
  iconClass?: string
}>()
</script>
