<template>
  <div class="dashboard">
    <!-- Connection Status -->
    <div v-if="connectionError" class="connection-error">
      <p>⚠️ Unable to connect to backend: {{ connectionError }}</p>
      <button @click="retryConnection" class="btn-secondary">Retry Connection</button>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !connectionError" class="loading-state">
      <p>Loading dashboard data...</p>
    </div>

    <!-- Main Dashboard Content -->
    <div v-if="!loading && !connectionError" class="dashboard-content">
      <!-- Statistics Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <h3>Total Monitors</h3>
          <p class="stat-number">{{ stats.totalMonitors || 0 }}</p>
        </div>
        <div class="stat-card">
          <h3>Active</h3>
          <p class="stat-number up">{{ stats.activeCount || 0 }}</p>
        </div>
        <div class="stat-card">
          <h3>Down</h3>
          <p class="stat-number down">{{ stats.downCount || 0 }}</p>
        </div>
        <div class="stat-card">
          <h3>Avg Response</h3>
          <p class="stat-number">{{ stats.avgResponseTime ? `${stats.avgResponseTime}ms` : 'N/A' }}</p>
        </div>
      </div>

      <!-- Scheduler Status -->
      <div class="scheduler-status" v-if="schedulerStatus">
        <h3>Scheduler Status</h3>
        <div class="scheduler-info">
          <span :class="{ 'status-active': schedulerStatus.isRunning, 'status-inactive': !schedulerStatus.isRunning }">
            {{ schedulerStatus.isRunning ? '🟢 Running' : '🔴 Stopped' }}
          </span>
          <span class="scheduler-stats">
            Last Run: {{ formatTime(schedulerStatus.stats?.lastRun) || 'Never' }}
          </span>
          <span class="scheduler-stats">
            Total Checks: {{ schedulerStatus.stats?.totalChecks || 0 }}
          </span>
        </div>
      </div>

      <!-- Monitor Status Grid -->
      <div class="monitors-section">
        <div class="section-header">
          <h2>Monitor Status</h2>
          <div class="section-actions">
            <button @click="refreshData" :disabled="loading" class="btn-secondary">
              {{ loading ? 'Refreshing...' : '🔄 Refresh' }}
            </button>
            <button @click="triggerManualCheck" class="btn-primary">
              Check All Now
            </button>
          </div>
        </div>

        <div v-if="monitors.length === 0" class="no-monitors">
          <p>No monitors configured yet.</p>
          <router-link to="/monitors" class="btn-primary">Add Your First Monitor</router-link>
        </div>

        <div v-else class="monitors-grid">
          <div
            v-for="monitor in monitors"
            :key="monitor.id"
            class="monitor-card"
            :class="{ up: monitor.status === 'up', down: monitor.status === 'down', error: monitor.status === 'error' }"
          >
            <div class="monitor-header">
              <h3>{{ monitor.name }}</h3>
              <span class="status-badge" :class="monitor.status">
                {{ monitor.status || 'unknown' }}
              </span>
            </div>
            <p class="monitor-url">{{ monitor.url }}</p>
            <div class="monitor-details">
              <span v-if="monitor.responseTime">
                Response: {{ monitor.responseTime }}ms
              </span>
              <span>Last Check: {{ formatTime(monitor.lastCheck) }}</span>
            </div>
            <div class="monitor-actions">
              <button @click="checkMonitor(monitor.id)" class="btn-small">
                Check Now
              </button>
              <router-link :to="`/monitors/${monitor.id}`" class="btn-small btn-secondary">
                Details
              </router-link>
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

    // Fetch monitors and their latest status
    const monitorsData = await apiService.getMonitors()

    // Get recent check results for each monitor
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
          console.error(`Error fetching status for monitor ${monitor.id}:`, error)
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

    // Calculate statistics
    stats.value = {
      totalMonitors: monitorsData.length,
      activeCount: monitorsWithStatus.filter(m => m.status === 'up').length,
      downCount: monitorsWithStatus.filter(m => m.status === 'down').length,
      avgResponseTime: Math.floor(
        monitorsWithStatus
          .filter(m => m.responseTime)
          .reduce((acc, m) => acc + m.responseTime, 0) /
        monitorsWithStatus.filter(m => m.responseTime).length || 1
      )
    }

    // Fetch scheduler status
    try {
      schedulerStatus.value = await apiService.getSchedulerStatus()
    } catch (error) {
      console.warn('Could not fetch scheduler status:', error)
      schedulerStatus.value = null
    }

  } catch (error) {
    console.error('Error fetching dashboard data:', error)
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
    // Refresh data after a brief delay to show updated status
    setTimeout(fetchDashboardData, 1000)
  } catch (error) {
    console.error(`Error checking monitor ${monitorId}:`, error)
    alert(`Failed to check monitor: ${error.message}`)
  }
}

const triggerManualCheck = async () => {
  try {
    loading.value = true
    await apiService.triggerManualCheck()
    // Refresh data to show updated results
    setTimeout(fetchDashboardData, 2000)
  } catch (error) {
    console.error('Error triggering manual check:', error)
    alert(`Failed to trigger manual check: ${error.message}`)
  }
}

const refreshData = () => {
  fetchDashboardData()
}

const retryConnection = () => {
  fetchDashboardData()
}

// Auto-refresh every 30 seconds
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

<style scoped>
.dashboard {
  min-height: 100vh;
}

.connection-error {
  background: #fee;
  border: 1px solid #fcc;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  text-align: center;
}

.loading-state {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.dashboard-content {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  margin: 0.5rem 0 0 0;
}

.stat-number.up {
  color: #27ae60;
}

.stat-number.down {
  color: #e74c3c;
}

.scheduler-status {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.scheduler-status h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.scheduler-info {
  display: flex;
  gap: 2rem;
  align-items: center;
  flex-wrap: wrap;
}

.status-active {
  color: #27ae60;
  font-weight: bold;
}

.status-inactive {
  color: #95a5a6;
  font-weight: bold;
}

.scheduler-stats {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.monitors-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  margin: 0;
}

.section-actions {
  display: flex;
  gap: 1rem;
}

.no-monitors {
  text-align: center;
  padding: 3rem;
  color: #7f8c8d;
}

.no-monitors p {
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
}

.monitors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1rem;
}

.monitor-card {
  padding: 1rem;
  border-radius: 6px;
  border-left: 4px solid #bdc3c7;
  background: white;
  transition: transform 0.2s, box-shadow 0.2s;
}

.monitor-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.monitor-card.up {
  border-left-color: #27ae60;
  background: #f8fff8;
}

.monitor-card.down {
  border-left-color: #e74c3c;
  background: #fff8f8;
}

.monitor-card.error {
  border-left-color: #f39c12;
  background: #fff8f0;
}

.monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.monitor-header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
}

.status-badge.up {
  background: #27ae60;
  color: white;
}

.status-badge.down {
  background: #e74c3c;
  color: white;
}

.status-badge.error {
  background: #f39c12;
  color: white;
}

.monitor-url {
  color: #7f8c8d;
  margin: 0.5rem 0;
  font-family: monospace;
  font-size: 0.9rem;
}

.monitor-details {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-bottom: 1rem;
}

.monitor-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-small {
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-small.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-small.btn-secondary:hover {
  background: #7f8c8d;
}

.btn-small:not(.btn-secondary) {
  background: #3498db;
  color: white;
}

.btn-small:not(.btn-secondary):hover {
  background: #2980b9;
}
</style>