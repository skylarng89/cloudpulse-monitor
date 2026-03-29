export interface Monitor {
  id: number | string
  name: string
  url: string
  type: string
  interval_seconds: number
  intervalSeconds?: number
  timeout_seconds?: number
  timeoutSeconds?: number
  is_active?: boolean
  isActive?: boolean
  created_at?: string
  createdAt?: string
  updated_at?: string
  updatedAt?: string
  status?: string
  lastCheck?: MonitorCheck
}

export interface MonitorCheck {
  id: string
  monitorId: string
  statusCode: number | null
  responseTimeMs: number | null
  isUp: boolean
  errorMessage: string | null
  checkedAt: string
}

export interface SchedulerStatus {
  running: boolean
  activeJobs: number
  totalChecks: number
  uptime: number
  lastCheck: string | null
  errors: number
}

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface UptimeStats {
  monitorId: string
  uptimePercentage: number
  totalChecks: number
  upChecks: number
  downChecks: number
  avgResponseTimeMs: number
  period: {
    start: string
    end: string
  }
}

export interface Incident {
  id: string
  monitorId: string
  monitorName: string
  startedAt: string
  endedAt: string | null
  duration: number | null
  errorMessage: string
}

export type MonitorStatus = 'up' | 'down' | 'checking' | 'unknown'

export interface MonitorFormData {
  name: string
  url: string
  type: 'HTTP' | 'HTTPS' | 'PING' | 'TCP'
  intervalSeconds: number
  timeoutSeconds: number
  isActive: boolean
}
