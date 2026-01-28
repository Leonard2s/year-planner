import { ref, computed, watch } from 'vue'
import type { YearPlan, Month, Goal, MonthSummary, GoalType, Evaluation } from '../types'
import { MONTH_NAMES } from '../types'
import { saveYearPlan, loadYearPlan } from './useIndexedDB'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

function createEmptyYear(year: number): YearPlan {
  return {
    year,
    months: MONTH_NAMES.map((name, index) => ({
      id: index + 1,
      name,
      goals: [],
      isClosed: false
    }))
  }
}

async function loadFromStorage(year: number): Promise<YearPlan | null> {
  try {
    return await loadYearPlan(year)
  } catch (e) {
    console.error('Error loading from storage:', e)
    return null
  }
}

async function saveToStorage(data: YearPlan): Promise<void> {
  try {
    await saveYearPlan(data)
  } catch (e) {
    console.error('Error saving to storage:', e)
  }
}

export function evaluateGoalStatus(goal: Goal): Goal['status'] {
  if (goal.currentValue >= goal.targetValue) {
    return 'cumplida'
  } else if (goal.currentValue > 0) {
    return 'parcial'
  }
  return 'pendiente'
}

export function calculateMonthSummary(month: Month): MonthSummary {
  const totalGoals = month.goals.length
  const completedGoals = month.goals.filter(g => g.status === 'cumplida').length
  const pendingGoals = totalGoals - completedGoals
  const progressPercentage = totalGoals > 0 
    ? Math.round((completedGoals / totalGoals) * 100) 
    : 0

  let evaluation: Evaluation
  if (progressPercentage >= 80) {
    evaluation = 'cumplido'
  } else if (progressPercentage >= 50) {
    evaluation = 'vas bien'
  } else {
    evaluation = 'atrasado'
  }

  return {
    totalGoals,
    completedGoals,
    pendingGoals,
    progressPercentage,
    evaluation
  }
}

export function useYearPlan() {
  const currentYear = new Date().getFullYear()
  const yearPlan = ref<YearPlan>(createEmptyYear(currentYear))
  const selectedMonthId = ref<number>(new Date().getMonth() + 1)
  const isLoading = ref(true)

  loadFromStorage(currentYear).then(data => {
    if (data) {
      yearPlan.value = data
    }
    isLoading.value = false
  })

  watch(yearPlan, (newValue) => {
    saveToStorage(newValue)
  }, { deep: true })

  const selectedMonth = computed(() => {
    return yearPlan.value.months.find(m => m.id === selectedMonthId.value) || yearPlan.value.months[0]
  })

  const monthSummary = computed(() => {
    const month = selectedMonth.value
    if (!month) {
      return {
        totalGoals: 0,
        completedGoals: 0,
        pendingGoals: 0,
        progressPercentage: 0,
        evaluation: 'atrasado' as Evaluation
      }
    }
    return calculateMonthSummary(month)
  })

  const yearSummary = computed(() => {
    const allGoals = yearPlan.value.months.flatMap(m => m.goals)
    const totalGoals = allGoals.length
    const completedGoals = allGoals.filter(g => g.status === 'cumplida').length
    const progressPercentage = totalGoals > 0 
      ? Math.round((completedGoals / totalGoals) * 100) 
      : 0

    let evaluation: Evaluation
    if (progressPercentage >= 80) {
      evaluation = 'cumplido'
    } else if (progressPercentage >= 50) {
      evaluation = 'vas bien'
    } else {
      evaluation = 'atrasado'
    }

    return {
      totalGoals,
      completedGoals,
      pendingGoals: totalGoals - completedGoals,
      progressPercentage,
      evaluation
    }
  })

  function addGoal(monthId: number, goalData: Omit<Goal, 'id' | 'status' | 'carryOver' | 'createdAt'>) {
    const month = yearPlan.value.months.find(m => m.id === monthId)
    if (!month) return

    const newGoal: Goal = {
      ...goalData,
      id: generateId(),
      status: 'pendiente',
      carryOver: false,
      createdAt: new Date().toISOString()
    }

    newGoal.status = evaluateGoalStatus(newGoal)
    month.goals.push(newGoal)
  }

  function addDistributedGoal(data: {
    title: string
    totalAmount: number
    startMonth: number
    endMonth: number
  }) {
    const monthCount = data.endMonth - data.startMonth + 1
    const monthlyAmount = Math.round(data.totalAmount / monthCount)

    for (let monthId = data.startMonth; monthId <= data.endMonth; monthId++) {
      const month = yearPlan.value.months.find(m => m.id === monthId)
      if (!month) continue

      const goalData: Omit<Goal, 'id' | 'status' | 'carryOver' | 'createdAt'> = {
        title: data.title,
        type: 'ahorro',
        targetValue: monthlyAmount,
        currentValue: 0,
        isDistributed: true,
        startMonth: data.startMonth,
        endMonth: data.endMonth,
        monthlyAmount: monthlyAmount
      }

      addGoal(monthId, goalData)
    }
  }

  function getMonthlySavingsTotal(monthId: number): number {
    const month = yearPlan.value.months.find(m => m.id === monthId)
    if (!month) return 0

    return month.goals
      .filter(g => g.type === 'ahorro')
      .reduce((sum, goal) => sum + goal.currentValue, 0)
  }

  function updateGoal(monthId: number, goalId: string, updates: Partial<Goal>) {
    const month = yearPlan.value.months.find(m => m.id === monthId)
    if (!month) return

    const goalIndex = month.goals.findIndex(g => g.id === goalId)
    if (goalIndex === -1) return

    const existingGoal = month.goals[goalIndex]
    if (!existingGoal) return
    
    const updatedGoal: Goal = {
      ...existingGoal,
      ...updates,
      id: existingGoal.id,
      title: updates.title ?? existingGoal.title,
      type: updates.type ?? existingGoal.type,
      targetValue: updates.targetValue ?? existingGoal.targetValue,
      currentValue: updates.currentValue ?? existingGoal.currentValue,
      carryOver: updates.carryOver ?? existingGoal.carryOver,
      createdAt: existingGoal.createdAt,
      status: existingGoal.status
    }
    updatedGoal.status = evaluateGoalStatus(updatedGoal)
    
    if (updatedGoal.status === 'cumplida' && !updatedGoal.completedAt) {
      updatedGoal.completedAt = new Date().toISOString()
    }

    month.goals[goalIndex] = updatedGoal
  }

  function deleteGoal(monthId: number, goalId: string) {
    const month = yearPlan.value.months.find(m => m.id === monthId)
    if (!month) return

    month.goals = month.goals.filter(g => g.id !== goalId)
  }

  function closeMonth(monthId: number) {
    const monthIndex = yearPlan.value.months.findIndex(m => m.id === monthId)
    if (monthIndex === -1 || monthIndex === 11) return

    const currentMonth = yearPlan.value.months[monthIndex]
    const nextMonth = yearPlan.value.months[monthIndex + 1]
    
    if (!currentMonth || !nextMonth) return

    currentMonth.goals.forEach(goal => {
      goal.status = evaluateGoalStatus(goal)
    })

    const goalsToCarry = currentMonth.goals.filter(
      g => g.status === 'pendiente' || g.status === 'parcial'
    )

    goalsToCarry.forEach(goal => {
      goal.status = 'no_cumplida'
      
      const carriedGoal: Goal = {
        ...goal,
        id: generateId(),
        carryOver: true,
        createdAt: new Date().toISOString(),
        completedAt: undefined
      }
      carriedGoal.status = evaluateGoalStatus(carriedGoal)
      nextMonth.goals.push(carriedGoal)
    })

    currentMonth.isClosed = true
  }

  function reopenMonth(monthId: number) {
    const month = yearPlan.value.months.find(m => m.id === monthId)
    if (!month) return
    month.isClosed = false
  }

  function resetYear() {
    yearPlan.value = createEmptyYear(currentYear)
  }

  async function changeYear(year: number) {
    isLoading.value = true
    const stored = await loadFromStorage(year)
    if (stored && stored.year === year) {
      yearPlan.value = stored
    } else {
      yearPlan.value = createEmptyYear(year)
    }
    isLoading.value = false
  }

  function getGoalsByType(type: GoalType): Goal[] {
    return yearPlan.value.months.flatMap(m => m.goals).filter(g => g.type === type)
  }

  function getMonthSummary(monthId: number): MonthSummary {
    const month = yearPlan.value.months.find(m => m.id === monthId)
    if (!month) {
      return {
        totalGoals: 0,
        completedGoals: 0,
        pendingGoals: 0,
        progressPercentage: 0,
        evaluation: 'atrasado'
      }
    }
    return calculateMonthSummary(month)
  }

  return {
    yearPlan,
    selectedMonthId,
    selectedMonth,
    monthSummary,
    yearSummary,
    isLoading,
    addGoal,
    addDistributedGoal,
    updateGoal,
    deleteGoal,
    closeMonth,
    reopenMonth,
    resetYear,
    changeYear,
    getGoalsByType,
    getMonthSummary,
    getMonthlySavingsTotal
  }
}
