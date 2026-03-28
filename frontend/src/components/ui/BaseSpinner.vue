<template>
  <div 
    class="inline-flex items-center justify-center"
    :class="sizeClass"
  >
    <div 
      class="border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin dark:border-indigo-900 dark:border-t-indigo-400"
      :class="spinnerSize"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  size?: 'sm' | 'md' | 'lg'
}>(), {
  size: 'md'
})

const sizeClass = computed(() => ({
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12'
}[props.size]))

const spinnerSize = computed(() => ({
  sm: 'w-5 h-5',
  md: 'w-6 h-6',
  lg: 'w-10 h-10'
}[props.size]))
</script>
