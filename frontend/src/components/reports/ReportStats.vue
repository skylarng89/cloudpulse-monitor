<template>
  <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
    <div
      class="bg-white dark:bg-slate-800 overflow-hidden shadow-sm rounded-lg border border-gray-200 dark:border-slate-700 border-l-4 border-l-green-500"
    >
      <div class="p-5">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div
              class="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg"
            >
              <i class="ti ti-circle-check text-white text-2xl"></i>
            </div>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">Uptime</dt>
              <dd class="text-3xl font-bold text-green-600 dark:text-green-400">
                {{ uptime.toFixed(1) }}%
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>

    <div
      class="bg-white dark:bg-slate-800 overflow-hidden shadow-sm rounded-lg border border-gray-200 dark:border-slate-700 border-l-4 border-l-blue-500"
    >
      <div class="p-5">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div
              class="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg"
            >
              <i class="ti ti-check text-white text-2xl"></i>
            </div>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">
                Total Checks
              </dt>
              <dd class="text-3xl font-bold text-gray-900 dark:text-white">
                {{ formatNumber(totalChecks) }}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>

    <div
      class="bg-white dark:bg-slate-800 overflow-hidden shadow-sm rounded-lg border border-gray-200 dark:border-slate-700 border-l-4 border-l-red-500"
    >
      <div class="p-5">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div
              class="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg"
            >
              <i class="ti ti-alert-triangle text-white text-2xl"></i>
            </div>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">
                Incidents
              </dt>
              <dd class="text-3xl font-bold text-gray-900 dark:text-white">{{ incidents }}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>

    <div
      class="bg-white dark:bg-slate-800 overflow-hidden shadow-sm rounded-lg border border-gray-200 dark:border-slate-700 border-l-4 border-l-purple-500"
    >
      <div class="p-5">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div
              class="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg"
            >
              <i class="ti ti-clock text-white text-2xl"></i>
            </div>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">
                Avg Response
              </dt>
              <dd class="text-3xl font-bold text-gray-900 dark:text-white">{{ avgResponse }}ms</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  uptime: number
  totalChecks: number
  incidents: number
  avgResponse: number
}>()

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}
</script>
