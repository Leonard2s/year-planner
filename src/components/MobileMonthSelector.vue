<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import type { YearPlan } from '../types'
import { calculateMonthSummary } from '../composables/useYearPlan'

const props = defineProps<{
  yearPlan: YearPlan
  selectedMonthId: number
}>()

const emit = defineEmits<{
  (e: 'selectMonth', monthId: number): void
}>()

const scrollContainer = ref<HTMLElement | null>(null)

const months = computed(() => {
  return props.yearPlan.months.map(month => ({
    ...month,
    summary: calculateMonthSummary(month)
  }))
})

const selectedMonth = computed(() => {
  return months.value.find(m => m.id === props.selectedMonthId)
})

function getMonthStatus(month: typeof months.value[0]) {
  if (month.summary.totalGoals === 0) return { color: 'bg-gray-100 border-gray-300 text-gray-600', dot: 'bg-gray-400' }
  if (month.isClosed) {
    if (month.summary.progressPercentage >= 80) return { color: 'bg-green-100 border-green-400 text-green-700', dot: 'bg-green-500' }
    if (month.summary.progressPercentage >= 50) return { color: 'bg-amber-100 border-amber-400 text-amber-700', dot: 'bg-amber-500' }
    return { color: 'bg-red-100 border-red-400 text-red-700', dot: 'bg-red-500' }
  }
  return { color: 'bg-blue-100 border-blue-400 text-blue-700', dot: 'bg-blue-500' }
}

watch(() => props.selectedMonthId, async () => {
  await nextTick()
  const container = scrollContainer.value
  if (!container) return
  
  const selectedBtn = container.querySelector(`[data-month="${props.selectedMonthId}"]`) as HTMLElement
  if (selectedBtn) {
    const containerRect = container.getBoundingClientRect()
    const btnRect = selectedBtn.getBoundingClientRect()
    const scrollLeft = selectedBtn.offsetLeft - (containerRect.width / 2) + (btnRect.width / 2)
    container.scrollTo({ left: scrollLeft, behavior: 'smooth' })
  }
}, { immediate: true })
</script>

<template>
  <div class="bg-white border-b border-gray-200 sm:hidden sticky top-[60px] z-30 shadow-sm">
    <!-- Current month display -->
    <div class="px-4 py-2 flex items-center justify-between bg-gradient-to-r from-indigo-500 to-purple-600">
      <div class="flex items-center gap-2">
        <span class="text-white/80 text-sm">Mes:</span>
        <span class="text-white font-bold">{{ selectedMonth?.name }}</span>
      </div>
      <div v-if="selectedMonth" class="flex items-center gap-2">
        <span v-if="selectedMonth.isClosed" class="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">
          🔒 Cerrado
        </span>
        <span class="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">
          {{ selectedMonth.summary.totalGoals }} metas
        </span>
      </div>
    </div>
    
    <!-- Horizontal scrollable months -->
    <div 
      ref="scrollContainer"
      class="flex gap-2 p-3 overflow-x-auto scrollbar-hide"
      style="scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch;"
    >
      <button
        v-for="month in months"
        :key="month.id"
        :data-month="month.id"
        @click="emit('selectMonth', month.id)"
        class="flex-shrink-0 px-3 py-2 rounded-xl border-2 transition-all scroll-snap-align-center"
        :class="[
          month.id === selectedMonthId 
            ? 'ring-2 ring-indigo-500 ring-offset-1 scale-105' 
            : 'opacity-70',
          getMonthStatus(month).color
        ]"
        style="scroll-snap-align: center;"
      >
        <div class="text-xs font-bold whitespace-nowrap">{{ month.name.slice(0, 3) }}</div>
        <div class="flex items-center justify-center gap-1 mt-0.5">
          <span 
            class="w-1.5 h-1.5 rounded-full"
            :class="getMonthStatus(month).dot"
          ></span>
          <span class="text-xs font-semibold">
            {{ month.summary.totalGoals > 0 ? month.summary.progressPercentage + '%' : '-' }}
          </span>
        </div>
      </button>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
