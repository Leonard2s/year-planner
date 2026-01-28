<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Goal, ExpenseItem } from '../types'
import ExpenseList from './ExpenseList.vue'

const props = defineProps<{
  monthId: number
}>()

const emit = defineEmits<{
  (e: 'add', goal: Omit<Goal, 'id' | 'status' | 'carryOver' | 'createdAt'>): void
  (e: 'close'): void
}>()

const title = ref('')
const currentValue = ref<number>(0)
const travelExpenses = ref<ExpenseItem[]>([])

const totalExpenses = computed(() => {
  return travelExpenses.value.reduce((sum, item) => sum + item.cost, 0)
})

const targetValue = computed(() => totalExpenses.value)

const isValid = computed(() => {
  return title.value.trim() !== '' && travelExpenses.value.length > 0
})

function resetForm() {
  title.value = ''
  currentValue.value = 0
  travelExpenses.value = []
}

function handleSubmit() {
  if (!isValid.value) return

  const goal: Omit<Goal, 'id' | 'status' | 'carryOver' | 'createdAt'> = {
    title: title.value.trim(),
    type: 'viaje',
    targetValue: targetValue.value,
    currentValue: currentValue.value,
    expenses: [...travelExpenses.value]
  }

  emit('add', goal)
  resetForm()
  emit('close')
}
</script>

<template>
  <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
    <!-- Header -->
    <div class="p-5 text-white bg-gradient-to-r from-blue-500 to-indigo-500">
      <div class="flex items-center gap-3">
        <span class="text-3xl">✈️</span>
        <div>
          <p class="text-sm opacity-90">Nuevo</p>
          <h3 class="text-xl font-bold">Viaje</h3>
        </div>
      </div>
    </div>
    
    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-5 space-y-5">
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">Nombre del Viaje</label>
        <input
          v-model="title"
          type="text"
          class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-gray-800 font-medium"
          placeholder="Ej: Viaje a Cancún"
          required
        />
      </div>

      <ExpenseList
        :expenses="travelExpenses"
        label="Gastos del Viaje"
        @update="(expenses) => travelExpenses = expenses"
      />

      <div v-if="totalExpenses > 0" class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border-2 border-blue-200">
        <p class="text-sm font-semibold text-gray-600 mb-1">
          Presupuesto Total (Tope)
        </p>
        <p class="text-3xl font-bold text-blue-600">
          ${{ totalExpenses.toLocaleString('es-MX') }}
        </p>
        <p class="text-xs text-gray-500 mt-2">
          ✨ Calculado automáticamente de tus gastos
        </p>
      </div>

      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">Monto Gastado Actual</label>
        <div class="relative">
          <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
          <input
            v-model.number="currentValue"
            type="number"
            min="0"
            step="100"
            class="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-gray-800 font-medium"
            placeholder="0"
          />
        </div>
        <p class="text-xs text-gray-500 mt-1">Lo que ya has gastado hasta ahora</p>
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
        @click="handleSubmit"
        :disabled="!isValid"
        class="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Crear Viaje
      </button>
    </div>
  </div>
</template>
