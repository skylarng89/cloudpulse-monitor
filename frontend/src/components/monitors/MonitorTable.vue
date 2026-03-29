<template>
  <div class="bg-white dark:bg-slate-800 shadow-sm rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
    <div v-if="monitors.length === 0" class="px-6 py-12 text-center">
      <i class="ti ti-server-off text-gray-300 dark:text-slate-600 text-6xl"></i>
      <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">No monitors configured</h3>
      <p class="mt-2 text-sm text-gray-600 dark:text-slate-400">Add your first monitor to start monitoring your websites and services.</p>
    </div>

    <template v-else>
      <div v-if="filteredMonitors.length === 0" class="px-6 py-12 text-center">
        <i class="ti ti-search-off text-gray-300 dark:text-slate-600 text-6xl"></i>
        <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">No monitors found</h3>
        <p class="mt-2 text-sm text-gray-600 dark:text-slate-400">Try adjusting your search query</p>
        <button
          @click="$emit('clear-search')"
          class="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <i class="ti ti-x"></i>
          Clear Search
        </button>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
          <thead class="bg-gray-50 dark:bg-slate-700/50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  :checked="isAllSelected"
                  @change="$emit('toggle-select-all')"
                  class="w-4 h-4 text-purple-600 border-gray-300 dark:border-slate-600 rounded focus:ring-purple-500 cursor-pointer bg-white dark:bg-slate-800"
                  title="Select all monitors"
                />
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">URL</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Interval</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
            <tr 
              v-for="monitor in paginatedMonitors" 
              :key="monitor.id" 
              class="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  :checked="selectedMonitors.has(monitor.id as number)"
                  @change="$emit('toggle-selection', monitor.id)"
                  class="w-4 h-4 text-purple-600 border-gray-300 dark:border-slate-600 rounded focus:ring-purple-500 cursor-pointer bg-white dark:bg-slate-800"
                />
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{{ monitor.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-slate-400 font-mono">{{ monitor.url }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-slate-400">{{ monitor.type?.toUpperCase() }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-slate-400">{{ monitor.interval_seconds }}s</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase"
                  :class="statusClass(monitor.status)"
                >
                  {{ monitor.status || 'unknown' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end gap-2">
                  <button 
                    @click="$emit('check', monitor.id)"
                    :disabled="checkingIds.has(monitor.id as number)"
                    class="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-medium rounded-md transition-colors"
                    title="Check Now"
                  >
                    <i class="ti ti-refresh text-sm" :class="{ 'animate-spin': checkingIds.has(monitor.id as number) }"></i>
                  </button>
                  <button 
                    @click="$emit('edit', monitor)"
                    class="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors"
                    title="Edit"
                  >
                    <i class="ti ti-edit text-sm"></i>
                  </button>
                  <button 
                    @click="$emit('delete', monitor)"
                    class="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-md transition-colors"
                    title="Delete"
                  >
                    <i class="ti ti-trash text-sm"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="totalPages > 1" class="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 dark:border-slate-700">
        <div class="text-sm text-gray-700 dark:text-slate-400">
          {{ paginationInfo }}
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="$emit('page-change', currentPage - 1)"
            :disabled="currentPage === 1"
            class="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <i class="ti ti-chevron-left text-sm"></i>
            Previous
          </button>
          
          <div class="flex items-center gap-1">
            <button
              v-for="page in totalPages"
              :key="page"
              v-show="page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)"
              @click="$emit('page-change', page)"
              class="inline-flex items-center justify-center w-10 h-10 border rounded-lg text-sm font-medium transition-colors"
              :class="{
                'bg-purple-600 text-white border-purple-600': page === currentPage,
                'border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600': page !== currentPage
              }"
            >
              {{ page }}
            </button>
          </div>
          
          <button
            @click="$emit('page-change', currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <i class="ti ti-chevron-right text-sm"></i>
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Monitor } from '@/types'

const props = defineProps<{
  monitors: Monitor[]
  searchQuery: string
  currentPage: number
  pageSize: number
  selectedMonitors: Set<number>
  checkingIds: Set<number>
}>()

defineEmits<{
  'clear-search': []
  'toggle-select-all': []
  'toggle-selection': [id: number | string]
  'check': [id: number | string]
  'edit': [monitor: Monitor]
  'delete': [monitor: Monitor]
  'page-change': [page: number]
}>()

const filteredMonitors = computed(() => {
  if (!props.searchQuery.trim()) {
    return props.monitors
  }
  const query = props.searchQuery.toLowerCase().trim()
  return props.monitors.filter(monitor => 
    monitor.name.toLowerCase().includes(query) ||
    monitor.url.toLowerCase().includes(query)
  )
})

const paginatedMonitors = computed(() => {
  const start = (props.currentPage - 1) * props.pageSize
  const end = start + props.pageSize
  return filteredMonitors.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredMonitors.value.length / props.pageSize)
})

const paginationInfo = computed(() => {
  const start = (props.currentPage - 1) * props.pageSize + 1
  const end = Math.min(props.currentPage * props.pageSize, filteredMonitors.value.length)
  const total = filteredMonitors.value.length
  return `Showing ${start}-${end} of ${total}`
})

const isAllSelected = computed(() => {
  if (paginatedMonitors.value.length === 0) return false
  return paginatedMonitors.value.every(m => props.selectedMonitors.has(m.id as number))
})

function statusClass(status?: string) {
  switch (status) {
    case 'up':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    case 'down':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    case 'error':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
  }
}
</script>
