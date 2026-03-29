import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Monitor, MonitorCheck, SchedulerStatus } from '@/types'
import { api } from '@/services/api'

export const useMonitorsStore = defineStore('monitors', () => {
  const monitors = ref<Monitor[]>([])
  const checks = ref<Map<number, MonitorCheck[]>>(new Map())
  const schedulerStatus = ref<SchedulerStatus | null>(null)
  const checkingMonitors = ref<Set<number>>(new Set())
  const loading = ref(false)
  const error = ref<string | null>(null)

  const activeMonitors = computed(() => monitors.value.filter((m) => m.is_active ?? m.isActive))
  const monitorsUp = computed(() => monitors.value.filter((m) => m.status === 'up').length)
  const monitorsDown = computed(
    () => monitors.value.filter((m) => m.status === 'down' || m.status === 'error').length
  )

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

  async function fetchMonitorChecks(monitorId: number | string, limit = 100) {
    try {
      const result = await api.getMonitorChecks(String(monitorId), { limit })
      checks.value.set(Number(monitorId), result)
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

  async function updateMonitor(id: number | string, data: Partial<Monitor>) {
    const monitor = await api.updateMonitor(String(id), data)
    const index = monitors.value.findIndex((m) => m.id === id || m.id === String(id))
    if (index > -1) {
      monitors.value[index] = monitor
    }
    return monitor
  }

  async function deleteMonitor(id: number | string) {
    await api.deleteMonitor(String(id))
    monitors.value = monitors.value.filter((m) => m.id !== id && m.id !== String(id))
    checks.value.delete(Number(id))
  }

  async function runCheck(id: number | string) {
    const numId = Number(id)
    checkingMonitors.value.add(numId)
    try {
      const check = await api.runMonitorCheck(String(id))
      const monitor = monitors.value.find((m) => m.id === id || m.id === String(id))
      if (monitor) {
        monitor.status = check.isUp ? 'up' : 'down'
      }
      const existingChecks = checks.value.get(numId) || []
      checks.value.set(numId, [check, ...existingChecks])
      return check
    } finally {
      checkingMonitors.value.delete(numId)
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

  function isChecking(id: number | string) {
    return checkingMonitors.value.has(Number(id))
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
    isChecking
  }
})
