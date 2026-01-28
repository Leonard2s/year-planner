<script setup lang="ts">
import { computed } from 'vue'
import type { YearPlan, MonthSummary } from '../types'
import { calculateMonthSummary } from '../composables/useYearPlan'

const props = defineProps<{
  yearPlan: YearPlan
}>()

const emit = defineEmits<{
  (e: 'selectMonth', monthId: number): void
}>()

const yearSummary = computed(() => {
  const allGoals = props.yearPlan.months.flatMap(m => m.goals)
  const totalGoals = allGoals.length
  const completedGoals = allGoals.filter(g => g.status === 'cumplida').length
  const progressPercentage = totalGoals > 0 
    ? Math.round((completedGoals / totalGoals) * 100) 
    : 0

  return {
    totalGoals,
    completedGoals,
    pendingGoals: totalGoals - completedGoals,
    progressPercentage
  }
})

const monthsSummary = computed(() => {
  return props.yearPlan.months.map(month => ({
    ...month,
    summary: calculateMonthSummary(month)
  }))
})

function getMonthColor(summary: MonthSummary, isClosed: boolean): string {
  if (summary.totalGoals === 0) return 'bg-gray-100 border-gray-300'
  
  if (isClosed) {
    if (summary.progressPercentage >= 80) return 'bg-green-100 border-green-500'
    if (summary.progressPercentage >= 50) return 'bg-yellow-100 border-yellow-500'
    return 'bg-red-100 border-red-500'
  }
  
  return 'bg-blue-50 border-blue-300'
}

const yearEvaluation = computed(() => {
  if (yearSummary.value.totalGoals === 0) return { text: 'Sin metas', color: 'text-gray-500' }
  
  const pct = yearSummary.value.progressPercentage
  if (pct >= 80) return { text: '🎉 Vas excelente', color: 'text-green-700' }
  if (pct >= 50) return { text: '👍 Vas bien', color: 'text-yellow-700' }
  return { text: '⚠️ Atrasado', color: 'text-red-700' }
})
</script>

<template>
  <div class="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
    <h2 class="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
      📅 Resumen Anual {{ yearPlan.year }}
    </h2>

    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
      <div class="bg-gray-50 rounded-lg p-3 sm:p-4 text-center">
        <div class="text-2xl sm:text-3xl font-bold text-gray-900">{{ yearSummary.totalGoals }}</div>
        <div class="text-xs sm:text-sm text-gray-500">Metas Totales</div>
      </div>
      <div class="bg-green-50 rounded-lg p-3 sm:p-4 text-center">
        <div class="text-2xl sm:text-3xl font-bold text-green-700">{{ yearSummary.completedGoals }}</div>
        <div class="text-xs sm:text-sm text-gray-500">Cumplidas</div>
      </div>
      <div class="bg-orange-50 rounded-lg p-3 sm:p-4 text-center">
        <div class="text-2xl sm:text-3xl font-bold text-orange-700">{{ yearSummary.pendingGoals }}</div>
        <div class="text-xs sm:text-sm text-gray-500">Pendientes</div>
      </div>
      <div class="bg-blue-50 rounded-lg p-3 sm:p-4 text-center">
        <div class="text-2xl sm:text-3xl font-bold text-blue-700">{{ yearSummary.progressPercentage }}%</div>
        <div class="text-xs sm:text-sm text-gray-500">Progreso</div>
      </div>
    </div>

    <div class="flex items-center justify-between mb-3 sm:mb-4">
      <span class="text-sm sm:text-base text-gray-600">Progreso del año</span>
      <span :class="yearEvaluation.color" class="text-sm sm:text-base font-semibold">{{ yearEvaluation.text }}</span>
    </div>

    <div class="w-full bg-gray-200 rounded-full h-3 sm:h-4 mb-4 sm:mb-6">
      <div 
        class="h-3 sm:h-4 rounded-full transition-all duration-500"
        :class="yearSummary.progressPercentage >= 80 ? 'bg-green-500' : yearSummary.progressPercentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'"
        :style="{ width: `${yearSummary.progressPercentage}%` }"
      ></div>
    </div>

    <h3 class="text-sm sm:text-base font-semibold text-gray-700 mb-2 sm:mb-3">Vista por Mes</h3>
    <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
      <button
        v-for="month in monthsSummary"
        :key="month.id"
        @click="emit('selectMonth', month.id)"
        class="p-2 sm:p-3 rounded-lg border-2 text-center transition-all hover:shadow-md cursor-pointer active:scale-95"
        :class="getMonthColor(month.summary, month.isClosed)"
      >
        <div class="text-xs font-medium text-gray-600 truncate">{{ month.name.slice(0, 3) }}</div>
        <div class="text-lg font-bold">
          {{ month.summary.totalGoals > 0 ? month.summary.progressPercentage + '%' : '-' }}
        </div>
        <div class="text-xs text-gray-500">
          {{ month.summary.completedGoals }}/{{ month.summary.totalGoals }}
        </div>
        <div v-if="month.isClosed" class="text-xs mt-1">🔒</div>
      </button>
    </div>
  </div>
</template>
