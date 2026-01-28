<script setup lang="ts">
import { computed } from 'vue'
import type { ExpenseCategory, IncomeCategory } from '../types'
import { EXPENSE_CATEGORY_LABELS, INCOME_CATEGORY_LABELS, MONTH_NAMES } from '../types'

const props = defineProps<{
  selectedMonth: number
  monthlyIncome: number
  monthlyExpenses: number
  monthlyBalance: number
  totalBalance: number
  savingsRate: number
  expensesByCategory: { category: ExpenseCategory; amount: number }[]
  incomeByCategory: { category: IncomeCategory; amount: number }[]
  yearlyIncome: number
  yearlyExpenses: number
}>()

const emit = defineEmits<{
  (e: 'addTransaction'): void
}>()

const monthName = computed(() => MONTH_NAMES[props.selectedMonth - 1])

const savingsRateClass = computed(() => {
  if (props.savingsRate >= 20) return 'text-green-600 bg-green-100'
  if (props.savingsRate >= 10) return 'text-yellow-600 bg-yellow-100'
  if (props.savingsRate >= 0) return 'text-orange-600 bg-orange-100'
  return 'text-red-600 bg-red-100'
})

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0
  }).format(value)
}

function getCategoryLabel(category: ExpenseCategory | IncomeCategory, type: 'income' | 'expense'): string {
  if (type === 'income') {
    return INCOME_CATEGORY_LABELS[category as IncomeCategory] || category
  }
  return EXPENSE_CATEGORY_LABELS[category as ExpenseCategory] || category
}

function getPercentage(amount: number, total: number): number {
  if (total === 0) return 0
  return Math.round((amount / total) * 100)
}

const topExpenses = computed(() => props.expensesByCategory.slice(0, 5))
const topIncomes = computed(() => props.incomeByCategory.slice(0, 5))
</script>

<template>
  <div class="space-y-4">
    <!-- Main Balance Card -->
    <div class="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-3xl p-6 text-white shadow-xl">
      <div class="flex items-center justify-between mb-4">
        <div>
          <p class="text-white/70 text-sm font-medium">Balance Total</p>
          <h2 class="text-3xl sm:text-4xl font-bold">{{ formatCurrency(totalBalance) }}</h2>
        </div>
        <button
          @click="emit('addTransaction')"
          class="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-2xl hover:bg-white/30 transition-colors"
        >
          ➕
        </button>
      </div>
      
      <div class="grid grid-cols-3 gap-3 mt-6">
        <div class="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
          <p class="text-xs text-white/70 mb-1">Ingresos</p>
          <p class="text-lg font-bold text-green-300">+{{ formatCurrency(monthlyIncome) }}</p>
        </div>
        <div class="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
          <p class="text-xs text-white/70 mb-1">Gastos</p>
          <p class="text-lg font-bold text-red-300">-{{ formatCurrency(monthlyExpenses) }}</p>
        </div>
        <div class="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
          <p class="text-xs text-white/70 mb-1">Balance</p>
          <p class="text-lg font-bold" :class="monthlyBalance >= 0 ? 'text-green-300' : 'text-red-300'">
            {{ formatCurrency(monthlyBalance) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Month Stats -->
    <div class="bg-white rounded-2xl shadow-sm p-5">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-bold text-gray-800">📅 {{ monthName }}</h3>
        <span 
          class="px-3 py-1 rounded-full text-sm font-semibold"
          :class="savingsRateClass"
        >
          {{ savingsRate >= 0 ? '📈' : '📉' }} {{ savingsRate }}% ahorro
        </span>
      </div>
      
      <!-- Income vs Expense Bar -->
      <div class="space-y-3">
        <div>
          <div class="flex justify-between text-sm mb-1">
            <span class="text-gray-600">Ingresos</span>
            <span class="font-semibold text-green-600">{{ formatCurrency(monthlyIncome) }}</span>
          </div>
          <div class="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div 
              class="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500"
              :style="{ width: `${Math.min(100, getPercentage(monthlyIncome, Math.max(monthlyIncome, monthlyExpenses)))}%` }"
            ></div>
          </div>
        </div>
        <div>
          <div class="flex justify-between text-sm mb-1">
            <span class="text-gray-600">Gastos</span>
            <span class="font-semibold text-red-600">{{ formatCurrency(monthlyExpenses) }}</span>
          </div>
          <div class="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div 
              class="h-full bg-gradient-to-r from-red-400 to-rose-500 rounded-full transition-all duration-500"
              :style="{ width: `${Math.min(100, getPercentage(monthlyExpenses, Math.max(monthlyIncome, monthlyExpenses)))}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Category Breakdown -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <!-- Top Expenses -->
      <div class="bg-white rounded-2xl shadow-sm p-5">
        <h3 class="font-bold text-gray-800 mb-4">📤 Top Gastos</h3>
        <div v-if="topExpenses.length === 0" class="text-center py-6 text-gray-400">
          <p class="text-2xl mb-2">💸</p>
          <p class="text-sm">Sin gastos este mes</p>
        </div>
        <div v-else class="space-y-3">
          <div v-for="item in topExpenses" :key="item.category" class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-sm">
              {{ getCategoryLabel(item.category, 'expense').split(' ')[0] }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-center mb-1">
                <span class="text-sm font-medium text-gray-700 truncate">
                  {{ getCategoryLabel(item.category, 'expense').split(' ').slice(1).join(' ') }}
                </span>
                <span class="text-sm font-bold text-gray-800">{{ formatCurrency(item.amount) }}</span>
              </div>
              <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-gradient-to-r from-red-400 to-rose-500 rounded-full"
                  :style="{ width: `${getPercentage(item.amount, monthlyExpenses)}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Income -->
      <div class="bg-white rounded-2xl shadow-sm p-5">
        <h3 class="font-bold text-gray-800 mb-4">📥 Top Ingresos</h3>
        <div v-if="topIncomes.length === 0" class="text-center py-6 text-gray-400">
          <p class="text-2xl mb-2">💰</p>
          <p class="text-sm">Sin ingresos este mes</p>
        </div>
        <div v-else class="space-y-3">
          <div v-for="item in topIncomes" :key="item.category" class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-sm">
              {{ getCategoryLabel(item.category, 'income').split(' ')[0] }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-center mb-1">
                <span class="text-sm font-medium text-gray-700 truncate">
                  {{ getCategoryLabel(item.category, 'income').split(' ').slice(1).join(' ') }}
                </span>
                <span class="text-sm font-bold text-gray-800">{{ formatCurrency(item.amount) }}</span>
              </div>
              <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                  :style="{ width: `${getPercentage(item.amount, monthlyIncome)}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Yearly Summary -->
    <div class="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-5 text-white">
      <h3 class="font-bold mb-4">📊 Resumen Anual {{ new Date().getFullYear() }}</h3>
      <div class="grid grid-cols-3 gap-3">
        <div class="text-center">
          <p class="text-xs text-white/60 mb-1">Total Ingresos</p>
          <p class="text-lg font-bold text-green-400">{{ formatCurrency(yearlyIncome) }}</p>
        </div>
        <div class="text-center">
          <p class="text-xs text-white/60 mb-1">Total Gastos</p>
          <p class="text-lg font-bold text-red-400">{{ formatCurrency(yearlyExpenses) }}</p>
        </div>
        <div class="text-center">
          <p class="text-xs text-white/60 mb-1">Balance Anual</p>
          <p 
            class="text-lg font-bold"
            :class="yearlyIncome - yearlyExpenses >= 0 ? 'text-green-400' : 'text-red-400'"
          >
            {{ formatCurrency(yearlyIncome - yearlyExpenses) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
