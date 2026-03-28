import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: {
      title: 'Dashboard',
      description: 'Monitor your services in real-time'
    }
  },
  {
    path: '/monitors',
    name: 'monitors',
    component: () => import('@/views/Monitors.vue'),
    meta: {
      title: 'Monitors',
      description: 'Manage your monitoring endpoints'
    }
  },
  {
    path: '/reports',
    name: 'reports',
    component: () => import('@/views/Reports.vue'),
    meta: {
      title: 'Reports',
      description: 'View analytics and uptime statistics'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  const title = to.meta?.title as string | undefined
  document.title = title ? `${title} - CloudPulse` : 'CloudPulse Monitor'
  next()
})

export default router
