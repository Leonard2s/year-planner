<script setup lang="ts">
import { ref, computed } from 'vue'
import { useYearPlan } from './composables/useYearPlan'
import YearOverview from './components/YearOverview.vue'
import MonthCard from './components/MonthCard.vue'
import GoalForm from './components/GoalForm.vue'
import TravelExpenseForm from './components/TravelExpenseForm.vue'
import PurchaseExpenseForm from './components/PurchaseExpenseForm.vue'
import DistributedGoalForm from './components/DistributedGoalForm.vue'
import GoalDetailModal from './components/GoalDetailModal.vue'
import GoalEditModal from './components/GoalEditModal.vue'
import MobileMonthSelector from './components/MobileMonthSelector.vue'
import ImportExportModal from './components/ImportExportModal.vue'
import type { Goal, YearPlan } from './types'

const {
  yearPlan,
  selectedMonthId,
  selectedMonth,
  addGoal,
  addDistributedGoal,
  updateGoal,
  deleteGoal,
  closeMonth,
  reopenMonth,
  resetYear,
  getMonthlySavingsTotal
} = useYearPlan()

const showSavingsForm = ref(false)
const showTravelForm = ref(false)
const showPurchaseForm = ref(false)
const showDistributedForm = ref(false)
const showResetConfirm = ref(false)
const showDetailModal = ref(false)
const showEditModal = ref(false)
const showImportExportModal = ref(false)
const selectedGoalForDetail = ref<Goal | null>(null)

const isLastMonth = computed(() => selectedMonthId.value === 12)

function handleSelectMonth(monthId: number) {
  selectedMonthId.value = monthId
}

function handleShowForm(type: 'ahorro' | 'viaje' | 'compra') {
  if (type === 'ahorro') {
    showSavingsForm.value = true
  } else if (type === 'viaje') {
    showTravelForm.value = true
  } else if (type === 'compra') {
    showPurchaseForm.value = true
  }
}

function handleAddGoal(goalData: Omit<Goal, 'id' | 'status' | 'carryOver' | 'createdAt'>) {
  addGoal(selectedMonthId.value, goalData)
}

function handleAddDistributedGoal(data: {
  title: string
  totalAmount: number
  startMonth: number
  endMonth: number
}) {
  addDistributedGoal(data)
  showDistributedForm.value = false
}

const monthlySavingsTotal = computed(() => {
  return getMonthlySavingsTotal(selectedMonthId.value)
})

const yearStats = computed(() => {
  const allGoals = yearPlan.value.months.flatMap(m => m.goals)
  const total = allGoals.length
  const completed = allGoals.filter(g => g.status === 'cumplida').length
  return {
    total,
    completed,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0
  }
})

function handleUpdateGoal(goalId: string, updates: Partial<Goal>) {
  updateGoal(selectedMonthId.value, goalId, updates)
}

function handleDeleteGoal(goalId: string) {
  deleteGoal(selectedMonthId.value, goalId)
}

function handleShowDetail(goalId: string) {
  const month = selectedMonth.value
  if (!month) return
  
  const goal = month.goals.find(g => g.id === goalId)
  if (goal) {
    selectedGoalForDetail.value = goal
    showDetailModal.value = true
  }
}

function handleOpenEdit() {
  showDetailModal.value = false
  showEditModal.value = true
}

function handleSaveGoal(goalId: string, updates: Partial<Goal>) {
  updateGoal(selectedMonthId.value, goalId, updates)
  // Refresh the selected goal reference
  const month = selectedMonth.value
  if (month) {
    selectedGoalForDetail.value = month.goals.find(g => g.id === goalId) || null
  }
}

function handleCloseMonth() {
  const month = selectedMonth.value
  if (!month) return
  if (confirm(`¿Cerrar ${month.name}? Las metas no cumplidas pasarán al siguiente mes.`)) {
    closeMonth(selectedMonthId.value)
  }
}

function handleReopenMonth() {
  reopenMonth(selectedMonthId.value)
}

function handleReset() {
  if (showResetConfirm.value) {
    resetYear()
    showResetConfirm.value = false
  } else {
    showResetConfirm.value = true
    setTimeout(() => {
      showResetConfirm.value = false
    }, 3000)
  }
}

function handleImportData(importedPlan: YearPlan) {
  yearPlan.value = importedPlan
}
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div class="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div class="flex items-center justify-between gap-2">
          <div class="flex-1 min-w-0">
            <h1 class="text-lg sm:text-2xl font-bold text-gray-900 truncate">📊 Planificador Anual</h1>
            <p class="text-xs sm:text-sm text-gray-500">Seguimiento de metas {{ yearPlan.year }}</p>
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="showImportExportModal = true"
              class="px-3 py-2 text-xs sm:text-sm font-medium rounded-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors whitespace-nowrap flex-shrink-0"
            >
              📦 <span class="hidden sm:inline">Datos</span>
            </button>
            <button
              @click="handleReset"
              class="px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex-shrink-0"
              :class="showResetConfirm 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
            >
              {{ showResetConfirm ? '⚠️ Confirmar' : 'Reiniciar' }}
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Mobile Month Selector - sticky below header -->
    <MobileMonthSelector
      :year-plan="yearPlan"
      :selected-month-id="selectedMonthId"
      @select-month="handleSelectMonth"
    />

    <main class="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <!-- Mobile Year Stats - compact summary -->
      <div class="sm:hidden mb-4">
        <div class="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-4 text-white">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium opacity-90">Progreso Anual {{ yearPlan.year }}</span>
            <span class="text-lg font-bold">{{ yearStats.percentage }}%</span>
          </div>
          <div class="w-full h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              class="h-full bg-white rounded-full transition-all duration-500"
              :style="{ width: `${yearStats.percentage}%` }"
            ></div>
          </div>
          <div class="flex justify-between mt-2 text-xs opacity-80">
            <span>{{ yearStats.completed }} completadas</span>
            <span>{{ yearStats.total }} totales</span>
          </div>
        </div>
      </div>

      <!-- Year Overview - hidden on mobile, visible on tablet+ -->
      <div class="hidden sm:block">
        <YearOverview 
          :year-plan="yearPlan" 
          @select-month="handleSelectMonth" 
        />
      </div>

      <div v-if="selectedMonth" class="space-y-3 sm:space-y-4">
        <div class="bg-white rounded-2xl shadow-sm p-4 border-l-4 border-green-500">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div class="flex-1">
              <h3 class="text-sm sm:text-base font-semibold text-gray-700">💰 Total Ahorrado en {{ selectedMonth.name }}</h3>
              <p class="text-xl sm:text-2xl font-bold text-green-700">${{ monthlySavingsTotal.toLocaleString('es-MX') }}</p>
            </div>
            <button
              @click="showDistributedForm = true"
              class="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
            >
              📊 Meta Distribuida
            </button>
          </div>
        </div>

        <MonthCard
          :month="selectedMonth"
          :is-last="isLastMonth"
          @add-goal="handleShowForm"
          @update-goal="handleUpdateGoal"
          @delete-goal="handleDeleteGoal"
          @close-month="handleCloseMonth"
          @reopen-month="handleReopenMonth"
          @show-detail="handleShowDetail"
        />
      </div>
    </main>

    <div 
      v-if="showSavingsForm" 
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="showSavingsForm = false"
    >
      <GoalForm
        :month-id="selectedMonthId"
        @add="handleAddGoal"
        @close="showSavingsForm = false"
      />
    </div>

    <div 
      v-if="showTravelForm" 
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="showTravelForm = false"
    >
      <TravelExpenseForm
        :month-id="selectedMonthId"
        @add="handleAddGoal"
        @close="showTravelForm = false"
      />
    </div>

    <div 
      v-if="showPurchaseForm" 
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="showPurchaseForm = false"
    >
      <PurchaseExpenseForm
        :month-id="selectedMonthId"
        @add="handleAddGoal"
        @close="showPurchaseForm = false"
      />
    </div>

    <div 
      v-if="showDistributedForm" 
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="showDistributedForm = false"
    >
      <DistributedGoalForm
        @create="handleAddDistributedGoal"
        @close="showDistributedForm = false"
      />
    </div>

    <div 
      v-if="showDetailModal && selectedGoalForDetail" 
      class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click.self="showDetailModal = false"
    >
      <GoalDetailModal
        :goal="selectedGoalForDetail"
        @close="showDetailModal = false"
        @edit="handleOpenEdit"
      />
    </div>

    <div 
      v-if="showEditModal && selectedGoalForDetail" 
      class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click.self="showEditModal = false"
    >
      <GoalEditModal
        :goal="selectedGoalForDetail"
        @close="showEditModal = false"
        @save="handleSaveGoal"
      />
    </div>

    <div 
      v-if="showImportExportModal" 
      class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click.self="showImportExportModal = false"
    >
      <ImportExportModal
        :year-plan="yearPlan"
        :selected-month-id="selectedMonthId"
        @close="showImportExportModal = false"
        @import="handleImportData"
      />
    </div>

    <footer class="bg-white border-t border-gray-200 mt-6 sm:mt-8">
      <div class="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4 text-center text-xs sm:text-sm text-gray-500">
        💾 Datos guardados automáticamente
      </div>
    </footer>
  </div>
</template>
