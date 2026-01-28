<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Goal, ExpenseItem } from '../types'
import ExpenseList from './ExpenseList.vue'

const props = defineProps<{
  goal: Goal
}>()

const emit = defineEmits<{
  (e: 'save', goalId: string, updates: Partial<Goal>): void
  (e: 'close'): void
}>()

const title = ref(props.goal.title)
const targetValue = ref(props.goal.targetValue)
const currentValue = ref(props.goal.currentValue)
const expenses = ref<ExpenseItem[]>(props.goal.expenses ? [...props.goal.expenses] : [])
const purchaseItems = ref<ExpenseItem[]>(props.goal.purchaseItems ? [...props.goal.purchaseItems] : [])

watch(() => props.goal, (newGoal) => {
  title.value = newGoal.title
  targetValue.value = newGoal.targetValue
  currentValue.value = newGoal.currentValue
  expenses.value = newGoal.expenses ? [...newGoal.expenses] : []
  purchaseItems.value = newGoal.purchaseItems ? [...newGoal.purchaseItems] : []
}, { deep: true })

const totalExpenses = computed(() => {
  return expenses.value.reduce((sum, item) => sum + item.cost, 0)
})

const totalPurchaseItems = computed(() => {
  return purchaseItems.value.reduce((sum, item) => sum + item.cost, 0)
})

const computedTargetValue = computed(() => {
  if (props.goal.type === 'viaje') return totalExpenses.value
  if (props.goal.type === 'compra') return totalPurchaseItems.value
  return targetValue.value
})

const isValid = computed(() => {
  if (!title.value.trim()) return false
  if (props.goal.type === 'ahorro' && targetValue.value <= 0) return false
  if (props.goal.type === 'viaje' && expenses.value.length === 0) return false
  if (props.goal.type === 'compra' && purchaseItems.value.length === 0) return false
  return true
})

const typeStyle = computed(() => {
  switch (props.goal.type) {
    case 'ahorro': return {
      icon: '💰',
      label: 'Meta de Ahorro',
      accent: 'emerald',
      headerBg: 'bg-gradient-to-r from-emerald-500 to-teal-500'
    }
    case 'viaje': return {
      icon: '✈️',
      label: 'Viaje',
      accent: 'blue',
      headerBg: 'bg-gradient-to-r from-blue-500 to-indigo-500'
    }
    case 'compra': return {
      icon: '🛒',
      label: 'Compra',
      accent: 'purple',
      headerBg: 'bg-gradient-to-r from-purple-500 to-fuchsia-500'
    }
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

function handleSave() {
  if (!isValid.value) return

  const updates: Partial<Goal> = {
    title: title.value.trim(),
    currentValue: currentValue.value
  }

  if (props.goal.type === 'ahorro') {
    updates.targetValue = targetValue.value
  } else if (props.goal.type === 'viaje') {
    updates.targetValue = totalExpenses.value
    updates.expenses = [...expenses.value]
  } else if (props.goal.type === 'compra') {
    updates.targetValue = totalPurchaseItems.value
    updates.purchaseItems = [...purchaseItems.value]
  }

  emit('save', props.goal.id, updates)
  emit('close')
}
</script>

<template>
  <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
    <!-- Header -->
    <div class="p-5 text-white" :class="typeStyle.headerBg">
      <div class="flex items-center gap-3">
        <span class="text-3xl">{{ typeStyle.icon }}</span>
        <div>
          <p class="text-sm opacity-90">Editando</p>
          <h3 class="text-xl font-bold">{{ typeStyle.label }}</h3>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-5 space-y-5">
      <!-- Title -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">
          Nombre
        </label>
        <input
          v-model="title"
          type="text"
          class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-gray-800 font-medium"
          placeholder="Nombre de la meta..."
        />
      </div>

      <!-- Expenses list for travel -->
      <div v-if="goal.type === 'viaje'">
        <ExpenseList
          :expenses="expenses"
          label="Gastos del Viaje"
          @update="(items) => expenses = items"
        />
        <div v-if="totalExpenses > 0" class="mt-3 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
          <p class="text-sm text-gray-600">Presupuesto Total (Tope)</p>
          <p class="text-2xl font-bold text-blue-600">{{ formatCurrency(totalExpenses) }}</p>
        </div>
      </div>

      <!-- Purchase items list for compra -->
      <div v-if="goal.type === 'compra'">
        <ExpenseList
          :expenses="purchaseItems"
          label="Artículos a Comprar"
          @update="(items) => purchaseItems = items"
        />
        <div v-if="totalPurchaseItems > 0" class="mt-3 p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
          <p class="text-sm text-gray-600">Presupuesto Total (Tope)</p>
          <p class="text-2xl font-bold text-purple-600">{{ formatCurrency(totalPurchaseItems) }}</p>
        </div>
      </div>

      <!-- Target value for ahorro -->
      <div v-if="goal.type === 'ahorro'">
        <label class="block text-sm font-semibold text-gray-700 mb-2">
          Meta de Ahorro
        </label>
        <div class="relative">
          <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
          <input
            v-model.number="targetValue"
            type="number"
            min="0"
            step="100"
            class="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors text-gray-800 font-medium"
            placeholder="0"
          />
        </div>
      </div>

      <!-- Current value -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">
          {{ goal.type === 'ahorro' ? 'Monto Ahorrado' : 'Monto Gastado' }}
        </label>
        <div class="relative">
          <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
          <input
            v-model.number="currentValue"
            type="number"
            min="0"
            step="100"
            class="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 transition-colors text-gray-800 font-medium"
            placeholder="0"
          />
        </div>
        <p class="text-xs text-gray-500 mt-1">
          {{ goal.type === 'ahorro' ? '¿Cuánto llevas ahorrado?' : '¿Cuánto has gastado hasta ahora?' }}
        </p>
      </div>

      <!-- Progress preview -->
      <div class="p-4 bg-gray-50 rounded-xl">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm text-gray-600">Progreso</span>
          <span class="text-sm font-bold text-gray-800">
            {{ Math.min(100, Math.round((currentValue / (computedTargetValue || 1)) * 100)) }}%
          </span>
        </div>
        <div class="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div 
            class="h-full rounded-full transition-all duration-300"
            :class="{
              'bg-gradient-to-r from-emerald-400 to-teal-500': goal.type === 'ahorro',
              'bg-gradient-to-r from-blue-400 to-indigo-500': goal.type === 'viaje',
              'bg-gradient-to-r from-purple-400 to-fuchsia-500': goal.type === 'compra'
            }"
            :style="{ width: `${Math.min(100, Math.round((currentValue / (computedTargetValue || 1)) * 100))}%` }"
          ></div>
        </div>
        <div class="flex justify-between mt-2 text-xs text-gray-500">
          <span>{{ formatCurrency(currentValue) }}</span>
          <span>{{ formatCurrency(computedTargetValue) }}</span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="p-5 border-t border-gray-100 bg-gray-50 flex gap-3">
      <button
        type="button"
        @click="emit('close')"
        class="flex-1 py-3 px-4 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
      >
        Cancelar
      </button>
      <button
        type="button"
        @click="handleSave"
        :disabled="!isValid"
        class="flex-1 py-3 px-4 rounded-xl text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        :class="{
          'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600': goal.type === 'ahorro',
          'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600': goal.type === 'viaje',
          'bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-600 hover:to-fuchsia-600': goal.type === 'compra'
        }"
      >
        Guardar Cambios
      </button>
    </div>
  </div>
</template>
