<template>
  <BaseModal v-model="isOpen" title="Delete Monitor" size="sm">
    <div class="flex items-center gap-3 mb-4">
      <div
        class="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center"
      >
        <i class="ti ti-alert-triangle text-red-600 dark:text-red-400 text-xl"></i>
      </div>
      <div>
        <p class="text-sm text-gray-600 dark:text-slate-400">Are you sure you want to delete</p>
        <p class="font-medium text-gray-900 dark:text-white">"{{ monitor?.name }}"?</p>
      </div>
    </div>
    <p class="text-sm text-yellow-700 dark:text-yellow-400 font-medium">
      This action cannot be undone.
    </p>

    <template #footer>
      <button
        @click="close"
        class="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
      >
        Cancel
      </button>
      <button
        @click="handleDelete"
        :disabled="deleting"
        class="inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
      >
        <i class="ti ti-trash"></i>
        {{ deleting ? 'Deleting...' : 'Delete Monitor' }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import type { Monitor } from '@/types'

const props = defineProps<{
  modelValue: boolean
  monitor: Monitor | null
  deleting?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

function handleDelete() {
  emit('confirm')
}

function close() {
  emit('update:modelValue', false)
}
</script>
