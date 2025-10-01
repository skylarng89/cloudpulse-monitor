import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:3000/api',  // ← Point to backend server
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`)
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
    console.log(`API Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error('API Response Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    })

    // Transform error for better handling
    const customError = new Error(error.response?.data?.error || error.message)
    customError.status = error.response?.status
    customError.response = error.response

    return Promise.reject(customError)
  }
)

class ApiService {
  // Monitor management
  async getMonitors() {
    const response = await api.get('/monitors')
    return response.data
  }

  async getMonitor(id) {
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

  async getMonitorChecks(id) {
    const response = await api.get(`/monitors/${id}/checks`)
    return response.data
  }

  // Monitoring system
  async getSystemStatus() {
    const response = await api.get('/status')
    return response.data
  }

  async getRecentChecks(limit = 50) {
    const response = await api.get(`/checks?limit=${limit}`)
    return response.data
  }

  async getIncidents() {
    const response = await api.get('/incidents')
    return response.data
  }

  async getUptimeStats(days = 30) {
    const response = await api.get(`/uptime?days=${days}`)
    return response.data
  }

  // Scheduler management
  async getSchedulerStatus() {
    const response = await api.get('/scheduler/status')
    return response.data
  }

  async getScheduledJobs() {
    const response = await api.get('/scheduler/jobs')
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

  async runMonitorCheck(monitorId) {
    const response = await api.post(`/scheduler/run/${monitorId}`)
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