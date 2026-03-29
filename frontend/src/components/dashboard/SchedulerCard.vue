<template>
  <div
    v-if="status"
    class="shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
  >
    <div class="px-6 py-5">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <i class="ti ti-robot text-purple-600 dark:text-purple-400 text-2xl"></i>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">Scheduler Status</h3>
        </div>
        <span
          class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium"
          :class="
            status.isRunning
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
          "
        >
          <i class="ti" :class="status.isRunning ? 'ti-circle-check' : 'ti-circle-x'"></i>
          {{ status.isRunning ? 'Running' : 'Stopped' }}
        </span>
      </div>
      <div class="mt-4 flex flex-wrap gap-6 text-sm text-gray-600 dark:text-gray-400">
        <div class="flex items-center gap-2">
          <i class="ti ti-clock-hour-3 text-gray-400 dark:text-gray-500"></i>
          <span>Last Run: {{ lastRunFormatted }}</span>
        </div>
        <div class="flex items-center gap-2">
          <i class="ti ti-check text-gray-400 dark:text-gray-500"></i>
          <span>Total Checks: {{ status.stats?.totalChecks || 0 }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatDateTime } from '@/composables/useTimeFormat'

interface SchedulerStats {
  totalChecks: number
  lastCheck: string | null
  lastRun?: string | null
  errors: number
}

interface SchedulerStatus {
  isRunning: boolean
  scheduledJobs: number
  stats?: SchedulerStats
  uptime: number | null
}

const props = defineProps<{
  status: SchedulerStatus | null
}>()

const lastRunFormatted = computed(() => {
  if (!props.status?.stats?.lastRun) return 'Never'
  try {
    return formatDateTime(props.status.stats.lastRun)
  } catch {
    return 'Invalid Date'
  }
})
</script>
