<template>
  <div class="reports-page">
    <div class="header">
      <h2>Uptime Reports</h2>
      <div class="report-actions">
        <button @click="generateReport" :disabled="loading" class="btn-primary">
          {{ loading ? 'Generating...' : 'Generate Report' }}
        </button>
      </div>
    </div>

    <!-- Connection Status -->
    <div v-if="connectionError" class="connection-error">
      <p>⚠️ Unable to connect to backend: {{ connectionError }}</p>
      <button @click="retryConnection" class="btn-secondary">Retry Connection</button>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !connectionError" class="loading-state">
      <p>Generating report...</p>
    </div>

    <!-- Report Filters -->
    <div v-if="!loading && !connectionError" class="reports-filters">
      <div class="filter-group">
        <label for="monitor-select">Monitor:</label>
        <select id="monitor-select" v-model="selectedMonitor">
          <option value="">All Monitors</option>
          <option v-for="monitor in monitors" :key="monitor.id" :value="monitor.id">
            {{ monitor.name }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label for="time-range">Time Range:</label>
        <select id="time-range" v-model="timeRange">
          <option value="1">Last Hour</option>
          <option value="24">Last 24 hours</option>
          <option value="168">Last 7 days</option>
          <option value="720">Last 30 days</option>
        </select>
      </div>
    </div>

    <!-- Report Content -->
    <div v-if="reportData && !loading && !connectionError" class="report-content">
      <!-- Report Summary -->
      <div class="report-summary">
        <h3>Report Summary</h3>
        <div class="summary-stats">
          <div class="summary-card">
            <h4>Uptime</h4>
            <p class="percentage">{{ reportData.uptimePercentage }}%</p>
          </div>
          <div class="summary-card">
            <h4>Total Checks</h4>
            <p>{{ reportData.totalChecks }}</p>
          </div>
          <div class="summary-card">
            <h4>Incidents</h4>
            <p>{{ reportData.totalIncidents }}</p>
          </div>
          <div class="summary-card">
            <h4>Avg Response Time</h4>
            <p>{{ reportData.avgResponseTime }}ms</p>
          </div>
        </div>
      </div>

      <!-- Uptime Trend Chart -->
      <div class="uptime-chart">
        <h3>Uptime Trend (Last {{ timeRange }}h)</h3>
        <div class="chart-container">
          <canvas ref="uptimeChart"></canvas>
        </div>
      </div>

      <!-- Response Time Chart -->
      <div class="response-time-chart">
        <h3>Response Time Trend (Last {{ timeRange }}h)</h3>
        <div class="chart-container">
          <canvas ref="responseTimeChart"></canvas>
        </div>
      </div>

      <!-- System Statistics -->
      <div class="system-stats">
        <h3>System Overview</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">Total Monitors:</span>
            <span class="stat-value">{{ systemStats.totalMonitors || 0 }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Active Monitors:</span>
            <span class="stat-value">{{ systemStats.activeMonitors || 0 }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">System Uptime:</span>
            <span class="stat-value">{{ systemStats.systemUptime || 'N/A' }}</span>
          </div>
        </div>
      </div>

      <!-- Recent Incidents -->
      <div class="incidents-list">
        <h3>Recent Incidents (Last {{ timeRange }}h)</h3>
        <div v-if="reportData.incidents.length === 0" class="no-incidents">
          <p>🎉 No incidents in the selected time period!</p>
        </div>
        <div v-else class="incidents">
          <div
            v-for="incident in reportData.incidents"
            :key="incident.id"
            class="incident-card"
          >
            <div class="incident-header">
              <span class="incident-status down">DOWN</span>
              <span class="incident-time">
                {{ formatDateTime(incident.startedAt) }} -
                {{ formatDateTime(incident.endedAt) }}
              </span>
            </div>
            <p class="incident-duration">
              Duration: {{ calculateDuration(incident.startedAt, incident.endedAt) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import axios from 'axios'
import { Chart, registerables } from 'chart.js'
import { format } from 'date-fns'

// Register Chart.js components
Chart.register(...registerables)

interface Monitor {
  id: number
  name: string
  url: string
  type: string
}

interface ReportData {
  uptimePercentage: number
  totalChecks: number
  totalIncidents: number
  avgResponseTime: number
  incidents: Array<{
    id: number
    startedAt: string
    endedAt: string
  }>
}

interface SystemStats {
  totalMonitors: number
  activeMonitors: number
  systemUptime: string
}

const monitors = ref<Monitor[]>([])
const selectedMonitor = ref('')
const timeRange = ref('24')
const reportData = ref<ReportData | null>(null)
const systemStats = ref<SystemStats>({
  totalMonitors: 0,
  activeMonitors: 0,
  systemUptime: 'N/A'
})
const loading = ref(false)
const connectionError = ref('')
const uptimeChart = ref<HTMLCanvasElement>()
const responseTimeChart = ref<HTMLCanvasElement>()

const fetchMonitors = async () => {
  try {
    const response = await axios.get('/api/monitors')
    monitors.value = response.data
  } catch (error) {
    console.error('Failed to fetch monitors:', error)
    connectionError.value = error.message || 'Failed to connect to backend'
  }
}

const generateReport = async () => {
  try {
    loading.value = true
    connectionError.value = ''

    const hours = parseInt(timeRange.value)

    // Fetch system statistics
    const systemResponse = await axios.get(`/api/system/stats?hours=${hours}`)
    systemStats.value = {
      totalMonitors: systemResponse.data.total || 0,
      activeMonitors: systemResponse.data.up_checks || 0,
      systemUptime: 'N/A' // Would need backend endpoint for this
    }

    // Fetch monitoring statistics
    const monitoringResponse = await axios.get(`/api/monitoring/stats?hours=${hours}`)

    // Generate mock report data based on real stats (for now)
    // In a full implementation, you'd have dedicated report endpoints
    reportData.value = {
      uptimePercentage: calculateUptimePercentage(monitoringResponse.data),
      totalChecks: monitoringResponse.data.total_checks || 0,
      totalIncidents: monitoringResponse.data.down_checks || 0,
      avgResponseTime: monitoringResponse.data.avg_response_time || 0,
      incidents: generateMockIncidents(hours)
    }

    await nextTick()
    createCharts()
  } catch (error) {
    console.error('Failed to generate report:', error)
    connectionError.value = error.message || 'Failed to generate report'
  } finally {
    loading.value = false
  }
}

const calculateUptimePercentage = (stats) => {
  if (!stats.total_checks || stats.total_checks === 0) return 100
  const upChecks = stats.up_checks || 0
  return Math.round((upChecks / stats.total_checks) * 100)
}

const generateMockIncidents = (hours) => {
  // Generate mock incidents for demonstration
  // In production, this would come from a real incidents table
  const incidents = []
  const now = new Date()

  // Generate 1-3 random incidents in the time period
  const incidentCount = Math.floor(Math.random() * 3) + 1

  for (let i = 0; i < incidentCount; i++) {
    const startTime = new Date(now.getTime() - (Math.random() * hours * 60 * 60 * 1000))
    const duration = Math.floor(Math.random() * 60) + 5 // 5-65 minutes

    incidents.push({
      id: i + 1,
      startedAt: startTime.toISOString(),
      endedAt: new Date(startTime.getTime() + duration * 60 * 1000).toISOString()
    })
  }

  return incidents.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
}

const createCharts = () => {
  if (!reportData.value) return

  // Destroy existing charts if they exist
  Chart.getChart(uptimeChart.value)?.destroy()
  Chart.getChart(responseTimeChart.value)?.destroy()

  const hours = parseInt(timeRange.value)

  // Uptime chart
  if (uptimeChart.value) {
    new Chart(uptimeChart.value, {
      type: 'line',
      data: {
        labels: generateTimeLabels(hours),
        datasets: [{
          label: 'Uptime %',
          data: generateUptimeData(hours),
          borderColor: '#27ae60',
          backgroundColor: 'rgba(39, 174, 96, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: 'Uptime %'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Time'
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    })
  }

  // Response time chart
  if (responseTimeChart.value) {
    new Chart(responseTimeChart.value, {
      type: 'line',
      data: {
        labels: generateTimeLabels(hours),
        datasets: [{
          label: 'Response Time (ms)',
          data: generateResponseTimeData(hours),
          borderColor: '#3498db',
          backgroundColor: 'rgba(52, 152, 219, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Response Time (ms)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Time'
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    })
  }
}

const generateTimeLabels = (hours) => {
  const labels = []
  const now = new Date()

  if (hours <= 24) {
    // Hourly labels for 24h or less
    for (let i = hours; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000)
      labels.push(format(time, 'HH:mm'))
    }
  } else {
    // Daily labels for longer periods
    const days = Math.ceil(hours / 24)
    for (let i = days; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      labels.push(format(time, 'MMM dd'))
    }
  }

  return labels
}

const generateUptimeData = (hours) => {
  // Generate realistic uptime data (mostly high with occasional dips)
  const data = []
  const baseUptime = 99 + Math.random() * 0.9 // 99-99.9% base uptime

  for (let i = 0; i <= hours; i++) {
    let uptime = baseUptime

    // Occasional downtime for realism
    if (Math.random() < 0.1) { // 10% chance of issues
      uptime = Math.random() * 50 // 0-50% uptime during issues
    }

    data.push(Math.round(uptime * 100) / 100)
  }

  return data
}

const generateResponseTimeData = (hours) => {
  // Generate realistic response time data
  const data = []
  const baseResponseTime = 200 + Math.random() * 100 // 200-300ms base

  for (let i = 0; i <= hours; i++) {
    let responseTime = baseResponseTime

    // Occasional slow responses for realism
    if (Math.random() < 0.15) { // 15% chance of slow responses
      responseTime = 800 + Math.random() * 2000 // 800-2800ms
    }

    data.push(Math.round(responseTime))
  }

  return data
}

const formatDateTime = (dateString: string) => {
  return format(new Date(dateString), 'MMM dd, yyyy HH:mm')
}

const calculateDuration = (start: string, end: string) => {
  const duration = new Date(end).getTime() - new Date(start).getTime()
  const minutes = Math.floor(duration / (1000 * 60))

  if (minutes < 60) {
    return `${minutes}m`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours}h ${remainingMinutes}m`
}

const retryConnection = () => {
  generateReport()
}

// Auto-generate report when filters change
watch([selectedMonitor, timeRange], () => {
  if (timeRange.value) {
    generateReport()
  }
})

onMounted(async () => {
  await fetchMonitors()

  if (monitors.value.length > 0) {
    generateReport()
  }
})
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.report-actions {
  display: flex;
  gap: 1rem;
}

.btn-primary {
  background: #3498db;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.btn-primary:hover {
  background: #2980b9;
}

.btn-primary:disabled {
  background: #95a5a6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.btn-secondary:hover {
  background: #7f8c8d;
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

.reports-filters {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  gap: 1rem;
  align-items: end;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 500;
  font-size: 0.9rem;
}

.filter-group select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-width: 150px;
}

.report-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.report-summary {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.report-summary h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #2c3e50;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.summary-card {
  text-align: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.summary-card h4 {
  margin: 0 0 0.5rem 0;
  color: #7f8c8d;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-card p {
  margin: 0;
  font-size: 1.8rem;
  font-weight: bold;
  color: #2c3e50;
}

.percentage {
  color: #27ae60 !important;
}

.chart-container {
  height: 300px;
  position: relative;
}

.uptime-chart,
.response-time-chart,
.system-stats,
.incidents-list {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.uptime-chart h3,
.response-time-chart h3,
.system-stats h3,
.incidents-list h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.stat-label {
  font-weight: 500;
  color: #7f8c8d;
}

.stat-value {
  font-weight: bold;
  color: #2c3e50;
}

.no-incidents {
  text-align: center;
  padding: 2rem;
  color: #27ae60;
}

.no-incidents p {
  font-size: 1.1rem;
  margin: 0;
}

.incidents {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.incident-card {
  padding: 1rem;
  border: 1px solid #e74c3c;
  border-radius: 6px;
  background: #fff8f8;
}

.incident-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.incident-status {
  background: #e74c3c;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
}

.incident-time {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.incident-duration {
  margin: 0;
  font-size: 0.9rem;
  color: #e74c3c;
  font-weight: 500;
}
</style>