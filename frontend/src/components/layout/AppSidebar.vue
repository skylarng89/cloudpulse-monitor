<template>
  <aside
    class="fixed inset-y-0 left-0 z-40 flex flex-col bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 transition-all duration-300 ease-in-out"
    :class="collapsed ? 'w-16' : 'w-64'"
  >
    <div class="flex items-center h-16 px-4 border-b border-gray-200 dark:border-slate-700">
      <router-link to="/" class="flex items-center gap-3 overflow-hidden">
        <i class="ti ti-activity text-2xl text-indigo-600 dark:text-indigo-400 flex-shrink-0"></i>
        <span
          class="text-lg font-bold text-gray-900 dark:text-white whitespace-nowrap transition-opacity duration-200"
          :class="collapsed ? 'opacity-0' : 'opacity-100'"
        >
          CloudPulse
        </span>
      </router-link>
    </div>

    <nav class="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
        :class="[
          isActive(item.path)
            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-700'
        ]"
        :title="collapsed ? item.label : undefined"
      >
        <i class="ti text-xl flex-shrink-0" :class="item.icon"></i>
        <span
          class="whitespace-nowrap transition-opacity duration-200"
          :class="collapsed ? 'opacity-0 w-0' : 'opacity-100'"
        >
          {{ item.label }}
        </span>
      </router-link>
    </nav>

    <div class="p-2 border-t border-gray-200 dark:border-slate-700 space-y-1">
      <button
        @click="toggleTheme"
        class="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-700 transition-all duration-200"
        :title="collapsed ? themeLabel : undefined"
      >
        <i class="ti text-xl flex-shrink-0" :class="themeIcon"></i>
        <span
          class="whitespace-nowrap transition-opacity duration-200"
          :class="collapsed ? 'opacity-0 w-0' : 'opacity-100'"
        >
          {{ themeLabel }}
        </span>
      </button>

      <button
        @click="toggleSidebar"
        class="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-700 transition-all duration-200"
        :title="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
      >
        <i
          class="ti text-xl flex-shrink-0"
          :class="collapsed ? 'ti-chevrons-right' : 'ti-chevrons-left'"
        ></i>
        <span
          class="whitespace-nowrap transition-opacity duration-200"
          :class="collapsed ? 'opacity-0 w-0' : 'opacity-100'"
        >
          Collapse
        </span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore, type Theme } from '@/stores/app'

const route = useRoute()
const appStore = useAppStore()

const collapsed = computed(() => appStore.sidebarCollapsed)
const theme = computed(() => appStore.theme)

const navItems = [
  { path: '/', label: 'Dashboard', icon: 'ti-dashboard' },
  { path: '/monitors', label: 'Monitors', icon: 'ti-server' },
  { path: '/reports', label: 'Reports', icon: 'ti-chart-line' }
]

const themeIcon = computed(() => {
  if (theme.value === 'dark') return 'ti-moon'
  if (theme.value === 'light') return 'ti-sun'
  return 'ti-device-desktop'
})

const themeLabel = computed(() => {
  if (theme.value === 'dark') return 'Dark Mode'
  if (theme.value === 'light') return 'Light Mode'
  return 'System'
})

function isActive(path: string) {
  return route.path === path
}

function toggleSidebar() {
  appStore.toggleSidebar()
}

function toggleTheme() {
  const themes: Theme[] = ['system', 'light', 'dark']
  const currentIndex = themes.indexOf(theme.value)
  const nextTheme = themes[(currentIndex + 1) % themes.length]
  appStore.setTheme(nextTheme)
}
</script>
