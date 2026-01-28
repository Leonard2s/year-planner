<script setup lang="ts">
import { computed } from 'vue'
import type { Goal } from '../types'

const props = defineProps<{
  goal: Goal
  monthId: number
  isClosed: boolean
}>()

const emit = defineEmits<{
  (e: 'update', goalId: string, updates: Partial<Goal>): void
  (e: 'delete', goalId: string): void
  (e: 'showDetail', goalId: string): void
}>()

const progressPercentage = computed(() => {
  if (props.goal.targetValue === 0) return 100
  return Math.min(100, Math.round((props.goal.currentValue / props.goal.targetValue) * 100))
})

const remaining = computed(() => {
  return Math.max(0, props.goal.targetValue - props.goal.currentValue)
})

const cardStyle = computed(() => {
  switch (props.goal.type) {
    case 'ahorro': return {
      bg: 'bg-gradient-to-br from-emerald-50 to-teal-50',
      border: 'border-emerald-400',
      accent: 'text-emerald-600',
      progressBg: 'bg-emerald-100',
      progressBar: 'bg-gradient-to-r from-emerald-400 to-teal-500',
      icon: '💰',
      label: 'Ahorro'
    }
    case 'viaje': return {
      bg: 'bg-gradient-to-br from-blue-50 to-indigo-50',
      border: 'border-blue-400',
      accent: 'text-blue-600',
      progressBg: 'bg-blue-100',
      progressBar: 'bg-gradient-to-r from-blue-400 to-indigo-500',
      icon: '✈️',
      label: 'Viaje'
    }
    case 'compra': return {
      bg: 'bg-gradient-to-br from-purple-50 to-fuchsia-50',
      border: 'border-purple-400',
      accent: 'text-purple-600',
      progressBg: 'bg-purple-100',
      progressBar: 'bg-gradient-to-r from-purple-400 to-fuchsia-500',
      icon: '🛒',
      label: 'Compra'
    }
  }
})

const statusBadge = computed(() => {
  switch (props.goal.status) {
    case 'cumplida': return { text: '✓ Completada', class: 'bg-green-500 text-white' }
    case 'parcial': return { text: '◐ Parcial', class: 'bg-amber-500 text-white' }
    case 'no_cumplida': return { text: '✗ No cumplida', class: 'bg-red-500 text-white' }
    default: return { text: '○ En progreso', class: 'bg-gray-400 text-white' }
  }
})

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}
</script>

<template>
  <div 
    class="group relative rounded-2xl p-4 sm:p-5 mb-4 border-l-4 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
    :class="[cardStyle.bg, cardStyle.border]"
    @click="emit('showDetail', goal.id)"
  >
    <!-- Status badge -->
    <div class="absolute -top-2 right-4">
      <span 
        class="text-xs font-semibold px-3 py-1 rounded-full shadow-sm"
        :class="statusBadge.class"
      >
        {{ statusBadge.text }}
      </span>
    </div>

    <!-- Header -->
    <div class="flex items-start gap-3 mb-4">
      <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm" :class="cardStyle.bg">
        {{ cardStyle.icon }}
      </div>
      <div class="flex-1 min-w-0 pt-1">
        <div class="flex items-center gap-2 mb-1">
          <span class="text-xs font-bold uppercase tracking-wider" :class="cardStyle.accent">
            {{ cardStyle.label }}
          </span>
          <span 
            v-if="goal.carryOver" 
            class="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700"
          >
            ↩ Arrastrada
          </span>
          <span 
            v-if="goal.isDistributed" 
            class="text-xs font-medium px-2 py-0.5 rounded-full bg-violet-100 text-violet-700"
          >
            📊 Distribuida
          </span>
        </div>
        <h4 class="text-base sm:text-lg font-bold text-gray-800 truncate">{{ goal.title }}</h4>
      </div>
    </div>

    <!-- Info chips -->
    <div class="flex flex-wrap gap-2 mb-4" v-if="goal.expenses?.length || goal.purchaseItems?.length">
      <span 
        v-if="goal.expenses && goal.expenses.length > 0" 
        class="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg bg-white/70 text-gray-600"
      >
        📋 {{ goal.expenses.length }} gasto{{ goal.expenses.length > 1 ? 's' : '' }}
      </span>
      <span 
        v-if="goal.purchaseItems && goal.purchaseItems.length > 0" 
        class="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg bg-white/70 text-gray-600"
      >
        📦 {{ goal.purchaseItems.length }} artículo{{ goal.purchaseItems.length > 1 ? 's' : '' }}
      </span>
    </div>

    <!-- Progress section -->
    <div class="space-y-3">
      <!-- Amount display -->
      <div class="flex items-end justify-between">
        <div>
          <p class="text-xs text-gray-500 mb-0.5">{{ goal.type === 'ahorro' ? 'Ahorrado' : 'Gastado' }}</p>
          <p class="text-xl sm:text-2xl font-bold text-gray-800">{{ formatCurrency(goal.currentValue) }}</p>
        </div>
        <div class="text-right">
          <p class="text-xs text-gray-500 mb-0.5">{{ goal.type === 'ahorro' ? 'Meta' : 'Tope' }}</p>
          <p class="text-lg font-semibold" :class="cardStyle.accent">{{ formatCurrency(goal.targetValue) }}</p>
        </div>
      </div>

      <!-- Progress bar -->
      <div class="relative">
        <div class="w-full h-3 rounded-full overflow-hidden" :class="cardStyle.progressBg">
          <div 
            class="h-full rounded-full transition-all duration-500 ease-out"
            :class="cardStyle.progressBar"
            :style="{ width: `${progressPercentage}%` }"
          ></div>
        </div>
        <div class="absolute -top-1 right-0 transform translate-x-1/2" :style="{ left: `${Math.min(95, progressPercentage)}%` }">
          <span class="text-xs font-bold text-gray-700 bg-white px-1.5 py-0.5 rounded shadow-sm">
            {{ progressPercentage }}%
          </span>
        </div>
      </div>

      <!-- Remaining -->
      <div class="flex justify-between items-center text-sm">
        <span class="text-gray-500">
          {{ goal.type === 'ahorro' ? 'Faltan' : 'Disponible' }}: 
          <strong class="text-gray-700">{{ formatCurrency(remaining) }}</strong>
        </span>
        <span class="text-xs text-gray-400 group-hover:text-gray-600 transition-colors">
          Click para ver detalles →
        </span>
      </div>
    </div>

    <!-- Quick delete (only when not closed) -->
    <button
      v-if="!isClosed"
      @click.stop="emit('delete', goal.id)"
      class="absolute top-3 left-3 w-6 h-6 rounded-full bg-red-100 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs hover:bg-red-200"
      title="Eliminar"
    >
      ✕
    </button>
  </div>
</template>
