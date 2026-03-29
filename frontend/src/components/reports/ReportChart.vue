<template>
  <div class="bg-white dark:bg-slate-800 shadow-sm rounded-lg border border-gray-200 dark:border-slate-700 p-6">
    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
      <i :class="icon" class="text-purple-600 dark:text-purple-400"></i>
      {{ title }}
    </h3>
    <div class="h-64">
      <Line v-if="chartData" :data="chartData" :options="chartOptions" />
      <div v-else class="h-full flex items-center justify-center bg-gray-50 dark:bg-slate-700/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-600">
        <div class="text-center">
          <i :class="placeholderIcon" class="text-gray-400 dark:text-slate-500 text-5xl"></i>
          <p class="mt-2 text-sm text-gray-600 dark:text-slate-400">{{ placeholderText }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { useAppStore } from '@/stores/app'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const props = defineProps<{
  title: string
  icon: string
  placeholderIcon?: string
  placeholderText?: string
  labels: string[]
  datasets: {
    label: string
    data: number[]
    borderColor?: string
    backgroundColor?: string
    fill?: boolean
    tension?: number
  }[]
}>()

const appStore = useAppStore()

const chartData = computed(() => {
  if (!props.labels.length || !props.datasets.some(d => d.data.length > 0)) {
    return null
  }
  return {
    labels: props.labels,
    datasets: props.datasets.map(d => ({
      ...d,
      tension: d.tension ?? 0.4,
      fill: d.fill ?? false
    }))
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top' as const,
      labels: {
        color: appStore.darkMode ? '#94a3b8' : '#6b7280',
        usePointStyle: true,
        pointStyle: 'circle'
      }
    },
    tooltip: {
      backgroundColor: appStore.darkMode ? '#1e293b' : '#ffffff',
      titleColor: appStore.darkMode ? '#f1f5f9' : '#111827',
      bodyColor: appStore.darkMode ? '#cbd5e1' : '#6b7280',
      borderColor: appStore.darkMode ? '#334155' : '#e5e7eb',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 8
    }
  },
  scales: {
    x: {
      grid: {
        color: appStore.darkMode ? '#334155' : '#f3f4f6',
        drawBorder: false
      },
      ticks: {
        color: appStore.darkMode ? '#94a3b8' : '#6b7280'
      }
    },
    y: {
      grid: {
        color: appStore.darkMode ? '#334155' : '#f3f4f6',
        drawBorder: false
      },
      ticks: {
        color: appStore.darkMode ? '#94a3b8' : '#6b7280'
      },
      beginAtZero: true
    }
  },
  interaction: {
    intersect: false,
    mode: 'index' as const
  }
}))
</script>
