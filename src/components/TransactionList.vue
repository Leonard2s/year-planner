<script setup lang="ts">
import { computed } from 'vue'
import type { Transaction } from '../types'
import { INCOME_CATEGORY_LABELS, EXPENSE_CATEGORY_LABELS, PAYMENT_METHOD_LABELS } from '../types'

const props = defineProps<{
  transactions: Transaction[]
}>()

const emit = defineEmits<{
  (e: 'edit', transaction: Transaction): void
  (e: 'delete', id: string): void
}>()

const groupedTransactions = computed(() => {
  const groups: Record<string, Transaction[]> = {}
  
  props.transactions.forEach(t => {
    const dateKey = new Date(t.date).toLocaleDateString('es-MX', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(t)
  })
  
  return groups
})

function getCategoryLabel(transaction: Transaction): string {
  if (transaction.type === 'ingreso') {
    return INCOME_CATEGORY_LABELS[transaction.category as keyof typeof INCOME_CATEGORY_LABELS] || transaction.category
  }
  return EXPENSE_CATEGORY_LABELS[transaction.category as keyof typeof EXPENSE_CATEGORY_LABELS] || transaction.category
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0
  }).format(value)
}

function confirmDelete(id: string) {
  if (confirm('¿Eliminar esta transacción?')) {
    emit('delete', id)
  }
}
</script>

<template>
  <div class="space-y-4">
    <!-- Empty state -->
    <div 
      v-if="transactions.length === 0" 
      class="text-center py-12 bg-white rounded-2xl shadow-sm"
    >
      <div class="text-5xl mb-4">📊</div>
      <h3 class="text-lg font-semibold text-gray-700 mb-2">Sin transacciones</h3>
      <p class="text-sm text-gray-500">Agrega tu primer ingreso o gasto</p>
    </div>

    <!-- Grouped by date -->
    <div v-for="(dayTransactions, dateLabel) in groupedTransactions" :key="dateLabel">
      <div class="sticky top-0 bg-gray-100 py-2 z-10">
        <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">
          {{ dateLabel }}
        </h3>
      </div>
      
      <div class="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-100">
        <div 
          v-for="transaction in dayTransactions" 
          :key="transaction.id"
          class="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors group"
        >
          <!-- Category Icon -->
          <div 
            class="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            :class="transaction.type === 'ingreso' ? 'bg-green-100' : 'bg-red-100'"
          >
            {{ getCategoryLabel(transaction).split(' ')[0] }}
          </div>
          
          <!-- Details -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="font-semibold text-gray-800 truncate">{{ transaction.description }}</span>
              <span 
                v-if="transaction.isRecurring" 
                class="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full"
              >
                🔄
              </span>
            </div>
            <div class="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
              <span>{{ getCategoryLabel(transaction).split(' ').slice(1).join(' ') }}</span>
              <span>•</span>
              <span>{{ PAYMENT_METHOD_LABELS[transaction.paymentMethod] }}</span>
            </div>
          </div>
          
          <!-- Amount -->
          <div class="text-right flex-shrink-0">
            <div 
              class="font-bold text-lg"
              :class="transaction.type === 'ingreso' ? 'text-green-600' : 'text-red-600'"
            >
              {{ transaction.type === 'ingreso' ? '+' : '-' }}{{ formatCurrency(transaction.amount) }}
            </div>
          </div>
          
          <!-- Actions -->
          <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button
              @click="emit('edit', transaction)"
              class="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 hover:bg-indigo-200 flex items-center justify-center text-sm transition-colors"
            >
              ✏️
            </button>
            <button
              @click="confirmDelete(transaction.id)"
              class="w-8 h-8 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center text-sm transition-colors"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
