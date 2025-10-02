<template>
  <div class="dashboard">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">
          <i class="ti ti-dashboard"></i>
          Dashboard
        </h1>
        <p class="page-subtitle">Monitor your services in real-time</p>
      </div>
      <div class="header-actions">
        <button @click="refreshData" :disabled="loading" class="btn btn-secondary">
          <i class="ti ti-refresh" :class="{ 'spinning': loading }"></i>
          <span>Refresh</span>
        </button>
        <button @click="triggerManualCheck" class="btn btn-primary">
          <i class="ti ti-player-play"></i>
          <span>Check All</span>
        </button>
      </div>
    </div>

    <!-- Connection Error -->
    <div v-if="connectionError" class="alert alert-danger">
      <i class="ti ti-alert-circle"></i>
      <div>
        <strong>Connection Error</strong>
        <p>{{ connectionError }}</p>
      </div>
      <button @click="retryConnection" class="btn btn-secondary btn-small">
        <i class="ti ti-refresh"></i>
        Retry
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !connectionError" class="loading-state">
      <div class="spinner"></div>
      <p>Loading dashboard data...</p>
    </div>

    <!-- Main Dashboard Content -->
    <div v-if="!loading && !connectionError" class="dashboard-content">
      <!-- Statistics Cards -->
      <div class="stats-grid">
        <div class="stat-card stat-primary">
          <div class="stat-icon">
            <i class="ti ti-server-2"></i>
          </div>
          <div class="stat-content">
            <div class="stat-label">Total Monitors</div>
            <div class="stat-value">{{ stats.totalMonitors || 0 }}</div>
          </div>
        </div>

        <div class="stat-card stat-success">
          <div class="stat-icon">
            <i class="ti ti-circle-check"></i>
          </div>
          <div class="stat-content">
            <div class="stat-label">Active</div>
            <div class="stat-value">{{ stats.activeCount || 0 }}</div>
          </div>
        </div>

        <div class="stat-card stat-danger">
          <div class="stat-icon">
            <i class="ti ti-alert-triangle"></i>
          </div>
          <div class="stat-content">
            <div class="stat-label">Down</div>
            <div class="stat-value">{{ stats.downCount || 0 }}</div>
          </div>
        </div>

        <div class="stat-card stat-info">
          <div class="stat-icon">
            <i class="ti ti-clock"></i>
          </div>
          <div class="stat-content">
            <div class="stat-label">Avg Response</div>
            <div class="stat-value">{{ stats.avgResponseTime ? `${stats.avgResponseTime}ms` : 'N/A' }}</div>
          </div>
        </div>
      </div>

      <!-- Scheduler Status -->
      <div class="scheduler-card" v-if="schedulerStatus">
        <div class="scheduler-header">
          <div class="scheduler-title">
            <i class="ti ti-robot"></i>
            <h3>Scheduler Status</h3>
          </div>
          <div class="scheduler-badge" :class="{ active: schedulerStatus.isRunning }">
            <i class="ti" :class="schedulerStatus.isRunning ? 'ti-circle-check' : 'ti-circle-x'"></i>
            {{ schedulerStatus.isRunning ? 'Running' : 'Stopped' }}
          </div>
        </div>
        <div class="scheduler-stats">
          <div class="scheduler-stat">
            <i class="ti ti-clock-hour-3"></i>
            <span>Last Run: {{ formatTime(schedulerStatus.stats?.lastRun) || 'Never' }}</span>
          </div>
          <div class="scheduler-stat">
            <i class="ti ti-check"></i>
            <span>Total Checks: {{ schedulerStatus.stats?.totalChecks || 0 }}</span>
          </div>
        </div>
      </div>

      <!-- Monitor Status Grid -->
      <div class="monitors-section">
        <div class="section-header">
          <h2>
            <i class="ti ti-activity"></i>
            Monitor Status
          </h2>
        </div>

        <div v-if="monitors.length === 0" class="empty-state">
          <i class="ti ti-server-off"></i>
          <h3>No monitors configured</h3>
          <p>Get started by adding your first monitor</p>
          <router-link to="/monitors" class="btn btn-primary">
            <i class="ti ti-plus"></i>
            Add Your First Monitor
          </router-link>
        </div>

        <div v-else class="monitors-grid">
          <div
            v-for="monitor in monitors"
            :key="monitor.id"
            class="monitor-card"
            :class="getMonitorClass(monitor.status)"
          >
            <div class="monitor-header">
              <div class="monitor-title">
                <i class="ti" :class="getMonitorIcon(monitor.status)"></i>
                <h3>{{ monitor.name }}</h3>
              </div>
              <span class="status-badge" :class="monitor.status">
                {{ monitor.status || 'unknown' }}
              </span>
            </div>
            
            <div class="monitor-url">
              <i class="ti ti-link"></i>
              <span>{{ monitor.url }}</span>
            </div>
            
            <div class="monitor-details">
              <div class="monitor-detail" v-if="monitor.responseTime">
                <i class="ti ti-clock"></i>
                <span>{{ monitor.responseTime }}ms</span>
              </div>
              <div class="monitor-detail">
                <i class="ti ti-calendar-time"></i>
                <span>{{ formatTime(monitor.lastCheck) }}</span>
              </div>
            </div>
            
            <div class="monitor-actions">
              <button @click="checkMonitor(monitor.id)" class="btn btn-small btn-primary">
                <i class="ti ti-refresh"></i>
                Check Now
              </button>
              <router-link :to="`/monitors/${monitor.id}`" class="btn btn-small btn-secondary">
                <i class="ti ti-eye"></i>
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
      activeCount: monitorsWithStatus.filter((m: any) => m.status === 'up').length,
      downCount: monitorsWithStatus.filter((m: any) => m.status === 'down').length,
      avgResponseTime: Math.floor(
        monitorsWithStatus
          .filter((m: any) => m.responseTime)
          .reduce((acc: number, m: any) => acc + m.responseTime, 0) /
        monitorsWithStatus.filter((m: any) => m.responseTime).length || 1
      )
    }

    // Fetch scheduler status
    try {
      schedulerStatus.value = await apiService.getSchedulerStatus()
    } catch (error) {
      console.warn('Could not fetch scheduler status:', error)
      schedulerStatus.value = null
    }

  } catch (error: any) {
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
  } catch (error: any) {
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
  } catch (error: any) {
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

const getMonitorClass = (status: string) => {
  return `monitor-${status || 'unknown'}`
}

const getMonitorIcon = (status: string) => {
  switch (status) {
    case 'up':
      return 'ti-circle-check'
    case 'down':
      return 'ti-circle-x'
    case 'error':
      return 'ti-alert-triangle'
    default:
      return 'ti-help-circle'
  }
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
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--gray-900);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
}

.page-title .ti {
  color: var(--primary);
  font-size: 2.5rem;
}

.page-subtitle {
  color: var(--gray-600);
  margin-top: 0.25rem;
  font-size: 0.9375rem;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

/* Alert */
.alert {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-radius: var(--radius-lg);
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow);
}

.alert-danger {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  border-left: 4px solid var(--danger);
  color: var(--gray-900);
}

.alert .ti {
  font-size: 1.5rem;
  color: var(--danger);
}

.alert strong {
  display: block;
  margin-bottom: 0.25rem;
}

.alert p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--gray-700);
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--gray-600);
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--gray-200);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.spinning {
  animation: spin 0.8s linear infinite;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
  border-left: 4px solid;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
}

.stat-primary {
  border-left-color: var(--primary);
  background: linear-gradient(135deg, #ffffff 0%, #f5f3ff 100%);
}

.stat-success {
  border-left-color: var(--success);
  background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%);
}

.stat-danger {
  border-left-color: var(--danger);
  background: linear-gradient(135deg, #ffffff 0%, #fef2f2 100%);
}

.stat-info {
  border-left-color: var(--info);
  background: linear-gradient(135deg, #ffffff 0%, #eff6ff 100%);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  flex-shrink: 0;
}

.stat-primary .stat-icon {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: white;
}

.stat-success .stat-icon {
  background: linear-gradient(135deg, var(--success) 0%, #059669 100%);
  color: white;
}

.stat-danger .stat-icon {
  background: linear-gradient(135deg, var(--danger) 0%, #dc2626 100%);
  color: white;
}

.stat-info .stat-icon {
  background: linear-gradient(135deg, var(--info) 0%, #2563eb 100%);
  color: white;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--gray-600);
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--gray-900);
  line-height: 1;
}

/* Scheduler Card */
.scheduler-card {
  background: white;
  padding: 1.5rem;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  margin-bottom: 2rem;
}

.scheduler-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.scheduler-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.scheduler-title .ti {
  font-size: 1.5rem;
  color: var(--primary);
}

.scheduler-title h3 {
  margin: 0;
  font-size: 1.125rem;
  color: var(--gray-900);
}

.scheduler-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: var(--radius);
  font-size: 0.875rem;
  font-weight: 600;
  background: var(--gray-100);
  color: var(--gray-700);
}

.scheduler-badge.active {
  background: linear-gradient(135deg, var(--success) 0%, #059669 100%);
  color: white;
}

.scheduler-stats {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.scheduler-stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--gray-600);
  font-size: 0.875rem;
}

.scheduler-stat .ti {
  color: var(--primary);
}

/* Monitors Section */
.monitors-section {
  background: white;
  padding: 1.5rem;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
}

.section-header {
  margin-bottom: 1.5rem;
}

.section-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--gray-900);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.section-header h2 .ti {
  color: var(--primary);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-state .ti {
  font-size: 4rem;
  color: var(--gray-300);
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: var(--gray-900);
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--gray-600);
  margin-bottom: 1.5rem;
}

/* Monitors Grid */
.monitors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.monitor-card {
  padding: 1.5rem;
  border-radius: var(--radius-lg);
  border-left: 4px solid var(--gray-300);
  background: white;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);
}

.monitor-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.monitor-up {
  border-left-color: var(--success);
  background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%);
}

.monitor-down {
  border-left-color: var(--danger);
  background: linear-gradient(135deg, #ffffff 0%, #fef2f2 100%);
}

.monitor-error {
  border-left-color: var(--warning);
  background: linear-gradient(135deg, #ffffff 0%, #fffbeb 100%);
}

.monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.monitor-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.monitor-title .ti {
  font-size: 1.5rem;
}

.monitor-up .monitor-title .ti {
  color: var(--success);
}

.monitor-down .monitor-title .ti {
  color: var(--danger);
}

.monitor-error .monitor-title .ti {
  color: var(--warning);
}

.monitor-title h3 {
  margin: 0;
  font-size: 1.125rem;
  color: var(--gray-900);
  font-weight: 600;
}

.status-badge {
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-badge.up {
  background: var(--success);
  color: white;
}

.status-badge.down {
  background: var(--danger);
  color: white;
}

.status-badge.error {
  background: var(--warning);
  color: white;
}

.status-badge.unknown {
  background: var(--gray-400);
  color: white;
}

.monitor-url {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--gray-600);
  margin-bottom: 1rem;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  word-break: break-all;
}

.monitor-url .ti {
  flex-shrink: 0;
  color: var(--gray-400);
}

.monitor-details {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.monitor-detail {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--gray-600);
}

.monitor-detail .ti {
  color: var(--gray-400);
}

.monitor-actions {
  display: flex;
  gap: 0.75rem;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .monitors-grid {
    grid-template-columns: 1fr;
  }
}
</style>
