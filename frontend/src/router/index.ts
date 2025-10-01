import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/views/Dashboard.vue'
import Monitors from '@/views/Monitors.vue'
import Reports from '@/views/Reports.vue'

const routes = [
  { path: '/', component: Dashboard },
  { path: '/monitors', component: Monitors },
  { path: '/reports', component: Reports }
]

export default createRouter({
  history: createWebHistory(),
  routes
})