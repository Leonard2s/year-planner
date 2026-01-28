<script setup lang="ts">
import { computed } from 'vue'
import type { MonthSummary } from '../types'

const props = defineProps<{
  summary: MonthSummary
  monthName: string
  isClosed: boolean
}>()

const evaluationColor = computed(() => {
  switch (props.summary.evaluation) {
    case 'cumplido': return 'text-green-700 bg-green-100'
    case 'vas bien': return 'text-yellow-700 bg-yellow-100'
    case 'atrasado': return 'text-red-700 bg-red-100'
  }
})

const evaluationIcon = computed(() => {
  switch (props.summary.evaluation) {
    case 'cumplido': return '🎉'
    case 'vas bien': return '👍'
    case 'atrasado': return '⚠️'
  }
})

const progressBarColor = computed(() => {
  if (props.summary.progressPercentage >= 80) return 'bg-green-500'
  if (props.summary.progressPercentage >= 50) return 'bg-yellow-500'
  return 'bg-red-500'
})

const summaryMessage = computed(() => {
  const { completedGoals, totalGoals, pendingGoals } = props.summary
  
  if (totalGoals === 0) {
    return 'No hay metas definidas para este mes.'
  }
  
  if (completedGoals === totalGoals) {
    return `¡Excelente! Cumpliste todas las ${totalGoals} metas de este mes.`
  }
  
  if (props.isClosed) {
    return `Cumpliste ${completedGoals} de ${totalGoals} metas. ${pendingGoals} metas pasaron al siguiente mes.`
  }
  
  return `Este mes cumpliste ${completedGoals} de ${totalGoals} metas. ${pendingGoals > 0 ? `Quedan ${pendingGoals} metas pendientes.` : ''}`
})
</script>

<template>
  <div class="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200">
    <div class="flex items-center justify-between mb-2 sm:mb-3">
      <h4 class="text-sm sm:text-base font-semibold text-gray-800">Resumen de {{ monthName }}</h4>
      <span 
        class="px-3 py-1 rounded-full text-sm font-medium"
        :class="evaluationColor"
      >
        {{ evaluationIcon }} {{ summary.evaluation.toUpperCase() }}
      </span>
    </div>

    <div class="grid grid-cols-3 gap-2 sm:gap-4 mb-3 sm:mb-4 text-center">
      <div class="bg-gray-50 rounded-lg p-2 sm:p-3">
        <div class="text-xl sm:text-2xl font-bold text-gray-900">{{ summary.totalGoals }}</div>
        <div class="text-xs text-gray-500">Total</div>
      </div>
      <div class="bg-green-50 rounded-lg p-2 sm:p-3">
        <div class="text-xl sm:text-2xl font-bold text-green-700">{{ summary.completedGoals }}</div>
        <div class="text-xs text-gray-500">Cumplidas</div>
      </div>
      <div class="bg-orange-50 rounded-lg p-2 sm:p-3">
        <div class="text-xl sm:text-2xl font-bold text-orange-700">{{ summary.pendingGoals }}</div>
        <div class="text-xs text-gray-500">Pendientes</div>
      </div>
    </div>

    <div class="mb-2 sm:mb-3">
      <div class="flex justify-between text-sm text-gray-600 mb-1">
        <span>Progreso</span>
        <span class="font-semibold">{{ summary.progressPercentage }}%</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2 sm:h-3">
        <div 
          class="h-2 sm:h-3 rounded-full transition-all duration-500"
          :class="progressBarColor"
          :style="{ width: `${summary.progressPercentage}%` }"
        ></div>
      </div>
    </div>

    <p class="text-sm text-gray-700">
      {{ summaryMessage }}
    </p>

    <div v-if="isClosed" class="mt-3 text-xs text-gray-500 flex items-center gap-1">
      🔒 Mes cerrado
    </div>
  </div>
</template>
