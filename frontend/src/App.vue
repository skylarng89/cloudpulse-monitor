<template>
  <div id="app">
    <header class="app-header">
      <div class="header-container">
        <div class="logo">
          <i class="ti ti-activity"></i>
          <span class="logo-text">CloudPulse</span>
          <span class="logo-badge">Monitor</span>
        </div>
        <nav class="nav">
          <router-link to="/" class="nav-link">
            <i class="ti ti-dashboard"></i>
            <span>Dashboard</span>
          </router-link>
          <router-link to="/monitors" class="nav-link">
            <i class="ti ti-server"></i>
            <span>Monitors</span>
          </router-link>
          <router-link to="/reports" class="nav-link">
            <i class="ti ti-chart-line"></i>
            <span>Reports</span>
          </router-link>
        </nav>
      </div>
    </header>

    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<style scoped>
.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
}

.header-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 700;
  font-size: 1.25rem;
}

.logo .ti {
  font-size: 2rem;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.logo-text {
  letter-spacing: -0.025em;
}

.logo-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.nav {
  display: flex;
  gap: 0.5rem;
}

.nav-link {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  padding: 0.625rem 1rem;
  border-radius: var(--radius);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  position: relative;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.15);
  color: white;
}

.nav-link.router-link-active {
  background: rgba(255, 255, 255, 0.25);
  color: white;
}

.nav-link.router-link-active::after {
  content: '';
  position: absolute;
  bottom: -1rem;
  left: 50%;
  transform: translateX(-50%);
  width: 40%;
  height: 3px;
  background: white;
  border-radius: 9999px;
}

.main-content {
  padding: 2rem;
  max-width: 1280px;
  margin: 0 auto;
  min-height: calc(100vh - 5rem);
}

@media (max-width: 768px) {
  .header-container {
    flex-direction: column;
    gap: 1rem;
  }
  
  .nav {
    width: 100%;
    justify-content: center;
  }
  
  .nav-link span {
    display: none;
  }
}
</style>