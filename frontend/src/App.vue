<template>
  <div class="min-h-screen bg-gray-50 dark:bg-slate-900">
    <AppSidebar />
    
    <div 
      class="transition-all duration-300 ease-in-out"
      :class="sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'"
    >
      <AppHeader>
        <template v-if="$route.name === 'dashboard'" #actions>
          <router-link
            to="/monitors"
            class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <i class="ti ti-plus"></i>
            Add Monitor
          </router-link>
        </template>
      </AppHeader>
      
      <main class="p-6">
        <router-view v-slot="{ Component }">
          <Transition name="fade" mode="out-in">
            <component :is="Component" />
          </Transition>
        </router-view>
      </main>
    </div>

    <Teleport to="body">
      <Transition name="slide">
        <div
          v-if="mobileMenuOpen"
          class="fixed inset-0 z-50 lg:hidden"
        >
          <div 
            class="absolute inset-0 bg-black/50"
            @click="closeMobileMenu"
          />
          <AppSidebar class="!fixed" />
        </div>
      </Transition>
    </Teleport>

    <ToastNotification />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import ToastNotification from '@/components/ToastNotification.vue'

const appStore = useAppStore()

const sidebarCollapsed = computed(() => appStore.sidebarCollapsed)
const mobileMenuOpen = computed(() => appStore.mobileMenuOpen)

function closeMobileMenu() {
  appStore.closeMobileMenu()
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}
</style>
