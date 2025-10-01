import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message)

    // Handle common error cases
    if (error.response?.status === 404) {
      throw new Error('Resource not found')
    } else if (error.response?.status === 400) {
      throw new Error(error.response.data?.error || 'Invalid request')
    } else if (error.response?.status >= 500) {
      throw new Error('Server error occurred')
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout - please try again')
    } else if (!error.response) {
      throw new Error('Network error - please check your connection')
    }

    return Promise.reject(error)
  }
)

class ApiService {
  // Monitor Management
  async getMonitors() {
    const response = await api.get('/monitors')
    return response.data
  }

  async getMonitorById(id) {
    const response = await api.get(`/monitors/${id}`)
    return response.data
  }

  async createMonitor(monitorData) {
    const response = await api.post('/monitors', monitorData)
    return response.data
  }

  async updateMonitor(id, monitorData) {
    const response = await api.put(`/monitors/${id}`, monitorData)
    return response.data
  }

  async deleteMonitor(id) {
    const response = await api.delete(`/monitors/${id}`)
    return response.data
  }

  async getMonitorStats() {
    const response = await api.get('/monitors/stats')
    return response.data
  }

  // Monitor Checks
  async getMonitorChecks(monitorId, options = {}) {
    const params = new URLSearchParams()
    if (options.limit) params.append('limit', options.limit)
    if (options.hours) params.append('hours', options.hours)

    const response = await api.get(`/monitors/${monitorId}/checks?${params}`)
    return response.data
  }

  async getMonitorCheckStats(monitorId, hours = 24) {
    const response = await api.get(`/monitors/${monitorId}/stats?hours=${hours}`)
    return response.data
  }

  async checkMonitor(monitorId) {
    const response = await api.post(`/monitors/${monitorId}/check`)
    return response.data
  }

  // System Monitoring
  async getSystemStats(hours = 24) {
    const response = await api.get(`/system/stats?hours=${hours}`)
    return response.data
  }

  async getMonitoringStats(hours = 24) {
    const response = await api.get(`/monitoring/stats?hours=${hours}`)
    return response.data
  }

  async getHTTPStats(hours = 24) {
    const response = await api.get(`/monitoring/http-stats?hours=${hours}`)
    return response.data
  }

  // Scheduler Control
  async getSchedulerStatus() {
    const response = await api.get('/scheduler/status')
    return response.data
  }

  async getScheduleInfo() {
    const response = await api.get('/scheduler/schedule')
    return response.data
  }

  async startScheduler() {
    const response = await api.post('/scheduler/start')
    return response.data
  }

  async stopScheduler() {
    const response = await api.post('/scheduler/stop')
    return response.data
  }

  async restartScheduler() {
    const response = await api.post('/scheduler/restart')
    return response.data
  }

  async triggerManualCheck() {
    const response = await api.post('/scheduler/manual-check')
    return response.data
  }

  // Utility methods
  async healthCheck() {
    try {
      const response = await api.get('/monitors')
      return { status: 'ok', message: 'Backend connected successfully' }
    } catch (error) {
      return { status: 'error', message: error.message }
    }
  }

  // Batch operations
  async checkAllMonitors() {
    const response = await api.post('/monitors/check-all')
    return response.data
  }
}

export default new ApiService()