<script setup lang="ts">
import { computed } from 'vue'
import type { Month, Goal, MonthSummary } from '../types'
import GoalItem from './GoalItem.vue'
import MonthSummaryComponent from './MonthSummary.vue'
import { calculateMonthSummary } from '../composables/useYearPlan'

const props = defineProps<{
  month: Month
  isLast: boolean
}>()

const emit = defineEmits<{
  (e: 'addGoal', type: 'ahorro' | 'viaje' | 'compra'): void
  (e: 'updateGoal', goalId: string, updates: Partial<Goal>): void
  (e: 'deleteGoal', goalId: string): void
  (e: 'closeMonth'): void
  (e: 'reopenMonth'): void
  (e: 'showDetail', goalId: string): void
}>()

const summary = computed<MonthSummary>(() => calculateMonthSummary(props.month))

const canClose = computed(() => {
  return !props.month.isClosed && !props.isLast && props.month.goals.length > 0
})

const sortedGoals = computed(() => {
  return [...props.month.goals].sort((a, b) => {
    const statusOrder = { cumplida: 2, parcial: 1, pendiente: 0, no_cumplida: 0 }
    return statusOrder[a.status] - statusOrder[b.status]
  })
})
</script>

<template>
  <div class="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
    <!-- Header -->
    <div 
      class="px-5 sm:px-6 py-4 sm:py-5"
      :class="month.isClosed 
        ? 'bg-gradient-to-r from-gray-100 to-gray-50' 
        : 'bg-gradient-to-r from-indigo-500 to-purple-600'"
    >
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-3">
          <div 
            class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            :class="month.isClosed ? 'bg-gray-200' : 'bg-white/20'"
          >
            {{ month.isClosed ? '🔒' : '📅' }}
          </div>
          <div>
            <h3 
              class="text-xl sm:text-2xl font-bold"
              :class="month.isClosed ? 'text-gray-700' : 'text-white'"
            >
              {{ month.name }}
            </h3>
            <p 
              class="text-sm"
              :class="month.isClosed ? 'text-gray-500' : 'text-white/80'"
            >
              {{ month.goals.length }} {{ month.goals.length === 1 ? 'meta' : 'metas' }}
            </p>
          </div>
        </div>
        
        <!-- Action buttons -->
        <div class="flex flex-wrap gap-2">
          <button
            v-if="!month.isClosed"
            @click="emit('addGoal', 'ahorro')"
            class="flex-1 sm:flex-none px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold rounded-xl transition-all backdrop-blur-sm border border-white/20"
          >
            💰 Ahorro
          </button>
          <button
            v-if="!month.isClosed"
            @click="emit('addGoal', 'viaje')"
            class="flex-1 sm:flex-none px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold rounded-xl transition-all backdrop-blur-sm border border-white/20"
          >
            ✈️ Viaje
          </button>
          <button
            v-if="!month.isClosed"
            @click="emit('addGoal', 'compra')"
            class="flex-1 sm:flex-none px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold rounded-xl transition-all backdrop-blur-sm border border-white/20"
          >
            🛒 Compra
          </button>
          <button
            v-if="canClose"
            @click="emit('closeMonth')"
            class="flex-1 sm:flex-none px-4 py-2.5 bg-gray-900/30 hover:bg-gray-900/50 text-white text-sm font-semibold rounded-xl transition-all"
          >
            ✓ Cerrar
          </button>
          <button
            v-if="month.isClosed"
            @click="emit('reopenMonth')"
            class="flex-1 sm:flex-none px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-all"
          >
            ↩ Reabrir
          </button>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="p-5 sm:p-6">
      <MonthSummaryComponent 
        :summary="summary" 
        :month-name="month.name"
        :is-closed="month.isClosed"
        class="mb-6"
      />

      <!-- Empty state -->
      <div v-if="month.goals.length === 0" class="text-center py-12">
        <div class="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center text-4xl">
          🎯
        </div>
        <p class="text-lg font-semibold text-gray-700">No hay metas aún</p>
        <p class="text-sm text-gray-500 mt-1">Comienza agregando tu primera meta del mes</p>
      </div>

      <!-- Goals list -->
      <div v-else>
        <div class="flex items-center justify-between mb-4">
          <h4 class="text-sm font-bold text-gray-500 uppercase tracking-wider">
            Metas del Mes
          </h4>
          <span class="text-xs font-medium text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
            {{ month.goals.length }} total
          </span>
        </div>
        <div class="space-y-1">
          <GoalItem
            v-for="goal in sortedGoals"
            :key="goal.id"
            :goal="goal"
            :month-id="month.id"
            :is-closed="month.isClosed"
            @update="(goalId, updates) => emit('updateGoal', goalId, updates)"
            @delete="(goalId) => emit('deleteGoal', goalId)"
            @show-detail="(goalId) => emit('showDetail', goalId)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
