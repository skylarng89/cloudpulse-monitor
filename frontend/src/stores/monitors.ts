import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Monitor, MonitorCheck, SchedulerStatus } from '@/types'
import { api } from '@/services/api'

export const useMonitorsStore = defineStore('monitors', () => {
  const monitors = ref<Monitor[]>([])
  const checks = ref<Map<string, MonitorCheck[]>>(new Map())
  const schedulerStatus = ref<SchedulerStatus | null>(null)
  const checkingMonitors = ref<Set<string>>(new Set())
  const loading = ref(false)
  const error = ref<string | null>(null)

  const activeMonitors = computed(() => monitors.value.filter(m => m.isActive))
  const monitorsUp = computed(() => monitors.value.filter(m => m.lastCheck?.isUp).length)
  const monitorsDown = computed(() => monitors.value.filter(m => m.lastCheck && !m.lastCheck.isUp).length)

  async function fetchMonitors() {
    loading.value = true
    error.value = null
    try {
      monitors.value = await api.getMonitors()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch monitors'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchMonitorChecks(monitorId: string, limit = 100) {
    try {
      const result = await api.getMonitorChecks(monitorId, { limit })
      checks.value.set(monitorId, result)
      return result
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch checks'
      throw e
    }
  }

  async function fetchSchedulerStatus() {
    try {
      schedulerStatus.value = await api.getSchedulerStatus()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch scheduler status'
      throw e
    }
  }

  async function createMonitor(data: Partial<Monitor>) {
    const monitor = await api.createMonitor(data)
    monitors.value.push(monitor)
    return monitor
  }

  async function updateMonitor(id: string, data: Partial<Monitor>) {
    const monitor = await api.updateMonitor(id, data)
    const index = monitors.value.findIndex(m => m.id === id)
    if (index > -1) {
      monitors.value[index] = monitor
    }
    return monitor
  }

  async function deleteMonitor(id: string) {
    await api.deleteMonitor(id)
    monitors.value = monitors.value.filter(m => m.id !== id)
    checks.value.delete(id)
  }

  async function runCheck(id: string) {
    checkingMonitors.value.add(id)
    try {
      const check = await api.runMonitorCheck(id)
      const monitor = monitors.value.find(m => m.id === id)
      if (monitor) {
        monitor.lastCheck = check
      }
      const existingChecks = checks.value.get(id) || []
      checks.value.set(id, [check, ...existingChecks])
      return check
    } finally {
      checkingMonitors.value.delete(id)
    }
  }

  async function startScheduler() {
    await api.startScheduler()
    await fetchSchedulerStatus()
  }

  async function stopScheduler() {
    await api.stopScheduler()
    await fetchSchedulerStatus()
  }

  async function restartScheduler() {
    await api.restartScheduler()
    await fetchSchedulerStatus()
  }

  function isChecking(id: string) {
    return checkingMonitors.value.has(id)
  }

  return {
    monitors,
    checks,
    schedulerStatus,
    checkingMonitors,
    loading,
    error,
    activeMonitors,
    monitorsUp,
    monitorsDown,
    fetchMonitors,
    fetchMonitorChecks,
    fetchSchedulerStatus,
    createMonitor,
    updateMonitor,
    deleteMonitor,
    runCheck,
    startScheduler,
    stopScheduler,
    restartScheduler,
    isChecking,
  }
})
