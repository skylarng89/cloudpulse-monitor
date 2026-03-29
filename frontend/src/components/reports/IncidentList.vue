<template>
  <div class="bg-white dark:bg-slate-800 shadow-sm rounded-lg border border-gray-200 dark:border-slate-700">
    <div class="px-6 py-5 border-b border-gray-200 dark:border-slate-700">
      <h3 class="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
        <i class="ti ti-alert-circle text-purple-600 dark:text-purple-400"></i>
        Recent Incidents
      </h3>
    </div>
    
    <div v-if="loading" class="px-6 py-12 text-center">
      <BaseSpinner size="md" />
      <p class="mt-4 text-sm text-gray-600 dark:text-slate-400">Loading incidents...</p>
    </div>

    <div v-else-if="incidents.length === 0" class="px-6 py-12 text-center">
      <i class="ti ti-circle-check text-green-300 dark:text-green-600 text-6xl"></i>
      <h4 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">No incidents!</h4>
      <p class="mt-2 text-sm text-gray-600 dark:text-slate-400">All systems are running smoothly in the selected time period.</p>
    </div>

    <div v-else class="divide-y divide-gray-200 dark:divide-slate-700">
      <div 
        v-for="incident in incidents" 
        :key="incident.id"
        class="px-6 py-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
      >
        <div class="flex items-start gap-3">
          <div class="flex-shrink-0 w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <i class="ti ti-alert-triangle text-red-600 dark:text-red-400"></i>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 dark:text-white">{{ incident.monitorName }}</p>
            <p class="mt-1 text-sm text-gray-600 dark:text-slate-400">{{ incident.errorMessage }}</p>
            <div class="mt-2 flex items-center gap-4 text-xs text-gray-500 dark:text-slate-500">
              <span class="flex items-center gap-1">
                <i class="ti ti-clock"></i>
                {{ formatTime(incident.startedAt) }}
              </span>
              <span v-if="incident.duration" class="flex items-center gap-1">
                <i class="ti ti-hourglass"></i>
                {{ formatDuration(incident.duration) }}
              </span>
            </div>
          </div>
          <span 
            class="flex-shrink-0 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
            :class="incident.endedAt 
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'"
          >
            {{ incident.endedAt ? 'Resolved' : 'Ongoing' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Incident } from '@/types'
import BaseSpinner from '@/components/ui/BaseSpinner.vue'

defineProps<{
  incidents: Incident[]
  loading?: boolean
}>()

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
  return `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`
}
</script>
