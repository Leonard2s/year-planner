<script setup lang="ts">
import { ref } from 'vue'
import type { ExpenseItem } from '../types'

const props = defineProps<{
  expenses: ExpenseItem[]
  label: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update', expenses: ExpenseItem[]): void
}>()

const newItemName = ref('')
const newItemCost = ref<number>(0)

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

function addExpense() {
  if (!newItemName.value.trim() || newItemCost.value <= 0) return
  
  const newExpense: ExpenseItem = {
    id: generateId(),
    name: newItemName.value.trim(),
    cost: newItemCost.value
  }
  
  emit('update', [...props.expenses, newExpense])
  newItemName.value = ''
  newItemCost.value = 0
}

function removeExpense(id: string) {
  emit('update', props.expenses.filter(e => e.id !== id))
}

function formatCurrency(value: number): string {
  return '$' + new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}
</script>

<template>
  <div class="rounded-2xl border-2 border-gray-100 overflow-hidden">
    <div class="px-4 py-3 bg-gray-50 border-b border-gray-100">
      <h4 class="text-sm font-bold text-gray-700">{{ label }}</h4>
    </div>
    
    <!-- Add new item -->
    <div v-if="!disabled" class="p-4 bg-white border-b border-gray-100">
      <div class="flex flex-col sm:flex-row gap-2">
        <input
          v-model="newItemName"
          type="text"
          placeholder="Nombre del gasto"
          class="flex-1 px-3 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 transition-colors"
          @keyup.enter="addExpense"
        />
        <div class="flex gap-2">
          <div class="relative flex-1 sm:w-28">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">$</span>
            <input
              v-model.number="newItemCost"
              type="number"
              min="0"
              step="100"
              placeholder="0"
              class="w-full pl-7 pr-2 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 transition-colors"
              @keyup.enter="addExpense"
            />
          </div>
          <button
            type="button"
            @click="addExpense"
            class="w-11 h-11 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-lg font-bold rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all flex items-center justify-center flex-shrink-0"
          >
            +
          </button>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="expenses.length === 0" class="text-center py-8 bg-white">
      <p class="text-sm text-gray-400">📝 Agrega tu primer gasto</p>
    </div>

    <!-- Items list -->
    <div v-else class="bg-white divide-y divide-gray-100">
      <div
        v-for="expense in expenses"
        :key="expense.id"
        class="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors group"
      >
        <span class="text-sm text-gray-700 font-medium">{{ expense.name }}</span>
        <div class="flex items-center gap-3">
          <span class="text-sm font-bold text-gray-900">{{ formatCurrency(expense.cost) }}</span>
          <button
            v-if="!disabled"
            @click="removeExpense(expense.id)"
            class="w-6 h-6 rounded-full bg-red-100 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs hover:bg-red-200"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
