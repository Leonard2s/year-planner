<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Goal } from '../types'

const props = defineProps<{
  monthId: number
}>()

const emit = defineEmits<{
  (e: 'add', goal: Omit<Goal, 'id' | 'status' | 'carryOver' | 'createdAt'>): void
  (e: 'close'): void
}>()

const title = ref('')
const targetValue = ref<number>(0)
const currentValue = ref<number>(0)

const isValid = computed(() => {
  if (!title.value.trim()) return false
  if (targetValue.value <= 0) return false
  
  return true
})

function resetForm() {
  title.value = ''
  targetValue.value = 0
  currentValue.value = 0
}

function handleSubmit() {
  if (!isValid.value) return

  const goal: Omit<Goal, 'id' | 'status' | 'carryOver' | 'createdAt'> = {
    title: title.value.trim(),
    type: 'ahorro',
    targetValue: targetValue.value,
    currentValue: currentValue.value
  }

  emit('add', goal)
  resetForm()
  emit('close')
}
</script>

<template>
  <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
    <!-- Header -->
    <div class="p-5 text-white bg-gradient-to-r from-emerald-500 to-teal-500">
      <div class="flex items-center gap-3">
        <span class="text-3xl">💰</span>
        <div>
          <p class="text-sm opacity-90">Nueva</p>
          <h3 class="text-xl font-bold">Meta de Ahorro</h3>
        </div>
      </div>
    </div>
    
    <!-- Content -->
    <form @submit.prevent="handleSubmit" class="flex-1 overflow-y-auto p-5 space-y-5">
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">Nombre de la Meta</label>
        <input
          v-model="title"
          type="text"
          class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors text-gray-800 font-medium"
          placeholder="Ej: Fondo de emergencia"
          required
        />
      </div>

      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">Monto Objetivo</label>
        <div class="relative">
          <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
          <input
            v-model.number="targetValue"
            type="number"
            min="0"
            step="100"
            class="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors text-gray-800 font-medium"
            placeholder="0"
            required
          />
        </div>
        <p class="text-xs text-gray-500 mt-1">¿Cuánto quieres ahorrar?</p>
      </div>

      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">Monto Ahorrado</label>
        <div class="relative">
          <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
          <input
            v-model.number="currentValue"
            type="number"
            min="0"
            step="100"
            class="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors text-gray-800 font-medium"
            placeholder="0"
          />
        </div>
        <p class="text-xs text-gray-500 mt-1">¿Cuánto llevas ahorrado?</p>
      </div>

    </form>

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
        class="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Crear Meta
      </button>
    </div>
  </div>
</template>
