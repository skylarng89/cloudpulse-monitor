<template>
  <div class="monitors-page">
    <div class="header">
      <h2>Monitor Management</h2>
      <button @click="showAddForm = true" class="btn-primary">
        Add Monitor
      </button>
    </div>

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
            />
          </div>

          <div class="form-group">
            <label for="url">URL:</label>
            <input
              id="url"
              v-model="newMonitor.url"
              type="url"
              required
              placeholder="https://example.com"
            />
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
            />
          </div>

          <div class="form-actions">
            <button type="button" @click="showAddForm = false" class="btn-secondary">
              Cancel
            </button>
            <button type="submit" class="btn-primary">
              Add Monitor
            </button>
          </div>
        </form>
      </div>
    </div>

    <div class="monitors-table">
      <table>
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
              <span class="status-badge" :class="monitor.status">
                {{ monitor.status }}
              </span>
            </td>
            <td>
              <button @click="deleteMonitor(monitor.id)" class="btn-danger">
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

interface Monitor {
  id: number
  name: string
  url: string
  type: string
  interval: number
  status: 'up' | 'down'
}

const monitors = ref<Monitor[]>([])
const showAddForm = ref(false)
const newMonitor = ref({
  name: '',
  url: '',
  type: 'http',
  interval: 60
})

const fetchMonitors = async () => {
  try {
    const response = await axios.get('/api/monitors')
    monitors.value = response.data.map((monitor: any) => ({
      ...monitor,
      status: Math.random() > 0.8 ? 'down' : 'up'
    }))
  } catch (error) {
    console.error('Failed to fetch monitors:', error)
  }
}

const addMonitor = async () => {
  try {
    await axios.post('/api/monitors', newMonitor.value)
    showAddForm.value = false
    newMonitor.value = { name: '', url: '', type: 'http', interval: 60 }
    fetchMonitors()
  } catch (error) {
    console.error('Failed to add monitor:', error)
  }
}

const deleteMonitor = async (id: number) => {
  if (confirm('Are you sure you want to delete this monitor?')) {
    try {
      // await axios.delete(`/api/monitors/${id}`)
      // For now, just remove from local state
      monitors.value = monitors.value.filter(m => m.id !== id)
    } catch (error) {
      console.error('Failed to delete monitor:', error)
    }
  }
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
</style>