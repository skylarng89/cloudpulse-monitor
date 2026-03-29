<template>
  <div 
    class="overflow-hidden shadow-sm rounded-lg border-l-4 hover:shadow-md transition-shadow duration-200 cursor-help bg-white dark:bg-gray-800"
    :class="borderClass"
    :title="tooltip"
  >
    <div class="p-5">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <div 
            class="flex items-center justify-center w-12 h-12 rounded-lg"
            :class="iconBgClass"
          >
            <i :class="[iconClass, 'text-white text-2xl']"></i>
          </div>
        </div>
        <div class="ml-5 w-0 flex-1">
          <dl>
            <dt class="text-sm font-medium truncate dark:text-gray-400" :class="labelClass">{{ label }}</dt>
            <dd class="text-3xl font-bold" :class="valueClass">{{ displayValue }}</dd>
          </dl>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type StatsCardVariant = 'primary' | 'success' | 'danger' | 'info'

const props = withDefaults(defineProps<{
  label: string
  value: number | string
  variant?: StatsCardVariant
  icon: string
  tooltip?: string
  suffix?: string
}>(), {
  variant: 'primary',
  tooltip: '',
  suffix: ''
})

const displayValue = computed(() => {
  if (props.value === null || props.value === undefined) return 'N/A'
  return props.suffix ? `${props.value}${props.suffix}` : props.value
})

const borderClass = computed(() => ({
  'border-purple-500': props.variant === 'primary',
  'border-green-500': props.variant === 'success',
  'border-red-500': props.variant === 'danger',
  'border-blue-500': props.variant === 'info'
}))

const iconBgClass = computed(() => ({
  'bg-gradient-to-br from-purple-500 to-purple-600': props.variant === 'primary',
  'bg-gradient-to-br from-green-500 to-green-600': props.variant === 'success',
  'bg-gradient-to-br from-red-500 to-red-600': props.variant === 'danger',
  'bg-gradient-to-br from-blue-500 to-blue-600': props.variant === 'info'
}))

const iconClass = computed(() => `ti ti-${props.icon}`)

const labelClass = computed(() => 'text-gray-500')

const valueClass = computed(() => ({
  'text-gray-900 dark:text-white': props.variant === 'primary' || props.variant === 'info',
  'text-green-600 dark:text-green-400': props.variant === 'success',
  'text-red-600 dark:text-red-400': props.variant === 'danger'
}))
</script>
