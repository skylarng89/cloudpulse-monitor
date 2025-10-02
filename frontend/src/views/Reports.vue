<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <i class="ti ti-chart-line text-purple-600 text-4xl"></i>
          Uptime Reports
        </h1>
        <p class="mt-1 text-sm text-gray-600">View analytics and uptime statistics</p>
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

    <!-- Connection Error -->
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
      <p class="mt-4 text-sm text-gray-600">Generating report...</p>
    </div>

    <!-- Report Content -->
    <div v-if="!loading && !connectionError" class="space-y-6">
      <!-- Filters -->
      <div class="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="monitor-select" class="block text-sm font-medium text-gray-700 mb-2">Monitor</label>
            <select
              id="monitor-select"
              v-model="selectedMonitor"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            >
              <option value="">All Monitors</option>
              <option v-for="monitor in monitors" :key="monitor.id" :value="monitor.id">
                {{ monitor.name }}
              </option>
            </select>
          </div>

          <div>
            <label for="time-range" class="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
            <select
              id="time-range"
              v-model="timeRange"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            >
              <option value="1">Last Hour</option>
              <option value="24">Last 24 Hours</option>
              <option value="168">Last 7 Days</option>
              <option value="720">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Summary Stats -->
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div class="bg-white overflow-hidden shadow-sm rounded-lg border-l-4 border-green-500">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                  <i class="ti ti-circle-check text-white text-2xl"></i>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Uptime</dt>
                  <dd class="text-3xl font-bold text-green-600">99.9%</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow-sm rounded-lg border-l-4 border-blue-500">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                  <i class="ti ti-check text-white text-2xl"></i>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Total Checks</dt>
                  <dd class="text-3xl font-bold text-gray-900">1,234</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow-sm rounded-lg border-l-4 border-red-500">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
                  <i class="ti ti-alert-triangle text-white text-2xl"></i>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Incidents</dt>
                  <dd class="text-3xl font-bold text-gray-900">2</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow-sm rounded-lg border-l-4 border-purple-500">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                  <i class="ti ti-clock text-white text-2xl"></i>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Avg Response</dt>
                  <dd class="text-3xl font-bold text-gray-900">245ms</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Placeholder -->
      <div class="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <i class="ti ti-chart-area text-purple-600"></i>
          Uptime Trend
        </h3>
        <div class="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div class="text-center">
            <i class="ti ti-chart-line text-gray-400 text-5xl"></i>
            <p class="mt-2 text-sm text-gray-600">Chart visualization coming soon</p>
          </div>
        </div>
      </div>

      <div class="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <i class="ti ti-activity text-purple-600"></i>
          Response Time Trend
        </h3>
        <div class="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div class="text-center">
            <i class="ti ti-chart-dots text-gray-400 text-5xl"></i>
            <p class="mt-2 text-sm text-gray-600">Chart visualization coming soon</p>
          </div>
        </div>
      </div>

      <!-- Recent Incidents -->
      <div class="bg-white shadow-sm rounded-lg border border-gray-200">
        <div class="px-6 py-5 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900 flex items-center gap-2">
            <i class="ti ti-alert-circle text-purple-600"></i>
            Recent Incidents
          </h3>
        </div>
        <div class="px-6 py-12 text-center">
          <i class="ti ti-circle-check text-green-300 text-6xl"></i>
          <h4 class="mt-4 text-lg font-medium text-gray-900">No incidents!</h4>
          <p class="mt-2 text-sm text-gray-600">All systems are running smoothly in the selected time period.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import apiService from '@/services/api'

interface Monitor {
  id: number
  name: string
  url: string
  type: string
}

const monitors = ref<Monitor[]>([])
const selectedMonitor = ref('')
const timeRange = ref('24')
const loading = ref(false)
const connectionError = ref('')

const fetchMonitors = async () => {
  try {
    const data = await apiService.getMonitors()
    monitors.value = data
  } catch (error: any) {
    console.error('Failed to fetch monitors:', error)
  }
}

const generateReport = async () => {
  try {
    loading.value = true
    connectionError.value = ''
    
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 1000))
    
  } catch (error: any) {
    connectionError.value = error.message || 'Failed to generate report'
  } finally {
    loading.value = false
  }
}

const retryConnection = () => {
  generateReport()
}

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
