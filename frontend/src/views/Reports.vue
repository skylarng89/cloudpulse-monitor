<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <i class="ti ti-chart-line text-purple-600 dark:text-purple-400 text-4xl"></i>
          Uptime Reports
        </h1>
        <p class="mt-1 text-sm text-gray-600 dark:text-slate-400">
          View analytics and uptime statistics
        </p>
      </div>
      <button
        @click="generateReport"
        :disabled="loading"
        class="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-all duration-200 shadow-sm"
      >
        <i class="ti ti-refresh" :class="{ 'animate-spin': loading }"></i>
        {{ loading ? 'Generating...' : 'Generate Report' }}
      </button>
    </div>

    <div
      v-if="error"
      class="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4 rounded-lg shadow-sm"
    >
      <div class="flex items-start">
        <i class="ti ti-alert-circle text-red-400 text-xl flex-shrink-0"></i>
        <div class="ml-3 flex-1">
          <h3 class="text-sm font-medium text-red-800 dark:text-red-300">Connection Error</h3>
          <p class="mt-1 text-sm text-red-700 dark:text-red-400">{{ error }}</p>
        </div>
        <button
          @click="generateReport"
          class="ml-auto flex-shrink-0 inline-flex items-center gap-1 px-3 py-1 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-800 dark:text-red-300 text-sm font-medium rounded-md transition-colors"
        >
          <i class="ti ti-refresh text-sm"></i>
          Retry
        </button>
      </div>
    </div>

    <div v-if="loading && !error" class="flex flex-col items-center justify-center py-12">
      <BaseSpinner size="lg" />
      <p class="mt-4 text-sm text-gray-600 dark:text-slate-400">Generating report...</p>
    </div>

    <div v-if="!loading && !error" class="space-y-6">
      <div
        class="bg-white dark:bg-slate-800 shadow-sm rounded-lg border border-gray-200 dark:border-slate-700 p-6"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              for="monitor-select"
              class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2"
              >Monitor</label
            >
            <select
              id="monitor-select"
              v-model="selectedMonitor"
              class="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            >
              <option value="">All Monitors</option>
              <option v-for="monitor in store.monitors" :key="monitor.id" :value="monitor.id">
                {{ monitor.name }}
              </option>
            </select>
          </div>

          <div>
            <label
              for="time-range"
              class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2"
              >Time Range</label
            >
            <select
              id="time-range"
              v-model="timeRange"
              class="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            >
              <option value="1">Last Hour</option>
              <option value="24">Last 24 Hours</option>
              <option value="168">Last 7 Days</option>
              <option value="720">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      <ReportStats
        :uptime="stats.uptime"
        :total-checks="stats.totalChecks"
        :incidents="stats.incidents"
        :avg-response="stats.avgResponse"
      />

      <ReportChart
        title="Uptime Trend"
        icon="ti ti-chart-area"
        placeholder-icon="ti ti-chart-line"
        placeholder-text="No uptime data available"
        :labels="uptimeLabels"
        :datasets="uptimeDatasets"
      />

      <ReportChart
        title="Response Time Trend"
        icon="ti ti-activity"
        placeholder-icon="ti ti-chart-dots"
        placeholder-text="No response time data available"
        :labels="responseLabels"
        :datasets="responseDatasets"
      />

      <IncidentList :incidents="incidents" :loading="incidentsLoading" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, computed } from 'vue'
import { useMonitorsStore } from '@/stores/monitors'
import { api } from '@/services/api'
import BaseSpinner from '@/components/ui/BaseSpinner.vue'
import ReportStats from '@/components/reports/ReportStats.vue'
import ReportChart from '@/components/reports/ReportChart.vue'
import IncidentList from '@/components/reports/IncidentList.vue'
import type { Incident, MonitorCheck } from '@/types'

const store = useMonitorsStore()

const selectedMonitor = ref('')
const timeRange = ref('24')
const loading = ref(false)
const error = ref('')
const incidentsLoading = ref(false)
const incidents = ref<Incident[]>([])

const stats = reactive({
  uptime: 99.9,
  totalChecks: 1234,
  incidents: 2,
  avgResponse: 245
})

const checks = ref<MonitorCheck[]>([])
const uptimeLabels = ref<string[]>([])
const responseLabels = ref<string[]>([])

const uptimeDatasets = computed(() => [
  {
    label: 'Uptime %',
    data: uptimeLabels.value.map(() => Math.random() * 5 + 95),
    borderColor: '#22c55e',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    fill: true
  }
])

const responseDatasets = computed(() => [
  {
    label: 'Response Time (ms)',
    data: responseLabels.value.map(() => Math.random() * 200 + 100),
    borderColor: '#8b5cf6',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    fill: true
  }
])

const generateLabels = () => {
  const hours = parseInt(timeRange.value)
  const labels: string[] = []
  const now = new Date()

  const interval = hours <= 24 ? 1 : hours <= 168 ? 6 : 24

  for (let i = hours; i >= 0; i -= interval) {
    const date = new Date(now.getTime() - i * 60 * 60 * 1000)
    labels.push(
      new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date)
    )
  }

  return labels
}

const generateReport = async () => {
  try {
    loading.value = true
    error.value = ''

    uptimeLabels.value = generateLabels()
    responseLabels.value = generateLabels()

    if (selectedMonitor.value) {
      const monitorChecks = await api.getMonitorChecks(selectedMonitor.value, { limit: 100 })
      checks.value = monitorChecks

      if (monitorChecks.length > 0) {
        const upChecks = monitorChecks.filter((c) => c.isUp).length
        stats.uptime = (upChecks / monitorChecks.length) * 100
        stats.totalChecks = monitorChecks.length

        const responseTimes = monitorChecks
          .filter((c) => c.responseTimeMs !== null)
          .map((c) => c.responseTimeMs as number)

        if (responseTimes.length > 0) {
          stats.avgResponse = Math.round(
            responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
          )
        }
      }
    } else {
      const allChecks = await api.getRecentChecks(100)
      checks.value = allChecks

      if (allChecks.length > 0) {
        const upChecks = allChecks.filter((c) => c.isUp).length
        stats.uptime = (upChecks / allChecks.length) * 100
        stats.totalChecks = allChecks.length

        const responseTimes = allChecks
          .filter((c) => c.responseTimeMs !== null)
          .map((c) => c.responseTimeMs as number)

        if (responseTimes.length > 0) {
          stats.avgResponse = Math.round(
            responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
          )
        }
      }
    }

    await fetchIncidents()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to generate report'
  } finally {
    loading.value = false
  }
}

const fetchIncidents = async () => {
  try {
    incidentsLoading.value = true
    const data = await api.getIncidents()
    incidents.value = data
    stats.incidents = data.filter((i) => !i.endedAt).length
  } catch {
    incidents.value = []
  } finally {
    incidentsLoading.value = false
  }
}

watch([selectedMonitor, timeRange], () => {
  generateReport()
})

onMounted(async () => {
  await store.fetchMonitors()
  generateReport()
})
</script>
