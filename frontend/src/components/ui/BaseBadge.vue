<template>
  <span 
    class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full"
    :class="badgeClass"
  >
    <i v-if="icon" class="ti" :class="icon"></i>
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info' | 'gray'
  icon?: string
}>(), {
  variant: 'default'
})

const badgeClass = computed(() => ({
  default: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300',
  success: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
  error: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
  warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  gray: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
}[props.variant]))
</script>
