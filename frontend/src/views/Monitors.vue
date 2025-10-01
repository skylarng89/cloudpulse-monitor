<template>
  <div class="monitors-page">
    <div class="header">
      <h2>Monitor Management</h2>
      <button @click="showAddForm = true" class="btn-primary">
        Add Monitor
      </button>
    </div>

    <!-- Connection Status -->
    <div v-if="connectionError" class="connection-error">
      <p>⚠️ Unable to connect to backend: {{ connectionError }}</p>
      <button @click="retryConnection" class="btn-secondary">Retry Connection</button>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !connectionError" class="loading-state">
      <p>Loading monitors...</p>
    </div>

    <!-- Add Monitor Modal -->
    <div v-if="showAddForm" class="modal-overlay" @click="showAddForm = false">
      <div class="modal" @click.stop>
        <h3>Add New Monitor</h3>
        <form @submit.prevent="addMonitor" class="monitor-form">
          <div class="form-group">
            <label for="name">Name:</label>
            <input
              id="name"
              v-model="newMonitor.name"
              type="text"
              required
              placeholder="My Website"
              :class="{ 'error': validationErrors.name }"
            />
            <span v-if="validationErrors.name" class="error-message">{{ validationErrors.name }}</span>
          </div>

          <div class="form-group">
            <label for="url">URL:</label>
            <input
              id="url"
              v-model="newMonitor.url"
              type="url"
              required
              placeholder="https://example.com"
              :class="{ 'error': validationErrors.url }"
            />
            <span v-if="validationErrors.url" class="error-message">{{ validationErrors.url }}</span>
          </div>

          <div class="form-group">
            <label for="type">Type:</label>
            <select id="type" v-model="newMonitor.type">
              <option value="http">HTTP</option>
              <option value="ping">Ping</option>
              <option value="tcp">TCP Port</option>
            </select>
          </div>

          <div class="form-group">
            <label for="interval">Check Interval (seconds):</label>
            <input
              id="interval"
              v-model.number="newMonitor.interval"
              type="number"
              min="30"
              max="3600"
              required
              :class="{ 'error': validationErrors.interval }"
            />
            <span v-if="validationErrors.interval" class="error-message">{{ validationErrors.interval }}</span>
          </div>

          <div class="form-actions">
            <button type="button" @click="cancelAdd" class="btn-secondary">
              Cancel
            </button>
            <button type="submit" :disabled="submitting" class="btn-primary">
              {{ submitting ? 'Adding...' : 'Add Monitor' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Monitors Table -->
    <div v-if="!loading && !connectionError" class="monitors-table">
      <div v-if="monitors.length === 0" class="no-monitors">
        <p>No monitors configured yet.</p>
        <p>Add your first monitor to start monitoring your websites and services.</p>
      </div>

      <table v-else>
        <thead>
          <tr>
            <th>Name</th>
            <th>URL</th>
            <th>Type</th>
            <th>Interval</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="monitor in monitors" :key="monitor.id">
            <td>{{ monitor.name }}</td>
            <td>{{ monitor.url }}</td>
            <td>{{ monitor.type.toUpperCase() }}</td>
            <td>{{ monitor.interval }}s</td>
            <td>
              <span class="status-badge" :class="getMonitorStatus(monitor)">
                {{ getMonitorStatusText(monitor) }}
              </span>
            </td>
            <td>
              <button @click="checkMonitor(monitor.id)" class="btn-small" title="Check Now">
                🔍
              </button>
              <button @click="confirmDelete(monitor)" class="btn-small btn-danger" title="Delete">
                🗑️
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="deleteTarget" class="modal-overlay" @click="deleteTarget = null">
      <div class="modal" @click.stop>
        <h3>Delete Monitor</h3>
        <p>Are you sure you want to delete "{{ deleteTarget.name }}"?</p>
        <p class="warning">This action cannot be undone.</p>
        <div class="form-actions">
          <button @click="deleteTarget = null" class="btn-secondary">
            Cancel
          </button>
          <button @click="deleteMonitor" :disabled="deleting" class="btn-danger">
            {{ deleting ? 'Deleting...' : 'Delete Monitor' }}
          </button>
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
  interval: number
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
  interval: 60
})

const validationErrors = ref<Record<string, string>>({})

const fetchMonitors = async () => {
  try {
    loading.value = true
    connectionError.value = ''

    const data = await apiService.getMonitors()
    monitors.value = data
  } catch (error) {
    console.error('Error fetching monitors:', error)
    connectionError.value = error.message || 'Failed to connect to backend'
  } finally {
    loading.value = false
  }
}

const validateForm = () => {
  validationErrors.value = {}
  let isValid = true

  // Name validation
  if (!newMonitor.value.name.trim()) {
    validationErrors.value.name = 'Monitor name is required'
    isValid = false
  } else if (newMonitor.value.name.length > 100) {
    validationErrors.value.name = 'Name must be less than 100 characters'
    isValid = false
  }

  // URL validation
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

  // Interval validation
  if (newMonitor.value.interval < 30 || newMonitor.value.interval > 3600) {
    validationErrors.value.interval = 'Interval must be between 30 and 3600 seconds'
    isValid = false
  }

  return isValid
}

const addMonitor = async () => {
  if (!validateForm()) {
    return
  }

  try {
    submitting.value = true
    await apiService.createMonitor(newMonitor.value)

    // Reset form and close modal
    newMonitor.value = { name: '', url: '', type: 'http', interval: 60 }
    showAddForm.value = false
    validationErrors.value = {}

    // Refresh monitors list
    await fetchMonitors()
  } catch (error) {
    console.error('Error creating monitor:', error)
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
  newMonitor.value = { name: '', url: '', type: 'http', interval: 60 }
  validationErrors.value = {}
}

const confirmDelete = (monitor) => {
  deleteTarget.value = monitor
}

const deleteMonitor = async () => {
  if (!deleteTarget.value) return

  try {
    deleting.value = true
    await apiService.deleteMonitor(deleteTarget.value.id)

    // Refresh monitors list
    await fetchMonitors()
    deleteTarget.value = null
  } catch (error) {
    console.error('Error deleting monitor:', error)
    alert(`Failed to delete monitor: ${error.message}`)
  } finally {
    deleting.value = false
  }
}

const checkMonitor = async (monitorId) => {
  try {
    await apiService.checkMonitor(monitorId)
    // Refresh data after check
    setTimeout(fetchMonitors, 1000)
  } catch (error) {
    console.error(`Error checking monitor ${monitorId}:`, error)
    alert(`Failed to check monitor: ${error.message}`)
  }
}

const getMonitorStatus = (monitor) => {
  // For now, show 'unknown' status since we're not fetching real-time status
  // In a full implementation, you'd fetch the latest check result
  return 'unknown'
}

const getMonitorStatusText = (monitor) => {
  return 'Unknown'
}

const retryConnection = () => {
  fetchMonitors()
}

onMounted(() => {
  fetchMonitors()
})
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.btn-primary {
  background: #3498db;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.btn-primary:hover {
  background: #2980b9;
}

.btn-primary:disabled {
  background: #95a5a6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.btn-secondary:hover {
  background: #7f8c8d;
}

.btn-danger {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-danger:hover {
  background: #c0392b;
}

.btn-danger:disabled {
  background: #95a5a6;
  cursor: not-allowed;
}

.btn-small {
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  margin-right: 0.5rem;
}

.btn-small:hover {
  opacity: 0.8;
}

.connection-error {
  background: #fee;
  border: 1px solid #fcc;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  text-align: center;
}

.loading-state {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.monitor-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
}

.form-group input,
.form-group select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input.error {
  border-color: #e74c3c;
}

.error-message {
  color: #e74c3c;
  font-size: 0.85rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

.monitors-table {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
}

.monitors-table table {
  width: 100%;
  border-collapse: collapse;
}

.monitors-table th,
.monitors-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.monitors-table th {
  background: #f8f9fa;
  font-weight: 600;
}

.monitors-table tbody tr:hover {
  background: #f8f9fa;
}

.no-monitors {
  text-align: center;
  padding: 3rem;
  color: #7f8c8d;
}

.no-monitors p {
  margin-bottom: 1rem;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
}

.status-badge.up {
  background: #27ae60;
  color: white;
}

.status-badge.down {
  background: #e74c3c;
  color: white;
}

.status-badge.unknown {
  background: #95a5a6;
  color: white;
}

.warning {
  color: #f39c12;
  font-weight: 500;
  margin: 1rem 0;
}
</style>