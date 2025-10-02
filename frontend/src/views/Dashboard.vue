<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <i class="ti ti-dashboard text-purple-600 text-4xl"></i>
          Dashboard
        </h1>
        <p class="mt-1 text-sm text-gray-600">Monitor your services in real-time</p>
      </div>
      <div class="flex items-center gap-3">
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
        <div class="bg-white overflow-hidden shadow-sm rounded-lg border-l-4 border-purple-500 hover:shadow-md transition-shadow duration-200">
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
        <div class="bg-white overflow-hidden shadow-sm rounded-lg border-l-4 border-green-500 hover:shadow-md transition-shadow duration-200">
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
        <div class="bg-white overflow-hidden shadow-sm rounded-lg border-l-4 border-red-500 hover:shadow-md transition-shadow duration-200">
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
        <div class="bg-white overflow-hidden shadow-sm rounded-lg border-l-4 border-blue-500 hover:shadow-md transition-shadow duration-200">
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
          <h2 class="text-lg font-medium text-gray-900 flex items-center gap-2">
            <i class="ti ti-activity text-purple-600"></i>
            Monitor Status
          </h2>
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
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div
              v-for="monitor in monitors"
              :key="monitor.id"
              class="relative bg-white border rounded-lg p-5 hover:shadow-md transition-all duration-200"
              :class="{
                'border-l-4 border-l-green-500 bg-green-50/30': monitor.status === 'up',
                'border-l-4 border-l-red-500 bg-red-50/30': monitor.status === 'down',
                'border-l-4 border-l-yellow-500 bg-yellow-50/30': monitor.status === 'error',
                'border-gray-200': !monitor.status || monitor.status === 'unknown'
              }"
            >
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
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase"
                  :class="{
                    'bg-green-100 text-green-800': monitor.status === 'up',
                    'bg-red-100 text-red-800': monitor.status === 'down',
                    'bg-yellow-100 text-yellow-800': monitor.status === 'error',
                    'bg-gray-100 text-gray-800': !monitor.status || monitor.status === 'unknown'
                  }"
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
                <div v-if="monitor.responseTime" class="flex items-center gap-1">
                  <i class="ti ti-clock text-gray-400"></i>
                  <span>{{ monitor.responseTime }}ms</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="ti ti-calendar-time text-gray-400"></i>
                  <span>{{ formatTime(monitor.lastCheck) }}</span>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center gap-2">
                <button 
                  @click="checkMonitor(monitor.id)"
                  class="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-purple-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                >
                  <i class="ti ti-refresh text-sm"></i>
                  Check Now
                </button>
                <router-link 
                  :to="`/monitors/${monitor.id}`"
                  class="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                >
                  <i class="ti ti-eye text-sm"></i>
                  Details
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import apiService from '@/services/api'
import { format } from 'date-fns'

interface Monitor {
  id: number
  name: string
  url: string
  type: string
  status?: 'up' | 'down' | 'error'
  responseTime?: number
  lastCheck?: string
}

interface DashboardStats {
  totalMonitors: number
  activeCount: number
  downCount: number
  avgResponseTime?: number
}

const monitors = ref<Monitor[]>([])
const stats = ref<DashboardStats>({
  totalMonitors: 0,
  activeCount: 0,
  downCount: 0,
  avgResponseTime: 0
})
const schedulerStatus = ref<any>(null)
const loading = ref(true)
const connectionError = ref('')
let refreshInterval: NodeJS.Timeout | null = null

const fetchDashboardData = async () => {
  try {
    loading.value = true
    connectionError.value = ''

    const monitorsData = await apiService.getMonitors()
    const monitorsWithStatus = await Promise.all(
      monitorsData.map(async (monitor: Monitor) => {
        try {
          const checks = await apiService.getMonitorChecks(monitor.id, { limit: 1 })
          const latestCheck = checks[0]
          return {
            ...monitor,
            status: latestCheck?.status || 'unknown',
            responseTime: latestCheck?.response_time,
            lastCheck: latestCheck?.checked_at
          }
        } catch (error) {
          return {
            ...monitor,
            status: 'error',
            responseTime: null,
            lastCheck: null
          }
        }
      })
    )

    monitors.value = monitorsWithStatus
    stats.value = {
      totalMonitors: monitorsData.length,
      activeCount: monitorsWithStatus.filter((m: any) => m.status === 'up').length,
      downCount: monitorsWithStatus.filter((m: any) => m.status === 'down').length,
      avgResponseTime: Math.floor(
        monitorsWithStatus
          .filter((m: any) => m.responseTime)
          .reduce((acc: number, m: any) => acc + m.responseTime, 0) /
        monitorsWithStatus.filter((m: any) => m.responseTime).length || 1
      )
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
  }
}

const formatTime = (dateString: string | null) => {
  if (!dateString) return 'Never'
  try {
    return format(new Date(dateString), 'MMM dd, HH:mm')
  } catch (error) {
    return 'Invalid Date'
  }
}

const checkMonitor = async (monitorId: number) => {
  try {
    await apiService.checkMonitor(monitorId)
    setTimeout(fetchDashboardData, 1000)
  } catch (error: any) {
    alert(`Failed to check monitor: ${error.message}`)
  }
}

const triggerManualCheck = async () => {
  try {
    loading.value = true
    await apiService.triggerManualCheck()
    setTimeout(fetchDashboardData, 2000)
  } catch (error: any) {
    alert(`Failed to trigger manual check: ${error.message}`)
  }
}

const refreshData = () => {
  fetchDashboardData()
}

const retryConnection = () => {
  fetchDashboardData()
}

onMounted(() => {
  fetchDashboardData()
  refreshInterval = setInterval(fetchDashboardData, 30000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>
