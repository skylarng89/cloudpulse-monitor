<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <i class="ti ti-dashboard text-purple-600 text-4xl"></i>
          Dashboard
          <!-- Silent refresh indicator -->
          <span 
            v-if="isRefreshing" 
            class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-purple-700 bg-purple-50 rounded-full animate-pulse"
            title="Updating data in background..."
          >
            <i class="ti ti-refresh text-xs"></i>
            Updating
          </span>
        </h1>
        <p class="mt-1 text-sm text-gray-600">Monitor your services in real-time • Auto-refreshes every {{ getRefreshLabel }}</p>
      </div>
      <div class="flex items-center gap-3">
        <!-- Auto-refresh interval selector -->
        <div class="flex items-center gap-2">
          <label for="refresh-interval" class="text-sm font-medium text-gray-700 hidden sm:block">
            Auto-refresh:
          </label>
          <div class="relative">
            <select
              id="refresh-interval"
              v-model="refreshIntervalSeconds"
              @change="updateRefreshInterval"
              class="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 shadow-sm cursor-pointer"
              title="Set how often the dashboard automatically refreshes data"
            >
              <option :value="30">Every 30s</option>
              <option :value="60">Every 1 min</option>
              <option :value="120">Every 2 mins</option>
              <option :value="180">Every 3 mins</option>
              <option :value="240">Every 4 mins</option>
              <option :value="300">Every 5 mins</option>
            </select>
          </div>
        </div>
        <button 
          @click="refreshData" 
          :disabled="loading"
          class="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-all duration-200 shadow-sm"
        >
          <i class="ti ti-refresh" :class="{ 'animate-spin': loading }"></i>
          <span>Refresh</span>
        </button>
        <button 
          @click="triggerManualCheck"
          class="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 shadow-sm"
        >
          <i class="ti ti-player-play"></i>
          <span>Check All</span>
        </button>
      </div>
    </div>

    <!-- Connection Error Alert -->
    <div v-if="connectionError" class="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg shadow-sm">
      <div class="flex items-start">
        <i class="ti ti-alert-circle text-red-400 text-xl flex-shrink-0"></i>
        <div class="ml-3 flex-1">
          <h3 class="text-sm font-medium text-red-800">Connection Error</h3>
          <p class="mt-1 text-sm text-red-700">{{ connectionError }}</p>
        </div>
        <button 
          @click="retryConnection"
          class="ml-auto flex-shrink-0 inline-flex items-center gap-1 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 text-sm font-medium rounded-md transition-colors"
        >
          <i class="ti ti-refresh text-sm"></i>
          Retry
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !connectionError" class="flex flex-col items-center justify-center py-12">
      <div class="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      <p class="mt-4 text-sm text-gray-600">Loading dashboard data...</p>
    </div>

    <!-- Main Dashboard Content -->
    <div v-if="!loading && !connectionError" class="space-y-6">
      <!-- Stats Grid -->
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <!-- Total Monitors -->
        <div 
          class="bg-white overflow-hidden shadow-sm rounded-lg border-l-4 border-purple-500 hover:shadow-md transition-shadow duration-200 cursor-help"
          title="Total number of configured monitors across all types (HTTP, Ping, TCP)"
        >
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                  <i class="ti ti-server-2 text-white text-2xl"></i>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Total Monitors</dt>
                  <dd class="text-3xl font-bold text-gray-900">{{ stats.totalMonitors || 0 }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <!-- Active -->
        <div 
          class="bg-white overflow-hidden shadow-sm rounded-lg border-l-4 border-green-500 hover:shadow-md transition-shadow duration-200 cursor-help"
          title="Monitors that are currently responding successfully"
        >
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                  <i class="ti ti-circle-check text-white text-2xl"></i>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Active</dt>
                  <dd class="text-3xl font-bold text-green-600">{{ stats.activeCount || 0 }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <!-- Down -->
        <div 
          class="bg-white overflow-hidden shadow-sm rounded-lg border-l-4 border-red-500 hover:shadow-md transition-shadow duration-200 cursor-help"
          title="Monitors that are not responding or returning errors"
        >
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
                  <i class="ti ti-alert-triangle text-white text-2xl"></i>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Down</dt>
                  <dd class="text-3xl font-bold text-red-600">{{ stats.downCount || 0 }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <!-- Avg Response -->
        <div 
          class="bg-white overflow-hidden shadow-sm rounded-lg border-l-4 border-blue-500 hover:shadow-md transition-shadow duration-200 cursor-help"
          title="Average response time across all active monitors. Lower is better!"
        >
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                  <i class="ti ti-clock text-white text-2xl"></i>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Avg Response</dt>
                  <dd class="text-3xl font-bold text-gray-900">{{ stats.avgResponseTime ? `${stats.avgResponseTime}ms` : 'N/A' }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Scheduler Status -->
      <div v-if="schedulerStatus" class="bg-white shadow-sm rounded-lg border border-gray-200">
        <div class="px-6 py-5">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <i class="ti ti-robot text-purple-600 text-2xl"></i>
              <h3 class="text-lg font-medium text-gray-900">Scheduler Status</h3>
            </div>
            <span 
              class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium"
              :class="schedulerStatus.isRunning ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
            >
              <i class="ti" :class="schedulerStatus.isRunning ? 'ti-circle-check' : 'ti-circle-x'"></i>
              {{ schedulerStatus.isRunning ? 'Running' : 'Stopped' }}
            </span>
          </div>
          <div class="mt-4 flex flex-wrap gap-6 text-sm text-gray-600">
            <div class="flex items-center gap-2">
              <i class="ti ti-clock-hour-3 text-gray-400"></i>
              <span>Last Run: {{ formatTime(schedulerStatus.stats?.lastRun) || 'Never' }}</span>
            </div>
            <div class="flex items-center gap-2">
              <i class="ti ti-check text-gray-400"></i>
              <span>Total Checks: {{ schedulerStatus.stats?.totalChecks || 0 }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Monitor Status -->
      <div class="bg-white shadow-sm rounded-lg border border-gray-200">
        <div class="px-6 py-5 border-b border-gray-200">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 class="text-lg font-medium text-gray-900 flex items-center gap-2">
              <i class="ti ti-activity text-purple-600"></i>
              Monitor Status
            </h2>
            <!-- Search Bar -->
            <div class="relative max-w-xs w-full">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="ti ti-search text-gray-400"></i>
              </div>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search monitors..."
                class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
              <button
                v-if="searchQuery"
                @click="searchQuery = ''"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <i class="ti ti-x text-gray-400 hover:text-gray-600"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="monitors.length === 0" class="px-6 py-12 text-center">
          <i class="ti ti-server-off text-gray-300 text-6xl"></i>
          <h3 class="mt-4 text-lg font-medium text-gray-900">No monitors configured</h3>
          <p class="mt-2 text-sm text-gray-600">Get started by adding your first monitor</p>
          <router-link 
            to="/monitors"
            class="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-purple-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
          >
            <i class="ti ti-plus"></i>
            Add Your First Monitor
          </router-link>
        </div>

        <!-- Monitors Grid -->
        <div v-else class="p-6">
          <!-- No Results -->
          <div v-if="filteredMonitors.length === 0" class="text-center py-12">
            <i class="ti ti-search-off text-gray-300 text-6xl"></i>
            <h3 class="mt-4 text-lg font-medium text-gray-900">No monitors found</h3>
            <p class="mt-2 text-sm text-gray-600">Try adjusting your search query</p>
            <button
              @click="searchQuery = ''"
              class="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <i class="ti ti-x"></i>
              Clear Search
            </button>
          </div>
          
          <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div
              v-for="monitor in paginatedMonitors"
              :key="monitor.id"
              class="relative bg-white border rounded-lg p-5 hover:shadow-md transition-all duration-200"
              :class="{
                'border-l-4 border-l-green-500 bg-green-50/30': monitor.status === 'up' && !checkingMonitors.has(monitor.id),
                'border-l-4 border-l-red-500 bg-red-50/30': monitor.status === 'down' && !checkingMonitors.has(monitor.id),
                'border-l-4 border-l-yellow-500 bg-yellow-50/30': monitor.status === 'error' && !checkingMonitors.has(monitor.id),
                'border-l-4 border-l-purple-500 bg-purple-50/30 animate-pulse': checkingMonitors.has(monitor.id),
                'border-gray-200': (!monitor.status || monitor.status === 'unknown') && !checkingMonitors.has(monitor.id)
              }"
            >
              <!-- Checking overlay -->
              <div 
                v-if="checkingMonitors.has(monitor.id)"
                class="absolute inset-0 bg-white/60 backdrop-blur-[2px] rounded-lg flex items-center justify-center z-10"
              >
                <div class="flex flex-col items-center gap-2">
                  <div class="w-8 h-8 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                  <span class="text-xs font-medium text-purple-700">Checking...</span>
                </div>
              </div>
              <!-- Monitor Header -->
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center gap-2">
                  <i 
                    class="ti text-xl"
                    :class="{
                      'ti-circle-check text-green-600': monitor.status === 'up',
                      'ti-circle-x text-red-600': monitor.status === 'down',
                      'ti-alert-triangle text-yellow-600': monitor.status === 'error',
                      'ti-help-circle text-gray-400': !monitor.status || monitor.status === 'unknown'
                    }"
                  ></i>
                  <h3 class="text-base font-semibold text-gray-900">{{ monitor.name }}</h3>
                </div>
                <span 
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase cursor-help"
                  :class="{
                    'bg-green-100 text-green-800': monitor.status === 'up',
                    'bg-red-100 text-red-800': monitor.status === 'down',
                    'bg-yellow-100 text-yellow-800': monitor.status === 'error',
                    'bg-gray-100 text-gray-800': !monitor.status || monitor.status === 'unknown'
                  }"
                  :title="getStatusTooltip(monitor.status)"
                >
                  {{ monitor.status || 'unknown' }}
                </span>
              </div>

              <!-- URL -->
              <div class="flex items-center gap-2 mb-3 text-sm text-gray-600">
                <i class="ti ti-link text-gray-400 flex-shrink-0"></i>
                <span class="truncate font-mono text-xs">{{ monitor.url }}</span>
              </div>

              <!-- Details -->
              <div class="flex items-center gap-4 mb-4 text-sm text-gray-600">
                <div 
                  v-if="monitor.responseTime" 
                  class="flex items-center gap-1 cursor-help"
                  :title="getResponseTimeTooltip(monitor.responseTime)"
                >
                  <i class="ti ti-clock text-gray-400"></i>
                  <span>{{ monitor.responseTime }}ms</span>
                </div>
                <div 
                  class="flex items-center gap-1 cursor-help"
                  :title="'Last checked: ' + (monitor.lastCheck ? new Date(monitor.lastCheck).toLocaleString() : 'Never')"
                >
                  <i class="ti ti-calendar-time text-gray-400"></i>
                  <span>{{ formatTime(monitor.lastCheck) }}</span>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center gap-2">
                <button 
                  @click="checkMonitor(monitor.id)"
                  class="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-purple-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                  title="Run check now"
                >
                  <i class="ti ti-refresh text-sm"></i>
                  Check Now
                </button>
                <router-link 
                  to="/monitors"
                  class="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                  title="Edit monitor settings"
                >
                  <i class="ti ti-edit text-sm"></i>
                  Edit
                </router-link>
              </div>
            </div>
          </div>
          
          <!-- Pagination -->
          <div v-if="totalPages > 1" class="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 pt-4">
            <div class="text-sm text-gray-700">
              {{ paginationInfo }}
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="goToPage(currentPage - 1)"
                :disabled="currentPage === 1"
                class="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <i class="ti ti-chevron-left text-sm"></i>
                Previous
              </button>
              
              <div class="flex items-center gap-1">
                <button
                  v-for="page in totalPages"
                  :key="page"
                  v-show="page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)"
                  @click="goToPage(page)"
                  class="inline-flex items-center justify-center w-10 h-10 border rounded-lg text-sm font-medium transition-colors"
                  :class="{
                    'bg-purple-600 text-white border-purple-600': page === currentPage,
                    'border-gray-300 text-gray-700 bg-white hover:bg-gray-50': page !== currentPage
                  }"
                >
                  {{ page }}
                </button>
              </div>
              
              <button
                @click="goToPage(currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <i class="ti ti-chevron-right text-sm"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import apiService from '@/services/api'
import { format } from 'date-fns'
import { useToast } from '@/composables/useToast'

/**
 * Monitor status type
 */
type MonitorStatus = 'up' | 'down' | 'error' | 'unknown'

/**
 * Monitor interface representing a monitoring endpoint
 */
interface Monitor {
  id: number
  name: string
  url: string
  type: string
  status?: MonitorStatus
  responseTime?: number | null
  lastCheck?: string | null
}

/**
 * Dashboard statistics interface
 */
interface DashboardStats {
  totalMonitors: number
  activeCount: number
  downCount: number
  avgResponseTime?: number
}

/**
 * Scheduler status interface
 */
interface SchedulerStatus {
  isRunning: boolean
  scheduledJobs: number
  stats?: {
    totalChecks: number
    lastCheck: string | null
    lastRun?: string | null
    errors: number
  }
  uptime: number | null
}

const monitors = ref<Monitor[]>([])
const stats = ref<DashboardStats>({
  totalMonitors: 0,
  activeCount: 0,
  downCount: 0,
  avgResponseTime: 0
})
const schedulerStatus = ref<SchedulerStatus | null>(null)
const loading = ref(true)
const isRefreshing = ref(false)
const connectionError = ref('')
const refreshIntervalSeconds = ref(30)
const checkingMonitors = ref(new Set<number>())
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(12)
const { error: showError, success: showSuccess } = useToast()
let refreshInterval: NodeJS.Timeout | null = null

/**
 * Load saved refresh interval from localStorage
 */
const loadRefreshInterval = (): void => {
  const saved = localStorage.getItem('dashboardRefreshInterval')
  if (saved) {
    const parsed = parseInt(saved, 10)
    if ([30, 60, 120, 180, 240, 300].includes(parsed)) {
      refreshIntervalSeconds.value = parsed
    }
  }
}

/**
 * Computed property for refresh label
 * @returns Formatted refresh interval string
 */
const getRefreshLabel = computed((): string => {
  const seconds = refreshIntervalSeconds.value
  if (seconds < 60) {
    return `${seconds}s`
  } else {
    const minutes = seconds / 60
    return `${minutes} min${minutes > 1 ? 's' : ''}`
  }
})

/**
 * Computed property for filtered monitors based on search query
 * @returns Filtered array of monitors
 */
const filteredMonitors = computed((): Monitor[] => {
  if (!searchQuery.value.trim()) {
    return monitors.value
  }
  
  const query = searchQuery.value.toLowerCase().trim()
  return monitors.value.filter(monitor => 
    monitor.name.toLowerCase().includes(query) ||
    monitor.url.toLowerCase().includes(query)
  )
})

/**
 * Computed property for paginated monitors
 * @returns Paginated array of filtered monitors
 */
const paginatedMonitors = computed((): Monitor[] => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredMonitors.value.slice(start, end)
})

/**
 * Computed property for total pages
 * @returns Total number of pages
 */
const totalPages = computed((): number => {
  return Math.ceil(filteredMonitors.value.length / pageSize.value)
})

/**
 * Computed property for pagination info
 * @returns Pagination display text
 */
const paginationInfo = computed((): string => {
  const start = (currentPage.value - 1) * pageSize.value + 1
  const end = Math.min(currentPage.value * pageSize.value, filteredMonitors.value.length)
  const total = filteredMonitors.value.length
  return `Showing ${start}-${end} of ${total}`
})

/**
 * Navigate to specific page
 * @param page - Page number to navigate to
 */
const goToPage = (page: number): void => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    // Scroll to top of monitors section
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

/**
 * Watch search query and reset to page 1
 */
watch(searchQuery, () => {
  currentPage.value = 1
})

/**
 * Fetch dashboard data from API
 * @param silent - If true, shows subtle refresh indicator instead of full loading spinner
 */
const fetchDashboardData = async (silent = false): Promise<void> => {
  try {
    // Only show loading spinner on initial load, not on auto-refresh
    if (!silent) {
      loading.value = true
    } else {
      isRefreshing.value = true
    }
    connectionError.value = ''

    const monitorsData = await apiService.getMonitors()
    const monitorsWithStatus = await Promise.all(
      monitorsData.map(async (monitor: Monitor): Promise<Monitor> => {
        try {
          const checks = await apiService.getMonitorChecks(monitor.id, { limit: 1 })
          const latestCheck = checks[0]
          return {
            ...monitor,
            status: (latestCheck?.status as MonitorStatus) || 'unknown',
            responseTime: latestCheck?.response_time ?? null,
            lastCheck: latestCheck?.checked_at ?? null
          }
        } catch (error) {
          console.warn(`Could not fetch checks for monitor ${monitor.id}:`, error)
          return {
            ...monitor,
            status: 'unknown' as MonitorStatus,
            responseTime: null,
            lastCheck: null
          }
        }
      })
    )

    monitors.value = monitorsWithStatus
    
    // Calculate statistics
    const monitorsWithResponseTime = monitorsWithStatus.filter((m): m is Monitor & { responseTime: number } => 
      m.responseTime !== null && m.responseTime !== undefined
    )
    
    const totalResponseTime = monitorsWithResponseTime.reduce((acc: number, m) => acc + m.responseTime, 0)
    const avgResponseTime = monitorsWithResponseTime.length > 0 
      ? Math.floor(totalResponseTime / monitorsWithResponseTime.length)
      : 0
    
    stats.value = {
      totalMonitors: monitorsData.length,
      activeCount: monitorsWithStatus.filter(m => m.status === 'up').length,
      downCount: monitorsWithStatus.filter(m => m.status === 'down').length,
      avgResponseTime
    }

    try {
      schedulerStatus.value = await apiService.getSchedulerStatus()
    } catch (error) {
      schedulerStatus.value = null
    }
  } catch (error: any) {
    connectionError.value = error.message || 'Failed to connect to backend'
  } finally {
    loading.value = false
    isRefreshing.value = false
  }
}

/**
 * Format a date string to a human-readable format
 * @param dateString - ISO date string, null, or undefined
 * @returns Formatted date string or 'Never' if null/undefined
 */
const formatTime = (dateString: string | null | undefined): string => {
  if (!dateString) return 'Never'
  try {
    return format(new Date(dateString), 'MMM dd, HH:mm')
  } catch (error) {
    return 'Invalid Date'
  }
}

/**
 * Get tooltip text for response time with performance rating
 * @param responseTime - Response time in milliseconds
 * @returns Tooltip text with performance assessment
 */
const getResponseTimeTooltip = (responseTime: number): string => {
  if (responseTime < 100) {
    return `${responseTime}ms - Excellent! Very fast response time.`
  } else if (responseTime < 300) {
    return `${responseTime}ms - Good response time. Your service is performing well.`
  } else if (responseTime < 1000) {
    return `${responseTime}ms - Acceptable response time. Consider optimization if this persists.`
  } else if (responseTime < 3000) {
    return `${responseTime}ms - Slow response time. Users may experience delays.`
  } else {
    return `${responseTime}ms - Very slow! This needs immediate attention.`
  }
}

/**
 * Get tooltip text for monitor status
 * @param status - Monitor status
 * @returns Tooltip text explaining the status
 */
const getStatusTooltip = (status: MonitorStatus | undefined): string => {
  switch (status) {
    case 'up':
      return 'Monitor is responding successfully and all checks are passing'
    case 'down':
      return 'Monitor is not responding or connection failed'
    case 'error':
      return 'An error occurred while checking this monitor'
    case 'unknown':
    default:
      return 'No check data available yet. Click "Check Now" to test.'
  }
}

/**
 * Manually check a specific monitor
 * @param monitorId - ID of the monitor to check
 */
const checkMonitor = async (monitorId: number): Promise<void> => {
  try {
    // Add to checking set
    checkingMonitors.value.add(monitorId)
    
    // Perform the check
    await apiService.checkMonitor(monitorId)
    
    // Wait a bit then refresh data silently
    setTimeout(() => {
      fetchDashboardData(true)
      checkingMonitors.value.delete(monitorId)
    }, 1000)
  } catch (error: any) {
    checkingMonitors.value.delete(monitorId)
    showError(`Failed to check monitor: ${error.message}`)
  }
}

/**
 * Trigger manual check for all monitors
 */
const triggerManualCheck = async (): Promise<void> => {
  try {
    // Add all monitors to checking set
    monitors.value.forEach(monitor => {
      checkingMonitors.value.add(monitor.id)
    })
    
    // Trigger check all (runs in background)
    apiService.triggerManualCheck()
      .then(() => {
        // Wait a bit then refresh data silently
        setTimeout(() => {
          fetchDashboardData(true)
          // Clear all checking states
          checkingMonitors.value.clear()
        }, 2000)
      })
      .catch((error: Error) => {
        checkingMonitors.value.clear()
        showError(`Failed to trigger manual check: ${error.message}`)
      })
  } catch (error) {
    checkingMonitors.value.clear()
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    showError(`Failed to trigger manual check: ${errorMessage}`)
  }
}

/**
 * Refresh dashboard data (shows loading spinner)
 */
const refreshData = (): void => {
  fetchDashboardData()
}

/**
 * Retry connection after error
 */
const retryConnection = (): void => {
  fetchDashboardData()
}

/**
 * Update auto-refresh interval and save to localStorage
 */
const updateRefreshInterval = (): void => {
  // Save to localStorage
  localStorage.setItem('dashboardRefreshInterval', refreshIntervalSeconds.value.toString())
  
  // Clear existing interval
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
  
  // Set new interval
  const intervalMs = refreshIntervalSeconds.value * 1000
  refreshInterval = setInterval(() => fetchDashboardData(true), intervalMs)
  
  console.log(`Auto-refresh interval updated to ${refreshIntervalSeconds.value} seconds`)
}

onMounted(() => {
  // Load saved refresh interval preference
  loadRefreshInterval()
  
  // Initial data fetch
  fetchDashboardData()
  
  // Set up auto-refresh with user's preferred interval
  const intervalMs = refreshIntervalSeconds.value * 1000
  refreshInterval = setInterval(() => fetchDashboardData(true), intervalMs)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>
