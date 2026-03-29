<template>
  <div
    class="shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
  >
    <div class="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 class="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
          <i class="ti ti-activity text-purple-600 dark:text-purple-400"></i>
          Monitor Status
        </h2>
        <div class="relative max-w-xs w-full">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i class="ti ti-search text-gray-400"></i>
          </div>
          <input
            :value="searchQuery"
            @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
            type="text"
            placeholder="Search monitors..."
            class="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm placeholder-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
          <button
            v-if="searchQuery"
            @click="$emit('update:searchQuery', '')"
            class="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <i class="ti ti-x text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"></i>
          </button>
        </div>
      </div>
    </div>

    <div v-if="monitors.length === 0" class="px-6 py-12 text-center">
      <i class="ti ti-server-off text-gray-300 dark:text-gray-600 text-6xl"></i>
      <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">No monitors configured</h3>
      <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Get started by adding your first monitor
      </p>
      <router-link
        to="/monitors"
        class="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-purple-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
      >
        <i class="ti ti-plus"></i>
        Add Your First Monitor
      </router-link>
    </div>

    <div v-else class="p-6">
      <div v-if="filteredMonitors.length === 0" class="text-center py-12">
        <i class="ti ti-search-off text-gray-300 dark:text-gray-600 text-6xl"></i>
        <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">No monitors found</h3>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">Try adjusting your search query</p>
        <button
          @click="$emit('update:searchQuery', '')"
          class="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <i class="ti ti-x"></i>
          Clear Search
        </button>
      </div>

      <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MonitorCard
          v-for="monitor in paginatedMonitors"
          :key="monitor.id"
          :monitor="monitor"
          :is-checking="checkingMonitors.has(monitor.id)"
          @check="$emit('check', monitor.id)"
        />
      </div>

      <div
        v-if="totalPages > 1"
        class="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 dark:border-gray-700 pt-4"
      >
        <div class="text-sm text-gray-700 dark:text-gray-300">
          {{ paginationInfo }}
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <i class="ti ti-chevron-left text-sm"></i>
            Previous
          </button>

          <div class="flex items-center gap-1">
            <button
              v-for="page in totalPages"
              :key="page"
              v-show="
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              "
              @click="goToPage(page)"
              class="inline-flex items-center justify-center w-10 h-10 border rounded-lg text-sm font-medium transition-colors"
              :class="{
                'bg-purple-600 text-white border-purple-600 dark:border-purple-500':
                  page === currentPage,
                'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600':
                  page !== currentPage
              }"
            >
              {{ page }}
            </button>
          </div>

          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <i class="ti ti-chevron-right text-sm"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import MonitorCard from './MonitorCard.vue'

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
  monitors: Monitor[]
  searchQuery: string
  checkingMonitors: Set<number>
}>()

defineEmits<{
  (e: 'update:searchQuery', value: string): void
  (e: 'check', monitorId: number): void
}>()

const currentPage = ref(1)
const pageSize = 12

watch(
  () => props.searchQuery,
  () => {
    currentPage.value = 1
  }
)

const filteredMonitors = computed(() => {
  if (!props.searchQuery.trim()) {
    return props.monitors
  }
  const query = props.searchQuery.toLowerCase().trim()
  return props.monitors.filter(
    (monitor) =>
      monitor.name.toLowerCase().includes(query) || monitor.url.toLowerCase().includes(query)
  )
})

const paginatedMonitors = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredMonitors.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredMonitors.value.length / pageSize)
})

const paginationInfo = computed(() => {
  const start = (currentPage.value - 1) * pageSize + 1
  const end = Math.min(currentPage.value * pageSize, filteredMonitors.value.length)
  const total = filteredMonitors.value.length
  return `Showing ${start}-${end} of ${total}`
})

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}
</script>
