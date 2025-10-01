<template>
  <div class="dashboard">
    <div class="stats-grid">
      <div class="stat-card">
        <h3>Total Monitors</h3>
        <p class="stat-number">{{ totalMonitors }}</p>
      </div>
      <div class="stat-card">
        <h3>Up</h3>
        <p class="stat-number up">{{ upCount }}</p>
      </div>
      <div class="stat-card">
        <h3>Down</h3>
        <p class="stat-number down">{{ downCount }}</p>
      </div>
      <div class="stat-card">
        <h3>Avg Response</h3>
        <p class="stat-number">{{ avgResponseTime }}ms</p>
      </div>
    </div>

    <div class="monitors-section">
      <h2>Monitor Status</h2>
      <div class="monitors-grid">
        <div
          v-for="monitor in monitors"
          :key="monitor.id"
          class="monitor-card"
          :class="{ up: monitor.status === 'up', down: monitor.status === 'down' }"
        >
          <div class="monitor-header">
            <h3>{{ monitor.name }}</h3>
            <span class="status-badge" :class="monitor.status">
              {{ monitor.status }}
            </span>
          </div>
          <p class="monitor-url">{{ monitor.url }}</p>
          <div class="monitor-details">
            <span>Response: {{ monitor.responseTime }}ms</span>
            <span>Last Check: {{ formatTime(monitor.lastCheck) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { format } from 'date-fns'

interface Monitor {
  id: number
  name: string
  url: string
  status: 'up' | 'down'
  responseTime: number
  lastCheck: string
}

const monitors = ref<Monitor[]>([])
const totalMonitors = ref(0)
const upCount = ref(0)
const downCount = ref(0)
const avgResponseTime = ref(0)

const fetchMonitors = async () => {
  try {
    const response = await axios.get('/api/monitors')
    monitors.value = response.data.map((monitor: any) => ({
      ...monitor,
      status: Math.random() > 0.8 ? 'down' : 'up', // Mock status for now
      responseTime: Math.floor(Math.random() * 1000),
      lastCheck: new Date().toISOString()
    }))

    totalMonitors.value = monitors.value.length
    upCount.value = monitors.value.filter(m => m.status === 'up').length
    downCount.value = monitors.value.filter(m => m.status === 'down').length
    avgResponseTime.value = Math.floor(
      monitors.value.reduce((acc, m) => acc + m.responseTime, 0) / monitors.value.length
    )
  } catch (error) {
    console.error('Failed to fetch monitors:', error)
  }
}

const formatTime = (dateString: string) => {
  return format(new Date(dateString), 'MMM dd, HH:mm')
}

onMounted(() => {
  fetchMonitors()
  // Refresh every 30 seconds
  setInterval(fetchMonitors, 30000)
})
</script>

<style scoped>
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

.monitors-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.monitors-section h2 {
  margin-top: 0;
  margin-bottom: 1rem;
}

.monitors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.monitor-card {
  padding: 1rem;
  border-radius: 6px;
  border-left: 4px solid #bdc3c7;
}

.monitor-card.up {
  border-left-color: #27ae60;
  background: #f8fff8;
}

.monitor-card.down {
  border-left-color: #e74c3c;
  background: #fff8f8;
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

.monitor-url {
  color: #7f8c8d;
  margin: 0.5rem 0;
  font-family: monospace;
}

.monitor-details {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #7f8c8d;
}
</style>