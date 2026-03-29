<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <i class="ti ti-dashboard text-purple-600 dark:text-purple-400 text-4xl"></i>
          Dashboard
          <span 
            v-if="isRefreshing" 
            class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30 rounded-full animate-pulse"
            title="Updating data in background..."
          >
            <i class="ti ti-refresh text-xs"></i>
            Updating
          </span>
        </h1>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">Monitor your services in real-time • Auto-refreshes every {{ refreshLabel }}</p>
      </div>
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2">
          <label for="refresh-interval" class="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
            Auto-refresh:
          </label>
          <select
            id="refresh-interval"
            v-model="refreshIntervalSeconds"
            @change="updateRefreshInterval"
            class="inline-flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 shadow-sm cursor-pointer"
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
        <button 
          @click="refreshData" 
          :disabled="loading"
          class="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-all duration-200 shadow-sm"
        >
          <i class="ti ti-refresh" :class="{ 'animate-spin': loading }"></i>
          <span>Refresh</span>
        </button>
        <button 
          @click="triggerManualCheck"
          :disabled="monitors.length === 0"
          class="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-all duration-200 shadow-sm"
        >
          <i class="ti ti-player-play"></i>
          <span>Check All</span>
        </button>
      </div>
    </div>

    <div v-if="connectionError" class="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4 rounded-lg shadow-sm">
      <div class="flex items-start">
        <i class="ti ti-alert-circle text-red-400 text-xl flex-shrink-0"></i>
        <div class="ml-3 flex-1">
          <h3 class="text-sm font-medium text-red-800 dark:text-red-200">Connection Error</h3>
          <p class="mt-1 text-sm text-red-700 dark:text-red-300">{{ connectionError }}</p>
        </div>
        <button 
          @click="retryConnection"
          class="ml-auto flex-shrink-0 inline-flex items-center gap-1 px-3 py-1 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-800 dark:text-red-200 text-sm font-medium rounded-md transition-colors"
        >
          <i class="ti ti-refresh text-sm"></i>
          Retry
        </button>
      </div>
    </div>

    <div v-if="loading && !connectionError" class="flex flex-col items-center justify-center py-12">
      <div class="w-12 h-12 border-4 border-purple-200 dark:border-purple-800 border-t-purple-600 rounded-full animate-spin"></div>
      <p class="mt-4 text-sm text-gray-600 dark:text-gray-400">Loading dashboard data...</p>
    </div>

    <div v-if="!loading && !connectionError" class="space-y-6">
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Total Monitors"
          :value="stats.totalMonitors"
          variant="primary"
          icon="server-2"
          tooltip="Total number of configured monitors across all types (HTTP, Ping, TCP)"
        />
        <StatsCard
          label="Active"
          :value="stats.activeCount"
          variant="success"
          icon="circle-check"
          tooltip="Monitors that are currently responding successfully"
        />
        <StatsCard
          label="Down"
          :value="stats.downCount"
          variant="danger"
          icon="alert-triangle"
          tooltip="Monitors that are not responding or returning errors"
        />
        <StatsCard
          label="Avg Response"
          :value="stats.avgResponseTime || 'N/A'"
          variant="info"
          icon="clock"
          suffix="ms"
          tooltip="Average response time across all active monitors. Lower is better!"
        />
      </div>

      <SchedulerCard :status="schedulerStatus" />

      <MonitorGrid
        :monitors="monitors"
        :search-query="searchQuery"
        :checking-monitors="checkingMonitors"
        @update:search-query="searchQuery = $event"
        @check="checkMonitor"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { api } from '@/services/api'
import { useToast } from '@/composables/useToast'
import StatsCard from '@/components/dashboard/StatsCard.vue'
import SchedulerCard from '@/components/dashboard/SchedulerCard.vue'
import MonitorGrid from '@/components/dashboard/MonitorGrid.vue'

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

interface DashboardStats {
  totalMonitors: number
  activeCount: number
  downCount: number
  avgResponseTime?: number
}

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
const { error: showError } = useToast()
let refreshInterval: ReturnType<typeof setInterval> | null = null

const refreshLabel = computed(() => {
  const seconds = refreshIntervalSeconds.value
  if (seconds < 60) return `${seconds}s`
  const minutes = seconds / 60
  return `${minutes} min${minutes > 1 ? 's' : ''}`
})

const loadRefreshInterval = () => {
  const saved = localStorage.getItem('dashboardRefreshInterval')
  if (saved) {
    const parsed = parseInt(saved, 10)
    if ([30, 60, 120, 180, 240, 300].includes(parsed)) {
      refreshIntervalSeconds.value = parsed
    }
  }
}

const fetchDashboardData = async (silent = false) => {
  try {
    if (!silent) {
      loading.value = true
    } else {
      isRefreshing.value = true
    }
    connectionError.value = ''

    const monitorsData = await api.getMonitors()
    const monitorsWithStatus = await Promise.all(
      monitorsData.map(async (monitor): Promise<Monitor> => {
        try {
          const checks = await api.getMonitorChecks(monitor.id, { limit: 1 })
          const latestCheck = checks[0]
          return {
            ...monitor,
            status: (latestCheck?.status as MonitorStatus) || 'unknown',
            responseTime: latestCheck?.response_time ?? null,
            lastCheck: latestCheck?.checked_at ?? null
          }
        } catch {
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
    
    const monitorsWithResponseTime = monitorsWithStatus.filter((m): m is Monitor & { responseTime: number } => 
      m.responseTime !== null && m.responseTime !== undefined
    )
    
    const totalResponseTime = monitorsWithResponseTime.reduce((acc, m) => acc + m.responseTime, 0)
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
      schedulerStatus.value = await api.getSchedulerStatus()
    } catch {
      schedulerStatus.value = null
    }
  } catch (error: unknown) {
    connectionError.value = (error as Error).message || 'Failed to connect to backend'
  } finally {
    loading.value = false
    isRefreshing.value = false
  }
}

const checkMonitor = async (monitorId: number) => {
  try {
    checkingMonitors.value.add(monitorId)
    await api.runMonitorCheck(monitorId)
    setTimeout(() => {
      fetchDashboardData(true)
      checkingMonitors.value.delete(monitorId)
    }, 1000)
  } catch (error: unknown) {
    checkingMonitors.value.delete(monitorId)
    showError(`Failed to check monitor: ${(error as Error).message}`)
  }
}

const triggerManualCheck = async () => {
  try {
    monitors.value.forEach(monitor => {
      checkingMonitors.value.add(monitor.id)
    })
    
    api.checkAllMonitors()
      .then(() => {
        setTimeout(() => {
          fetchDashboardData(true)
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

const refreshData = () => {
  fetchDashboardData()
}

const retryConnection = () => {
  fetchDashboardData()
}

const updateRefreshInterval = () => {
  localStorage.setItem('dashboardRefreshInterval', refreshIntervalSeconds.value.toString())
  
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
  
  const intervalMs = refreshIntervalSeconds.value * 1000
  refreshInterval = setInterval(() => fetchDashboardData(true), intervalMs)
}

onMounted(() => {
  loadRefreshInterval()
  fetchDashboardData()
  const intervalMs = refreshIntervalSeconds.value * 1000
  refreshInterval = setInterval(() => fetchDashboardData(true), intervalMs)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>
