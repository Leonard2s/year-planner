<script setup lang="ts">
import { computed } from 'vue'
import type { Goal } from '../types'

const props = defineProps<{
  goal: Goal
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'edit'): void
}>()

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

const totalExpenses = computed(() => {
  if (props.goal.expenses) {
    return props.goal.expenses.reduce((sum, item) => sum + item.cost, 0)
  }
  return 0
})

const totalPurchaseItems = computed(() => {
  if (props.goal.purchaseItems) {
    return props.goal.purchaseItems.reduce((sum, item) => sum + item.cost, 0)
  }
  return 0
})

const progressPercentage = computed(() => {
  if (props.goal.targetValue === 0) return 100
  return Math.min(100, Math.round((props.goal.currentValue / props.goal.targetValue) * 100))
})

const remaining = computed(() => {
  return Math.max(0, props.goal.targetValue - props.goal.currentValue)
})

const typeStyle = computed(() => {
  switch (props.goal.type) {
    case 'ahorro': return {
      icon: '💰',
      label: 'Meta de Ahorro',
      headerBg: 'bg-gradient-to-r from-emerald-500 to-teal-500',
      progressBar: 'bg-gradient-to-r from-emerald-400 to-teal-500',
      accent: 'text-emerald-600',
      lightBg: 'bg-emerald-50',
      border: 'border-emerald-200'
    }
    case 'viaje': return {
      icon: '✈️',
      label: 'Viaje',
      headerBg: 'bg-gradient-to-r from-blue-500 to-indigo-500',
      progressBar: 'bg-gradient-to-r from-blue-400 to-indigo-500',
      accent: 'text-blue-600',
      lightBg: 'bg-blue-50',
      border: 'border-blue-200'
    }
    case 'compra': return {
      icon: '🛒',
      label: 'Compra',
      headerBg: 'bg-gradient-to-r from-purple-500 to-fuchsia-500',
      progressBar: 'bg-gradient-to-r from-purple-400 to-fuchsia-500',
      accent: 'text-purple-600',
      lightBg: 'bg-purple-50',
      border: 'border-purple-200'
    }
  }
})

const statusInfo = computed(() => {
  switch (props.goal.status) {
    case 'cumplida': return { text: 'Completada', icon: '✓', class: 'bg-green-100 text-green-700' }
    case 'parcial': return { text: 'Parcial', icon: '◐', class: 'bg-amber-100 text-amber-700' }
    case 'no_cumplida': return { text: 'No Cumplida', icon: '✗', class: 'bg-red-100 text-red-700' }
    default: return { text: 'En Progreso', icon: '○', class: 'bg-gray-100 text-gray-700' }
  }
})
</script>

<template>
  <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
    <!-- Header -->
    <div class="p-5 text-white relative" :class="typeStyle.headerBg">
      <button
        @click="emit('close')"
        class="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
      >
        <span class="text-xl leading-none">×</span>
      </button>
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-4xl">
          {{ typeStyle.icon }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm opacity-90 mb-1">{{ typeStyle.label }}</p>
          <h3 class="text-xl font-bold truncate">{{ goal.title }}</h3>
          <div class="flex items-center gap-2 mt-2">
            <span 
              class="text-xs font-semibold px-2.5 py-1 rounded-full"
              :class="statusInfo.class"
            >
              {{ statusInfo.icon }} {{ statusInfo.text }}
            </span>
            <span v-if="goal.carryOver" class="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
              ↩ Arrastrada
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-5 space-y-5">
      <!-- Progress Card -->
      <div class="p-5 rounded-2xl" :class="[typeStyle.lightBg, typeStyle.border]" style="border-width: 2px;">
        <div class="flex items-end justify-between mb-4">
          <div>
            <p class="text-xs text-gray-500 mb-1">{{ goal.type === 'ahorro' ? 'Ahorrado' : 'Gastado' }}</p>
            <p class="text-3xl font-bold text-gray-800">{{ formatCurrency(goal.currentValue) }}</p>
          </div>
          <div class="text-right">
            <p class="text-xs text-gray-500 mb-1">{{ goal.type === 'ahorro' ? 'Meta' : 'Presupuesto' }}</p>
            <p class="text-xl font-semibold" :class="typeStyle.accent">{{ formatCurrency(goal.targetValue) }}</p>
          </div>
        </div>

        <!-- Progress bar -->
        <div class="relative mb-3">
          <div class="w-full h-4 bg-white rounded-full overflow-hidden shadow-inner">
            <div 
              class="h-full rounded-full transition-all duration-500"
              :class="typeStyle.progressBar"
              :style="{ width: `${progressPercentage}%` }"
            ></div>
          </div>
          <div 
            class="absolute -top-1 transform -translate-x-1/2"
            :style="{ left: `${Math.min(92, Math.max(8, progressPercentage))}%` }"
          >
            <span class="text-sm font-bold text-gray-800 bg-white px-2 py-0.5 rounded-full shadow">
              {{ progressPercentage }}%
            </span>
          </div>
        </div>

        <p class="text-sm text-gray-600 text-center">
          {{ goal.type === 'ahorro' ? 'Faltan' : 'Disponible' }}: 
          <strong class="text-gray-800">{{ formatCurrency(remaining) }}</strong>
        </p>
      </div>

      <!-- Expense Items for Travel -->
      <div v-if="goal.expenses && goal.expenses.length > 0" class="rounded-2xl border-2 border-gray-100 overflow-hidden">
        <div class="px-4 py-3 bg-gray-50 border-b border-gray-100">
          <h4 class="font-semibold text-gray-700 flex items-center gap-2">
            📋 Gastos del Viaje
            <span class="text-xs font-normal text-gray-500">({{ goal.expenses.length }})</span>
          </h4>
        </div>
        <div class="divide-y divide-gray-100">
          <div
            v-for="expense in goal.expenses"
            :key="expense.id"
            class="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
          >
            <span class="text-sm text-gray-700">{{ expense.name }}</span>
            <span class="text-sm font-semibold text-gray-900">{{ formatCurrency(expense.cost) }}</span>
          </div>
        </div>
        <div class="px-4 py-3 bg-blue-50 flex items-center justify-between">
          <span class="font-semibold text-gray-700">Total</span>
          <span class="text-lg font-bold text-blue-600">{{ formatCurrency(totalExpenses) }}</span>
        </div>
      </div>

      <!-- Purchase Items -->
      <div v-if="goal.purchaseItems && goal.purchaseItems.length > 0" class="rounded-2xl border-2 border-gray-100 overflow-hidden">
        <div class="px-4 py-3 bg-gray-50 border-b border-gray-100">
          <h4 class="font-semibold text-gray-700 flex items-center gap-2">
            📦 Artículos
            <span class="text-xs font-normal text-gray-500">({{ goal.purchaseItems.length }})</span>
          </h4>
        </div>
        <div class="divide-y divide-gray-100">
          <div
            v-for="item in goal.purchaseItems"
            :key="item.id"
            class="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
          >
            <span class="text-sm text-gray-700">{{ item.name }}</span>
            <span class="text-sm font-semibold text-gray-900">{{ formatCurrency(item.cost) }}</span>
          </div>
        </div>
        <div class="px-4 py-3 bg-purple-50 flex items-center justify-between">
          <span class="font-semibold text-gray-700">Total</span>
          <span class="text-lg font-bold text-purple-600">{{ formatCurrency(totalPurchaseItems) }}</span>
        </div>
      </div>

      <!-- Distributed Goal Info -->
      <div v-if="goal.isDistributed" class="p-4 rounded-2xl bg-violet-50 border-2 border-violet-200">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-xl">
            📊
          </div>
          <div>
            <p class="font-semibold text-violet-800">Meta Distribuida</p>
            <p class="text-sm text-violet-600">
              Ahorro mensual: <strong>{{ formatCurrency(goal.monthlyAmount || 0) }}</strong>
            </p>
          </div>
        </div>
      </div>

      <!-- Metadata -->
      <div class="flex items-center justify-between text-xs text-gray-400 pt-2">
        <span>Creada: {{ new Date(goal.createdAt).toLocaleDateString('es-MX') }}</span>
        <span v-if="goal.completedAt">
          Completada: {{ new Date(goal.completedAt).toLocaleDateString('es-MX') }}
        </span>
      </div>
    </div>

    <!-- Footer -->
    <div class="p-5 border-t border-gray-100 bg-gray-50 flex gap-3">
      <button
        @click="emit('close')"
        class="flex-1 py-3 px-4 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
      >
        Cerrar
      </button>
      <button
        @click="emit('edit')"
        class="flex-1 py-3 px-4 rounded-xl text-white font-semibold transition-all"
        :class="typeStyle.headerBg"
      >
        ✏️ Editar
      </button>
    </div>
  </div>
</template>
