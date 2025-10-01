<template>
  <div class="reports-page">
    <h2>Uptime Reports</h2>

    <div class="reports-filters">
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
          <option value="24h">Last 24 hours</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      <button @click="generateReport" class="btn-primary">
        Generate Report
      </button>
    </div>

    <div v-if="reportData" class="report-content">
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

      <div class="uptime-chart">
        <h3>Uptime Trend</h3>
        <div class="chart-container">
          <canvas ref="uptimeChart"></canvas>
        </div>
      </div>

      <div class="response-time-chart">
        <h3>Response Time Trend</h3>
        <div class="chart-container">
          <canvas ref="responseTimeChart"></canvas>
        </div>
      </div>

      <div class="incidents-list">
        <h3>Recent Incidents</h3>
        <div class="incidents">
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
import { ref, onMounted, nextTick } from 'vue'
import axios from 'axios'
import { Chart, registerables } from 'chart.js'
import { format } from 'date-fns'

// Register Chart.js components
Chart.register(...registerables)

interface Monitor {
  id: number
  name: string
  url: string
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

const monitors = ref<Monitor[]>([])
const selectedMonitor = ref('')
const timeRange = ref('7d')
const reportData = ref<ReportData | null>(null)
const uptimeChart = ref<HTMLCanvasElement>()
const responseTimeChart = ref<HTMLCanvasElement>()

const fetchMonitors = async () => {
  try {
    const response = await axios.get('/api/monitors')
    monitors.value = response.data
  } catch (error) {
    console.error('Failed to fetch monitors:', error)
  }
}

const generateReport = async () => {
  try {
    // Mock report data for now
    reportData.value = {
      uptimePercentage: 99.2,
      totalChecks: 168,
      totalIncidents: 2,
      avgResponseTime: 245,
      incidents: [
        {
          id: 1,
          startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          endedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString()
        },
        {
          id: 2,
          startedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          endedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 8 * 60 * 1000).toISOString()
        }
      ]
    }

    await nextTick()
    createCharts()
  } catch (error) {
    console.error('Failed to generate report:', error)
  }
}

const createCharts = () => {
  if (!reportData.value) return

  // Uptime chart
  if (uptimeChart.value) {
    new Chart(uptimeChart.value, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Uptime %',
          data: [99.8, 98.5, 99.9, 99.2, 100, 99.7, 99.5],
          borderColor: '#27ae60',
          backgroundColor: 'rgba(39, 174, 96, 0.1)',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100
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
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Response Time (ms)',
          data: [220, 280, 190, 245, 210, 260, 235],
          borderColor: '#3498db',
          backgroundColor: 'rgba(52, 152, 219, 0.1)',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    })
  }
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

onMounted(() => {
  fetchMonitors()
})
</script>

<style scoped>
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
.incidents-list {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.uptime-chart h3,
.response-time-chart h3,
.incidents-list h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #2c3e50;
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