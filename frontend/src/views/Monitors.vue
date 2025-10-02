<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <i class="ti ti-server text-purple-600 text-4xl"></i>
          Monitor Management
        </h1>
        <p class="mt-1 text-sm text-gray-600">Manage your monitoring endpoints</p>
      </div>
      <button 
        @click="showAddForm = true"
        class="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 shadow-sm"
      >
        <i class="ti ti-plus"></i>
        Add Monitor
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
      <p class="mt-4 text-sm text-gray-600">Loading monitors...</p>
    </div>

    <!-- Monitors Table -->
    <div v-if="!loading && !connectionError" class="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
      <!-- Empty State -->
      <div v-if="monitors.length === 0" class="px-6 py-12 text-center">
        <i class="ti ti-server-off text-gray-300 text-6xl"></i>
        <h3 class="mt-4 text-lg font-medium text-gray-900">No monitors configured</h3>
        <p class="mt-2 text-sm text-gray-600">Add your first monitor to start monitoring your websites and services.</p>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interval</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="monitor in monitors" :key="monitor.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ monitor.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">{{ monitor.url }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ monitor.type.toUpperCase() }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ monitor.interval_seconds }}s</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Unknown
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end gap-2">
                  <button 
                    @click="checkMonitor(monitor.id)"
                    class="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-md transition-colors"
                    title="Check Now"
                  >
                    <i class="ti ti-refresh text-sm"></i>
                  </button>
                  <button 
                    @click="confirmDelete(monitor)"
                    class="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-md transition-colors"
                    title="Delete"
                  >
                    <i class="ti ti-trash text-sm"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add Monitor Modal -->
    <div v-if="showAddForm" class="fixed inset-0 z-50 overflow-y-auto" @click="showAddForm = false">
      <div class="flex min-h-screen items-center justify-center p-4">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm transition-opacity"></div>
        
        <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 transform transition-all" @click.stop>
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Add New Monitor</h3>
            <button @click="showAddForm = false" class="text-gray-400 hover:text-gray-500">
              <i class="ti ti-x text-xl"></i>
            </button>
          </div>

          <form @submit.prevent="addMonitor" class="space-y-4">
            <!-- Name -->
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                id="name"
                v-model="newMonitor.name"
                type="text"
                required
                placeholder="My Website"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                :class="{ 'border-red-500': validationErrors.name }"
              />
              <p v-if="validationErrors.name" class="mt-1 text-sm text-red-600">{{ validationErrors.name }}</p>
            </div>

            <!-- URL -->
            <div>
              <label for="url" class="block text-sm font-medium text-gray-700 mb-1">URL</label>
              <input
                id="url"
                v-model="newMonitor.url"
                type="url"
                required
                placeholder="https://example.com"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                :class="{ 'border-red-500': validationErrors.url }"
              />
              <p v-if="validationErrors.url" class="mt-1 text-sm text-red-600">{{ validationErrors.url }}</p>
            </div>

            <!-- Type -->
            <div>
              <label for="type" class="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                id="type"
                v-model="newMonitor.type"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                <option value="http">HTTP</option>
                <option value="ping">Ping</option>
                <option value="tcp">TCP Port</option>
              </select>
            </div>

            <!-- Interval -->
            <div>
              <label for="interval" class="block text-sm font-medium text-gray-700 mb-1">Check Interval (seconds)</label>
              <input
                id="interval"
                v-model.number="newMonitor.interval_seconds"
                type="number"
                min="30"
                max="3600"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                :class="{ 'border-red-500': validationErrors.interval }"
              />
              <p v-if="validationErrors.interval" class="mt-1 text-sm text-red-600">{{ validationErrors.interval }}</p>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-3 pt-4">
              <button
                type="button"
                @click="cancelAdd"
                class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
              >
                <i class="ti ti-x"></i>
                Cancel
              </button>
              <button
                type="submit"
                :disabled="submitting"
                class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-colors"
              >
                <i class="ti ti-check"></i>
                {{ submitting ? 'Adding...' : 'Add Monitor' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="deleteTarget" class="fixed inset-0 z-50 overflow-y-auto" @click="deleteTarget = null">
      <div class="flex min-h-screen items-center justify-center p-4">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm transition-opacity"></div>
        
        <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 transform transition-all" @click.stop>
          <div class="flex items-center gap-3 mb-4">
            <div class="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <i class="ti ti-alert-triangle text-red-600 text-xl"></i>
            </div>
            <h3 class="text-lg font-medium text-gray-900">Delete Monitor</h3>
          </div>

          <p class="text-sm text-gray-600 mb-2">Are you sure you want to delete "{{ deleteTarget.name }}"?</p>
          <p class="text-sm text-yellow-700 font-medium">This action cannot be undone.</p>

          <div class="flex items-center gap-3 mt-6">
            <button
              @click="deleteTarget = null"
              class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
            >
              <i class="ti ti-x"></i>
              Cancel
            </button>
            <button
              @click="deleteMonitor"
              :disabled="deleting"
              class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors"
            >
              <i class="ti ti-trash"></i>
              {{ deleting ? 'Deleting...' : 'Delete Monitor' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import apiService from '@/services/api'

interface Monitor {
  id: number
  name: string
  url: string
  type: string
  interval_seconds: number
  active: boolean
  created_at: string
}

const monitors = ref<Monitor[]>([])
const showAddForm = ref(false)
const loading = ref(true)
const submitting = ref(false)
const deleting = ref(false)
const connectionError = ref('')
const deleteTarget = ref<Monitor | null>(null)

const newMonitor = ref({
  name: '',
  url: '',
  type: 'http',
  interval_seconds: 60
})

const validationErrors = ref<Record<string, string>>({})

const fetchMonitors = async () => {
  try {
    loading.value = true
    connectionError.value = ''
    const data = await apiService.getMonitors()
    monitors.value = data
  } catch (error: any) {
    connectionError.value = error.message || 'Failed to connect to backend'
  } finally {
    loading.value = false
  }
}

const validateForm = () => {
  validationErrors.value = {}
  let isValid = true

  if (!newMonitor.value.name.trim()) {
    validationErrors.value.name = 'Monitor name is required'
    isValid = false
  } else if (newMonitor.value.name.length > 100) {
    validationErrors.value.name = 'Name must be less than 100 characters'
    isValid = false
  }

  if (!newMonitor.value.url.trim()) {
    validationErrors.value.url = 'URL is required'
    isValid = false
  } else {
    try {
      const url = new URL(newMonitor.value.url)
      if (!['http:', 'https:'].includes(url.protocol)) {
        validationErrors.value.url = 'URL must use HTTP or HTTPS'
        isValid = false
      }
    } catch {
      validationErrors.value.url = 'Please enter a valid URL'
      isValid = false
    }
  }

  if (newMonitor.value.interval_seconds < 30 || newMonitor.value.interval_seconds > 3600) {
    validationErrors.value.interval = 'Interval must be between 30 and 3600 seconds'
    isValid = false
  }

  return isValid
}

const addMonitor = async () => {
  if (!validateForm()) return

  try {
    submitting.value = true
    await apiService.createMonitor(newMonitor.value)
    newMonitor.value = { name: '', url: '', type: 'http', interval_seconds: 60 }
    showAddForm.value = false
    validationErrors.value = {}
    await fetchMonitors()
  } catch (error: any) {
    if (error.message.includes('already exists')) {
      validationErrors.value.name = error.message
    } else {
      alert(`Failed to create monitor: ${error.message}`)
    }
  } finally {
    submitting.value = false
  }
}

const cancelAdd = () => {
  showAddForm.value = false
  newMonitor.value = { name: '', url: '', type: 'http', interval_seconds: 60 }
  validationErrors.value = {}
}

const confirmDelete = (monitor: Monitor) => {
  deleteTarget.value = monitor
}

const deleteMonitor = async () => {
  if (!deleteTarget.value) return

  try {
    deleting.value = true
    await apiService.deleteMonitor(deleteTarget.value.id)
    await fetchMonitors()
    deleteTarget.value = null
  } catch (error: any) {
    alert(`Failed to delete monitor: ${error.message}`)
  } finally {
    deleting.value = false
  }
}

const checkMonitor = async (monitorId: number) => {
  try {
    await apiService.checkMonitor(monitorId)
    setTimeout(fetchMonitors, 1000)
  } catch (error: any) {
    alert(`Failed to check monitor: ${error.message}`)
  }
}

const retryConnection = () => {
  fetchMonitors()
}

onMounted(() => {
  fetchMonitors()
})
</script>
