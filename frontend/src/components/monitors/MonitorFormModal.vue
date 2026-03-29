<template>
  <BaseModal v-model="isOpen" :title="monitor ? 'Edit Monitor' : 'Add New Monitor'" size="md">
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1"
          >Name</label
        >
        <input
          id="name"
          v-model="form.name"
          type="text"
          required
          placeholder="My Website"
          class="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
          :class="{ 'border-red-500': errors.name }"
        />
        <p v-if="errors.name" class="mt-1 text-sm text-red-600 dark:text-red-400">
          {{ errors.name }}
        </p>
      </div>

      <div>
        <label for="type" class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1"
          >Type</label
        >
        <select
          id="type"
          v-model="form.type"
          class="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
        >
          <option value="http">HTTP/HTTPS</option>
          <option value="ping">Ping</option>
          <option value="tcp">TCP Port</option>
        </select>

        <div
          class="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
        >
          <div class="flex items-start gap-2">
            <i
              class="ti ti-info-circle text-blue-600 dark:text-blue-400 text-sm mt-0.5 flex-shrink-0"
            ></i>
            <div class="text-xs text-blue-800 dark:text-blue-300">
              <p v-if="form.type === 'http'" class="font-medium mb-1">HTTP/HTTPS Monitoring</p>
              <p v-if="form.type === 'ping'" class="font-medium mb-1">Ping Monitoring</p>
              <p v-if="form.type === 'tcp'" class="font-medium mb-1">TCP Port Monitoring</p>

              <p v-if="form.type === 'http'" class="text-blue-700 dark:text-blue-400">
                Checks if your website is accessible via HTTP/HTTPS.<br />
                <span class="font-mono bg-blue-100 dark:bg-blue-800/50 px-1 rounded"
                  >Example: https://example.com</span
                >
              </p>
              <p v-if="form.type === 'ping'" class="text-blue-700 dark:text-blue-400">
                Sends ICMP ping packets to check if server is reachable.<br />
                <span class="font-mono bg-blue-100 dark:bg-blue-800/50 px-1 rounded"
                  >Example: example.com or 192.168.1.1</span
                >
              </p>
              <p v-if="form.type === 'tcp'" class="text-blue-700 dark:text-blue-400">
                Checks if a specific TCP port is open and accepting connections.<br />
                <span class="font-mono bg-blue-100 dark:bg-blue-800/50 px-1 rounded"
                  >Example: example.com:3306 or 192.168.1.1:22</span
                >
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label for="url" class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
          {{ urlLabel }}
        </label>
        <input
          id="url"
          v-model="form.url"
          type="text"
          required
          :placeholder="urlPlaceholder"
          class="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-white font-mono text-sm"
          :class="{ 'border-red-500': errors.url }"
        />
        <p v-if="errors.url" class="mt-1 text-sm text-red-600 dark:text-red-400">
          {{ errors.url }}
        </p>
      </div>

      <div>
        <label
          for="interval"
          class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1"
          >Check Interval (seconds)</label
        >
        <input
          id="interval"
          v-model.number="form.interval_seconds"
          type="number"
          min="30"
          max="3600"
          required
          class="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
          :class="{ 'border-red-500': errors.interval }"
        />
        <p v-if="errors.interval" class="mt-1 text-sm text-red-600 dark:text-red-400">
          {{ errors.interval }}
        </p>
      </div>
    </form>

    <template #footer>
      <button
        type="button"
        @click="close"
        class="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
      >
        <i class="ti ti-x"></i>
        Cancel
      </button>
      <button
        @click="handleSubmit"
        :disabled="submitting"
        class="inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50 transition-colors"
      >
        <i class="ti ti-check"></i>
        {{
          submitting
            ? monitor
              ? 'Updating...'
              : 'Adding...'
            : monitor
              ? 'Update Monitor'
              : 'Add Monitor'
        }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import type { Monitor } from '@/types'

const props = defineProps<{
  modelValue: boolean
  monitor?: Monitor | null
  submitting?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [data: typeof form.value]
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const defaultForm = {
  name: '',
  url: '',
  type: 'http' as 'http' | 'ping' | 'tcp',
  interval_seconds: 60
}

const form = ref({ ...defaultForm })
const errors = ref<Record<string, string>>({})

watch(
  () => props.modelValue,
  (open) => {
    if (open && props.monitor) {
      form.value = {
        name: props.monitor.name,
        url: props.monitor.url,
        type: (props.monitor.type?.toLowerCase() as 'http' | 'ping' | 'tcp') || 'http',
        interval_seconds: props.monitor.interval_seconds || 60
      }
    } else if (open) {
      form.value = { ...defaultForm }
    }
    errors.value = {}
  }
)

const urlLabel = computed(() => {
  switch (form.value.type) {
    case 'http':
      return 'URL'
    case 'ping':
      return 'Hostname or IP Address'
    case 'tcp':
      return 'Host:Port'
    default:
      return 'URL'
  }
})

const urlPlaceholder = computed(() => {
  switch (form.value.type) {
    case 'http':
      return 'https://example.com'
    case 'ping':
      return 'example.com or 192.168.1.1'
    case 'tcp':
      return 'example.com:3306 or 192.168.1.1:22'
    default:
      return 'https://example.com'
  }
})

function validate(): boolean {
  errors.value = {}
  let isValid = true

  if (!form.value.name.trim()) {
    errors.value.name = 'Monitor name is required'
    isValid = false
  } else if (form.value.name.length > 100) {
    errors.value.name = 'Name must be less than 100 characters'
    isValid = false
  }

  if (!form.value.url.trim()) {
    errors.value.url = form.value.type === 'http' ? 'URL is required' : 'Host is required'
    isValid = false
  } else {
    if (form.value.type === 'http') {
      try {
        const url = new URL(form.value.url)
        if (!['http:', 'https:'].includes(url.protocol)) {
          errors.value.url = 'URL must use HTTP or HTTPS'
          isValid = false
        }
      } catch {
        errors.value.url = 'Please enter a valid URL (e.g., https://example.com)'
        isValid = false
      }
    } else if (form.value.type === 'ping') {
      const hostPattern =
        /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/
      const ipPattern =
        /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/

      if (!hostPattern.test(form.value.url) && !ipPattern.test(form.value.url)) {
        errors.value.url = 'Please enter a valid hostname or IP address'
        isValid = false
      }
    } else if (form.value.type === 'tcp') {
      const tcpPattern =
        /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?:[0-9]{1,5}$|^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)?:[0-9]{1,5}$/

      if (!tcpPattern.test(form.value.url)) {
        errors.value.url = 'Please enter host:port format (e.g., example.com:3306)'
        isValid = false
      } else {
        const port = parseInt(form.value.url.split(':')[1])
        if (port < 1 || port > 65535) {
          errors.value.url = 'Port must be between 1 and 65535'
          isValid = false
        }
      }
    }
  }

  if (form.value.interval_seconds < 30 || form.value.interval_seconds > 3600) {
    errors.value.interval = 'Interval must be between 30 and 3600 seconds'
    isValid = false
  }

  return isValid
}

function handleSubmit() {
  if (!validate()) return
  emit('submit', { ...form.value })
}

function close() {
  emit('update:modelValue', false)
}
</script>
