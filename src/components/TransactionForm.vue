<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { 
  Transaction, 
  TransactionType, 
  IncomeCategory, 
  ExpenseCategory, 
  PaymentMethod,
  RecurrenceType,
  Account
} from '../types'
import { 
  INCOME_CATEGORY_LABELS, 
  EXPENSE_CATEGORY_LABELS, 
  PAYMENT_METHOD_LABELS,
  RECURRENCE_LABELS
} from '../types'

const props = defineProps<{
  accounts: Account[]
  editTransaction?: Transaction | null
}>()

const emit = defineEmits<{
  (e: 'submit', transaction: Omit<Transaction, 'id' | 'createdAt'>): void
  (e: 'close'): void
}>()

const transactionType = ref<TransactionType>('gasto')
const amount = ref<number>(0)
const description = ref('')
const category = ref<IncomeCategory | ExpenseCategory>('alimentacion')
const date = ref<string>(new Date().toISOString().split('T')[0] || '')
const paymentMethod = ref<PaymentMethod>('efectivo')
const selectedAccount = ref<string>('')
const notes = ref('')
const isRecurring = ref(false)
const recurrence = ref<RecurrenceType>('mensual')

// Initialize with edit data if provided
watch(() => props.editTransaction, (transaction) => {
  if (transaction) {
    transactionType.value = transaction.type
    amount.value = transaction.amount
    description.value = transaction.description
    category.value = transaction.category
    date.value = transaction.date.split('T')[0] ?? ''
    paymentMethod.value = transaction.paymentMethod
    selectedAccount.value = transaction.account || ''
    notes.value = transaction.notes || ''
    isRecurring.value = transaction.isRecurring
    recurrence.value = transaction.recurrence || 'mensual'
  }
}, { immediate: true })

// Reset category when type changes
watch(transactionType, (newType) => {
  if (newType === 'ingreso') {
    category.value = 'salario'
  } else {
    category.value = 'alimentacion'
  }
})

const categories = computed(() => {
  if (transactionType.value === 'ingreso') {
    return Object.entries(INCOME_CATEGORY_LABELS).map(([key, label]) => ({
      value: key as IncomeCategory,
      label
    }))
  }
  return Object.entries(EXPENSE_CATEGORY_LABELS).map(([key, label]) => ({
    value: key as ExpenseCategory,
    label
  }))
})

const paymentMethods = Object.entries(PAYMENT_METHOD_LABELS).map(([key, label]) => ({
  value: key as PaymentMethod,
  label
}))

const recurrenceOptions = Object.entries(RECURRENCE_LABELS).map(([key, label]) => ({
  value: key as RecurrenceType,
  label
}))

const isValid = computed(() => {
  return amount.value > 0 && description.value.trim() !== '' && date.value !== ''
})

function handleSubmit() {
  if (!isValid.value) return
  
  const transactionData: Omit<Transaction, 'id' | 'createdAt'> = {
    type: transactionType.value,
    category: category.value,
    amount: amount.value,
    description: description.value.trim(),
    date: date.value,
    paymentMethod: paymentMethod.value,
    isRecurring: isRecurring.value
  }
  
  if (selectedAccount.value) {
    transactionData.account = selectedAccount.value
  }
  if (notes.value.trim()) {
    transactionData.notes = notes.value.trim()
  }
  if (isRecurring.value) {
    transactionData.recurrence = recurrence.value
  }
  
  emit('submit', transactionData)
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0
  }).format(value)
}
</script>

<template>
  <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
    <!-- Header -->
    <div 
      class="px-6 py-4 flex-shrink-0"
      :class="transactionType === 'ingreso' 
        ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
        : 'bg-gradient-to-r from-red-500 to-rose-600'"
    >
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold text-white">
          {{ editTransaction ? '✏️ Editar' : '➕ Nueva' }} Transacción
        </h2>
        <button
          @click="emit('close')"
          class="w-8 h-8 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors flex items-center justify-center"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- Form Body -->
    <div class="flex-1 overflow-y-auto p-6 space-y-5">
      <!-- Transaction Type Toggle -->
      <div class="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
        <button
          type="button"
          @click="transactionType = 'ingreso'"
          class="py-3 rounded-lg font-semibold text-sm transition-all"
          :class="transactionType === 'ingreso' 
            ? 'bg-green-500 text-white shadow-md' 
            : 'text-gray-600 hover:bg-gray-200'"
        >
          📥 Ingreso
        </button>
        <button
          type="button"
          @click="transactionType = 'gasto'"
          class="py-3 rounded-lg font-semibold text-sm transition-all"
          :class="transactionType === 'gasto' 
            ? 'bg-red-500 text-white shadow-md' 
            : 'text-gray-600 hover:bg-gray-200'"
        >
          📤 Gasto
        </button>
      </div>

      <!-- Amount -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">Monto *</label>
        <div class="relative">
          <span class="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-400">$</span>
          <input
            v-model.number="amount"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            class="w-full pl-10 pr-4 py-4 text-2xl font-bold border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors text-center"
          />
        </div>
        <p v-if="amount > 0" class="text-right text-sm text-gray-500 mt-1">
          {{ formatCurrency(amount) }}
        </p>
      </div>

      <!-- Description -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">Descripción *</label>
        <input
          v-model="description"
          type="text"
          placeholder="Ej: Compra en supermercado"
          class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      <!-- Category -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">Categoría</label>
        <div class="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1">
          <button
            v-for="cat in categories"
            :key="cat.value"
            type="button"
            @click="category = cat.value"
            class="p-2 rounded-xl border-2 text-xs font-medium transition-all text-center"
            :class="category === cat.value 
              ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
              : 'border-gray-200 hover:border-gray-300 text-gray-600'"
          >
            {{ cat.label }}
          </button>
        </div>
      </div>

      <!-- Date -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">Fecha *</label>
        <input
          v-model="date"
          type="date"
          class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      <!-- Payment Method -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">Método de Pago</label>
        <div class="grid grid-cols-3 sm:grid-cols-4 gap-2">
          <button
            v-for="method in paymentMethods"
            :key="method.value"
            type="button"
            @click="paymentMethod = method.value"
            class="p-2 rounded-xl border-2 text-xs font-medium transition-all text-center"
            :class="paymentMethod === method.value 
              ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
              : 'border-gray-200 hover:border-gray-300 text-gray-600'"
          >
            {{ method.label }}
          </button>
        </div>
      </div>

      <!-- Account -->
      <div v-if="accounts.length > 0">
        <label class="block text-sm font-semibold text-gray-700 mb-2">Cuenta</label>
        <select
          v-model="selectedAccount"
          class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors bg-white"
        >
          <option value="">Sin cuenta específica</option>
          <option v-for="account in accounts" :key="account.id" :value="account.id">
            {{ account.icon }} {{ account.name }} ({{ formatCurrency(account.balance) }})
          </option>
        </select>
      </div>

      <!-- Recurring -->
      <div class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
        <label class="flex items-center gap-2 cursor-pointer flex-1">
          <input
            v-model="isRecurring"
            type="checkbox"
            class="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span class="text-sm font-medium text-gray-700">🔄 Transacción recurrente</span>
        </label>
        <select
          v-if="isRecurring"
          v-model="recurrence"
          class="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 bg-white"
        >
          <option v-for="opt in recurrenceOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>

      <!-- Notes -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">Notas (opcional)</label>
        <textarea
          v-model="notes"
          placeholder="Notas adicionales..."
          rows="2"
          class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors resize-none"
        ></textarea>
      </div>
    </div>

    <!-- Footer -->
    <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 flex-shrink-0">
      <button
        type="button"
        @click="emit('close')"
        class="flex-1 py-3 px-4 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
      >
        Cancelar
      </button>
      <button
        type="button"
        @click="handleSubmit"
        :disabled="!isValid"
        class="flex-1 py-3 px-4 font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        :class="transactionType === 'ingreso'
          ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
          : 'bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700'"
      >
        {{ editTransaction ? '💾 Guardar' : '➕ Agregar' }}
      </button>
    </div>
  </div>
</template>
