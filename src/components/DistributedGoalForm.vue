<script setup lang="ts">
import { ref, computed } from 'vue'
import { MONTH_NAMES } from '../types'

const emit = defineEmits<{
  (e: 'create', data: {
    title: string
    totalAmount: number
    startMonth: number
    endMonth: number
  }): void
  (e: 'close'): void
}>()

const title = ref('')
const totalAmount = ref<number>(0)
const startMonth = ref<number>(1)
const endMonth = ref<number>(12)

const monthOptions = computed(() => {
  return MONTH_NAMES.map((name, index) => ({
    value: index + 1,
    label: name
  }))
})

const validEndMonths = computed(() => {
  return monthOptions.value.filter(m => m.value >= startMonth.value)
})

const monthCount = computed(() => {
  if (endMonth.value < startMonth.value) return 0
  return endMonth.value - startMonth.value + 1
})

const monthlyAmount = computed(() => {
  if (monthCount.value === 0 || totalAmount.value === 0) return 0
  return Math.round(totalAmount.value / monthCount.value)
})

const isValid = computed(() => {
  return title.value.trim() !== '' && 
         totalAmount.value > 0 && 
         monthCount.value > 0
})

function handleSubmit() {
  if (!isValid.value) return
  
  emit('create', {
    title: title.value.trim(),
    totalAmount: totalAmount.value,
    startMonth: startMonth.value,
    endMonth: endMonth.value
  })
}

function formatCurrency(value: number): string {
  return '$' + new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}
</script>

<template>
  <div class="bg-white rounded-lg shadow-lg p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
    <h3 class="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 sticky top-0 bg-white pb-2 border-b">💰 Meta de Ahorro Distribuida</h3>
    
    <form @submit.prevent="handleSubmit" class="space-y-3 sm:space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Título de la Meta</label>
        <input
          v-model="title"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ej: Fondo de emergencia"
          required
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Monto Total a Ahorrar</label>
        <div class="relative">
          <span class="absolute left-3 top-2 text-gray-500 font-medium">$</span>
          <input
            v-model.number="totalAmount"
            type="number"
            min="0"
            step="1000"
            class="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0"
            required
          />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Mes Inicio</label>
          <select
            v-model.number="startMonth"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option v-for="month in monthOptions" :key="month.value" :value="month.value">
              {{ month.label }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Mes Fin</label>
          <select
            v-model.number="endMonth"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option v-for="month in validEndMonths" :key="month.value" :value="month.value">
              {{ month.label }}
            </option>
          </select>
        </div>
      </div>

      <div v-if="monthCount > 0" class="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div class="text-sm text-gray-700 space-y-1">
          <p><strong>Meses:</strong> {{ monthCount }}</p>
          <p><strong>Ahorro mensual:</strong> {{ formatCurrency(monthlyAmount) }}</p>
          <p class="text-xs text-gray-500 mt-2">
            Se creará automáticamente una meta de ahorro de {{ formatCurrency(monthlyAmount) }} 
            en cada mes desde {{ MONTH_NAMES[startMonth - 1] }} hasta {{ MONTH_NAMES[endMonth - 1] }}
          </p>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 sticky bottom-0 bg-white pb-2 border-t mt-4">
        <button
          type="button"
          @click="emit('close')"
          class="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          :disabled="!isValid"
          class="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Crear Metas
        </button>
      </div>
    </form>
  </div>
</template>
