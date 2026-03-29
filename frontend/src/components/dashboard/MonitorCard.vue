<template>
  <div
    class="relative border rounded-lg p-5 hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-800"
    :class="cardClasses"
  >
    <div 
      v-if="isChecking"
      class="absolute inset-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-[2px] rounded-lg flex items-center justify-center z-10"
    >
      <div class="flex flex-col items-center gap-2">
        <div class="w-8 h-8 border-3 border-purple-200 dark:border-purple-800 border-t-purple-600 rounded-full animate-spin"></div>
        <span class="text-xs font-medium text-purple-700 dark:text-purple-300">Checking...</span>
      </div>
    </div>
    
    <div class="flex items-start justify-between mb-3">
      <div class="flex items-center gap-2">
        <i :class="[statusIconClass, 'text-xl']"></i>
        <h3 class="text-base font-semibold text-gray-900 dark:text-white">{{ monitor.name }}</h3>
      </div>
      <span 
        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase cursor-help"
        :class="badgeClasses"
        :title="statusTooltip"
      >
        {{ monitor.status || 'unknown' }}
      </span>
    </div>

    <div class="flex items-center gap-2 mb-3 text-sm text-gray-600 dark:text-gray-400">
      <i class="ti ti-link text-gray-400 dark:text-gray-500 flex-shrink-0"></i>
      <span class="truncate font-mono text-xs">{{ monitor.url }}</span>
    </div>

    <div class="flex items-center gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
      <div 
        v-if="monitor.responseTime" 
        class="flex items-center gap-1 cursor-help"
        :title="responseTimeTooltip"
      >
        <i class="ti ti-clock text-gray-400 dark:text-gray-500"></i>
        <span>{{ monitor.responseTime }}ms</span>
      </div>
      <div 
        class="flex items-center gap-1 cursor-help"
        :title="'Last checked: ' + lastCheckFormatted"
      >
        <i class="ti ti-calendar-time text-gray-400 dark:text-gray-500"></i>
        <span>{{ lastCheckDisplay }}</span>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <button 
        @click="$emit('check')"
        class="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-purple-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
        title="Run check now"
      >
        <i class="ti ti-refresh text-sm"></i>
        Check Now
      </button>
      <router-link 
        to="/monitors"
        class="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
        title="Edit monitor settings"
      >
        <i class="ti ti-edit text-sm"></i>
        Edit
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatDateTime, formatRelativeTime } from '@/composables/useTimeFormat'

type MonitorStatus = 'up' | 'down' | 'error' | 'unknown'

interface Monitor {
  id: number
  name: string
  url: string
  type: string
  status?: MonitorStatus
  responseTime?: number | null
  lastCheck?: string | null
}

const props = defineProps<{
  monitor: Monitor
  isChecking: boolean
}>()

defineEmits<{
  (e: 'check'): void
}>()

const cardClasses = computed(() => {
  if (props.isChecking) {
    return 'border-l-4 border-l-purple-500 bg-purple-50/30 dark:bg-purple-900/10 animate-pulse border-gray-200 dark:border-gray-700'
  }
  switch (props.monitor.status) {
    case 'up':
      return 'border-l-4 border-l-green-500 bg-green-50/30 dark:bg-green-900/10 border-gray-200 dark:border-gray-700'
    case 'down':
      return 'border-l-4 border-l-red-500 bg-red-50/30 dark:bg-red-900/10 border-gray-200 dark:border-gray-700'
    case 'error':
      return 'border-l-4 border-l-yellow-500 bg-yellow-50/30 dark:bg-yellow-900/10 border-gray-200 dark:border-gray-700'
    default:
      return 'border-gray-200 dark:border-gray-700'
  }
})

const statusIconClass = computed(() => {
  switch (props.monitor.status) {
    case 'up':
      return 'ti ti-circle-check text-green-600 dark:text-green-400'
    case 'down':
      return 'ti ti-circle-x text-red-600 dark:text-red-400'
    case 'error':
      return 'ti ti-alert-triangle text-yellow-600 dark:text-yellow-400'
    default:
      return 'ti ti-help-circle text-gray-400 dark:text-gray-500'
  }
})

const badgeClasses = computed(() => {
  switch (props.monitor.status) {
    case 'up':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    case 'down':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    case 'error':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }
})

const statusTooltip = computed(() => {
  switch (props.monitor.status) {
    case 'up':
      return 'Monitor is responding successfully and all checks are passing'
    case 'down':
      return 'Monitor is not responding or connection failed'
    case 'error':
      return 'An error occurred while checking this monitor'
    default:
      return 'No check data available yet. Click "Check Now" to test.'
  }
})

const responseTimeTooltip = computed(() => {
  const rt = props.monitor.responseTime
  if (rt === null || rt === undefined) return ''
  if (rt < 100) return `${rt}ms - Excellent! Very fast response time.`
  if (rt < 300) return `${rt}ms - Good response time. Your service is performing well.`
  if (rt < 1000) return `${rt}ms - Acceptable response time. Consider optimization if this persists.`
  if (rt < 3000) return `${rt}ms - Slow response time. Users may experience delays.`
  return `${rt}ms - Very slow! This needs immediate attention.`
})

const lastCheckFormatted = computed(() => {
  if (!props.monitor.lastCheck) return 'Never'
  try {
    return formatDateTime(props.monitor.lastCheck)
  } catch {
    return 'Invalid Date'
  }
})

const lastCheckDisplay = computed(() => {
  if (!props.monitor.lastCheck) return 'Never'
  try {
    return formatRelativeTime(props.monitor.lastCheck)
  } catch {
    return 'Invalid Date'
  }
})
</script>
