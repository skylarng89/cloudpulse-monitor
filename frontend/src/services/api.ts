import type { Monitor, MonitorCheck, SchedulerStatus, UptimeStats, Incident, ApiResponse } from '@/types'

const API_BASE = '/api'

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${path}`
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    let data: unknown
    try {
      data = await response.json()
    } catch {
      data = await response.text()
    }
    throw new ApiError(
      (data as { message?: string })?.message || response.statusText,
      response.status,
      data
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}

export const api = {
  async getMonitors(): Promise<Monitor[]> {
    return request<Monitor[]>('/monitors')
  },

  async getMonitor(id: string): Promise<Monitor> {
    return request<Monitor>(`/monitors/${id}`)
  },

  async createMonitor(data: Partial<Monitor>): Promise<Monitor> {
    return request<Monitor>('/monitors', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async updateMonitor(id: string, data: Partial<Monitor>): Promise<Monitor> {
    return request<Monitor>(`/monitors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  async deleteMonitor(id: string): Promise<void> {
    return request<void>(`/monitors/${id}`, { method: 'DELETE' })
  },

  async getMonitorChecks(id: string, params?: Record<string, string | number>): Promise<MonitorCheck[]> {
    const query = params
      ? `?${new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]))}`
      : ''
    return request<MonitorCheck[]>(`/monitors/${id}/checks${query}`)
  },

  async getSchedulerStatus(): Promise<SchedulerStatus> {
    return request<SchedulerStatus>('/scheduler/status')
  },

  async startScheduler(): Promise<ApiResponse<void>> {
    return request<ApiResponse<void>>('/scheduler/start', { method: 'POST' })
  },

  async stopScheduler(): Promise<ApiResponse<void>> {
    return request<ApiResponse<void>>('/scheduler/stop', { method: 'POST' })
  },

  async restartScheduler(): Promise<ApiResponse<void>> {
    return request<ApiResponse<void>>('/scheduler/restart', { method: 'POST' })
  },

  async runMonitorCheck(id: string): Promise<MonitorCheck> {
    return request<MonitorCheck>(`/scheduler/run/${id}`, { method: 'POST' })
  },

  async checkAllMonitors(): Promise<ApiResponse<void>> {
    return request<ApiResponse<void>>('/monitors/check-all', { method: 'POST' })
  },

  async getSystemStatus(): Promise<{ status: string }> {
    return request<{ status: string }>('/status')
  },

  async getRecentChecks(limit = 50): Promise<MonitorCheck[]> {
    return request<MonitorCheck[]>(`/checks?limit=${limit}`)
  },

  async getIncidents(): Promise<Incident[]> {
    return request<Incident[]>('/incidents')
  },

  async getUptimeStats(days = 30): Promise<UptimeStats[]> {
    return request<UptimeStats[]>(`/uptime?days=${days}`)
  },
}

export { ApiError }
