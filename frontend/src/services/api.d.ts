/**
 * Type declarations for api.js
 */

export interface Monitor {
  id: number
  name: string
  url: string
  type: string
  interval_seconds: number
  timeout_seconds?: number
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export interface MonitorCheck {
  id: number
  monitor_id: number
  status_code: number | null
  response_time_ms: number | null
  is_up: boolean
  error_message: string | null
  checked_at: string
  status?: string
  response_time?: number
}

export interface SchedulerStatus {
  isRunning: boolean
  scheduledJobs: number
  stats?: {
    totalChecks: number
    lastCheck: string | null
    lastRun?: string | null
    errors: number
  }
  uptime: number | null
}

declare class ApiService {
  // Monitor management
  getMonitors(): Promise<Monitor[]>
  getMonitor(id: number): Promise<Monitor>
  createMonitor(monitorData: Partial<Monitor>): Promise<Monitor>
  updateMonitor(id: number, monitorData: Partial<Monitor>): Promise<Monitor>
  deleteMonitor(id: number): Promise<void>
  getMonitorChecks(id: number, params?: Record<string, any>): Promise<MonitorCheck[]>
  
  // Monitoring system
  checkMonitor(id: number): Promise<any>
  triggerManualCheck(): Promise<any>
  getSchedulerStatus(): Promise<SchedulerStatus>
}

declare const apiService: ApiService
export default apiService
