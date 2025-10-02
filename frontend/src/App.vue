<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- Header with Tailwind -->
    <header class="sticky top-0 z-50 bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 shadow-lg backdrop-blur-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <div class="flex items-center gap-3">
            <i class="ti ti-activity text-3xl text-white animate-pulse"></i>
            <span class="text-xl font-bold text-white tracking-tight">CloudPulse</span>
            <span class="px-3 py-1 text-xs font-semibold text-white bg-white/20 rounded-full uppercase tracking-wider">
              Monitor
            </span>
          </div>
          
          <!-- Navigation -->
          <nav class="flex items-center gap-2">
            <router-link 
              to="/" 
              class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/90 hover:text-white hover:bg-white/15 rounded-lg transition-all duration-200"
              active-class="bg-white/25 text-white"
            >
              <i class="ti ti-dashboard"></i>
              <span class="hidden sm:inline">Dashboard</span>
            </router-link>
            
            <router-link 
              to="/monitors" 
              class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/90 hover:text-white hover:bg-white/15 rounded-lg transition-all duration-200"
              active-class="bg-white/25 text-white"
            >
              <i class="ti ti-server"></i>
              <span class="hidden sm:inline">Monitors</span>
            </router-link>
            
            <router-link 
              to="/reports" 
              class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/90 hover:text-white hover:bg-white/15 rounded-lg transition-all duration-200"
              active-class="bg-white/25 text-white"
            >
              <i class="ti ti-chart-line"></i>
              <span class="hidden sm:inline">Reports</span>
            </router-link>
          </nav>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <router-view />
    </main>
    
    <!-- Toast Notifications -->
    <ToastNotification />
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import ToastNotification from '@/components/ToastNotification.vue'
</script>

<style scoped>
/* Minimal custom styles - Tailwind handles most of it */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}
</style>