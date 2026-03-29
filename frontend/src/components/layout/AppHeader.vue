<template>
  <header
    class="sticky top-0 z-30 h-16 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700"
  >
    <div class="flex items-center justify-between h-full px-6">
      <div class="flex items-center gap-4">
        <button
          @click="toggleMobileMenu"
          class="lg:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <i class="ti ti-menu-2 text-xl"></i>
        </button>

        <div>
          <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
            {{ pageTitle }}
          </h1>
          <p v-if="pageDescription" class="text-sm text-gray-500 dark:text-gray-400">
            {{ pageDescription }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <div v-if="$slots.actions">
          <slot name="actions" />
        </div>

        <div class="hidden sm:flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <i class="ti ti-clock"></i>
          <span>{{ currentTime }}</span>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'

const route = useRoute()
const appStore = useAppStore()

const currentTime = ref('')
let timeInterval: ReturnType<typeof setInterval> | null = null

const pageMeta = computed(() => {
  const meta = route.meta
  return {
    title: (meta?.title as string) || 'Dashboard',
    description: meta?.description as string | undefined
  }
})

const pageTitle = computed(() => pageMeta.value.title)
const pageDescription = computed(() => pageMeta.value.description)

function updateTime() {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

function toggleMobileMenu() {
  appStore.toggleMobileMenu()
}

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval)
})
</script>
