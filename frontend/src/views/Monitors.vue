<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <i class="ti ti-server text-purple-600 dark:text-purple-400 text-4xl"></i>
          Monitor Management
        </h1>
        <p class="mt-1 text-sm text-gray-600 dark:text-slate-400">
          Manage your monitoring endpoints
        </p>
      </div>
      <div class="flex items-center gap-3">
        <button
          v-if="selectedMonitors.size > 0"
          @click="confirmBulkDelete"
          class="w-full text-center inline-flex items-center gap-2 px-4 py-2 bg-red-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 shadow-sm"
        >
          <i class="ti ti-trash"></i>
          Delete Selected ({{ selectedMonitors.size }})
        </button>

        <div class="relative max-w-xs w-full">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i class="ti ti-search text-gray-400"></i>
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search monitors..."
            class="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
          />
          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <i class="ti ti-x text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"></i>
          </button>
        </div>
        <button
          @click="showAddForm = true"
          class="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 shadow-sm flex-shrink-0"
        >
          <i class="ti ti-plus"></i>
          Add Monitor
        </button>
      </div>
    </div>

    <div
      v-if="store.error"
      class="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4 rounded-lg shadow-sm"
    >
      <div class="flex items-start">
        <i class="ti ti-alert-circle text-red-400 text-xl flex-shrink-0"></i>
        <div class="ml-3 flex-1">
          <h3 class="text-sm font-medium text-red-800 dark:text-red-300">Connection Error</h3>
          <p class="mt-1 text-sm text-red-700 dark:text-red-400">{{ store.error }}</p>
        </div>
        <button
          @click="store.fetchMonitors()"
          class="ml-auto flex-shrink-0 inline-flex items-center gap-1 px-3 py-1 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-800 dark:text-red-300 text-sm font-medium rounded-md transition-colors"
        >
          <i class="ti ti-refresh text-sm"></i>
          Retry
        </button>
      </div>
    </div>

    <div
      v-if="store.loading && !store.error"
      class="flex flex-col items-center justify-center py-12"
    >
      <BaseSpinner size="lg" />
      <p class="mt-4 text-sm text-gray-600 dark:text-slate-400">Loading monitors...</p>
    </div>

    <MonitorTable
      v-if="!store.loading && !store.error"
      :monitors="store.monitors"
      :search-query="searchQuery"
      :current-page="currentPage"
      :page-size="pageSize"
      :selected-monitors="selectedMonitors"
      :checking-ids="store.checkingMonitors"
      @clear-search="searchQuery = ''"
      @toggle-select-all="toggleSelectAll"
      @toggle-selection="toggleMonitorSelection"
      @check="checkMonitor"
      @edit="startEdit"
      @delete="confirmDelete"
      @page-change="goToPage"
    />

    <MonitorFormModal
      v-model="showAddForm"
      :monitor="editingMonitor"
      :submitting="submitting"
      @submit="handleSubmit"
    />

    <DeleteConfirmModal
      v-model="showDeleteConfirm"
      :monitor="deleteTarget"
      :deleting="deleting"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useMonitorsStore } from '@/stores/monitors'
import { useToast } from '@/composables/useToast'
import MonitorTable from '@/components/monitors/MonitorTable.vue'
import MonitorFormModal from '@/components/monitors/MonitorFormModal.vue'
import DeleteConfirmModal from '@/components/monitors/DeleteConfirmModal.vue'
import BaseSpinner from '@/components/ui/BaseSpinner.vue'
import type { Monitor } from '@/types'

const store = useMonitorsStore()
const { error: showError, success: showSuccess } = useToast()

const showAddForm = ref(false)
const submitting = ref(false)
const deleting = ref(false)
const deleteTarget = ref<Monitor | null>(null)
const editingMonitor = ref<Monitor | null>(null)
const showDeleteConfirm = ref(false)
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const selectedMonitors = ref(new Set<number>())

watch(searchQuery, () => {
  currentPage.value = 1
})

const filteredMonitors = () => {
  if (!searchQuery.value.trim()) {
    return store.monitors
  }
  const query = searchQuery.value.toLowerCase().trim()
  return store.monitors.filter(
    (monitor) =>
      monitor.name.toLowerCase().includes(query) || monitor.url.toLowerCase().includes(query)
  )
}

const paginatedMonitors = () => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredMonitors().slice(start, end)
}

const toggleMonitorSelection = (id: number | string) => {
  const numId = Number(id)
  if (selectedMonitors.value.has(numId)) {
    selectedMonitors.value.delete(numId)
  } else {
    selectedMonitors.value.add(numId)
  }
}

const toggleSelectAll = () => {
  const pageMonitors = paginatedMonitors()
  const allSelected = pageMonitors.every((m) => selectedMonitors.value.has(Number(m.id)))

  if (allSelected) {
    pageMonitors.forEach((m) => selectedMonitors.value.delete(Number(m.id)))
  } else {
    pageMonitors.forEach((m) => selectedMonitors.value.add(Number(m.id)))
  }
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= Math.ceil(filteredMonitors().length / pageSize.value)) {
    currentPage.value = page
  }
}

const checkMonitor = async (id: number | string) => {
  try {
    await store.runCheck(id)
    showSuccess('Monitor checked successfully')
  } catch (e) {
    showError(`Failed to check monitor: ${e instanceof Error ? e.message : 'Unknown error'}`)
  }
}

const startEdit = (monitor: Monitor) => {
  editingMonitor.value = monitor
  showAddForm.value = true
}

const confirmDelete = (monitor: Monitor) => {
  deleteTarget.value = monitor
  showDeleteConfirm.value = true
}

const handleDelete = async () => {
  if (!deleteTarget.value) return

  try {
    deleting.value = true
    await store.deleteMonitor(deleteTarget.value.id)
    showDeleteConfirm.value = false
    deleteTarget.value = null
    showSuccess('Monitor deleted successfully')
  } catch (e) {
    showError(`Failed to delete monitor: ${e instanceof Error ? e.message : 'Unknown error'}`)
  } finally {
    deleting.value = false
  }
}

const confirmBulkDelete = () => {
  if (selectedMonitors.value.size === 0) return

  const count = selectedMonitors.value.size
  if (
    confirm(`Are you sure you want to delete ${count} monitor(s)? This action cannot be undone.`)
  ) {
    deleteBulkMonitors()
  }
}

const deleteBulkMonitors = async () => {
  if (selectedMonitors.value.size === 0) return

  try {
    deleting.value = true
    const promises = Array.from(selectedMonitors.value).map((id) => store.deleteMonitor(id))
    await Promise.all(promises)

    const count = selectedMonitors.value.size
    selectedMonitors.value.clear()
    showSuccess(`Successfully deleted ${count} monitor(s)`)
  } catch (e) {
    showError(`Failed to delete monitors: ${e instanceof Error ? e.message : 'Unknown error'}`)
  } finally {
    deleting.value = false
  }
}

const handleSubmit = async (data: {
  name: string
  url: string
  type: string
  interval_seconds: number
}) => {
  try {
    submitting.value = true

    if (editingMonitor.value) {
      await store.updateMonitor(editingMonitor.value.id, data)
      showSuccess('Monitor updated successfully')
    } else {
      await store.createMonitor(data)
      showSuccess('Monitor created successfully')
    }

    showAddForm.value = false
    editingMonitor.value = null
  } catch (e: any) {
    if (e.message?.includes('already exists')) {
      showError(e.message)
    } else {
      showError(
        `Failed to ${editingMonitor.value ? 'update' : 'create'} monitor: ${e.message || 'Unknown error'}`
      )
    }
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  store.fetchMonitors()
})
</script>
