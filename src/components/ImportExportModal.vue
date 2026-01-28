<script setup lang="ts">
import { ref, computed } from 'vue'
import type { YearPlan } from '../types'
import {
  exportMonthToCSV,
  exportYearToCSV,
  generateMonthPDF,
  generateYearPDF,
  downloadCSV,
  downloadPDF,
  importFromCSV,
  exportFullBackup,
  importFullBackup,
  downloadJSON
} from '../utils/exportImport'

const props = defineProps<{
  yearPlan: YearPlan
  selectedMonthId: number
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'import', yearPlan: YearPlan): void
}>()

const activeTab = ref<'export' | 'import'>('export')
const exportScope = ref<'month' | 'year'>('month')
const exportFormat = ref<'csv' | 'pdf' | 'json'>('csv')
const importError = ref('')
const importSuccess = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

const selectedMonth = computed(() => {
  return props.yearPlan.months.find(m => m.id === props.selectedMonthId)
})

function handleExport() {
  const year = props.yearPlan.year
  const month = selectedMonth.value
  const timestamp = new Date().toISOString().slice(0, 10)
  
  if (exportFormat.value === 'json') {
    const content = exportFullBackup(props.yearPlan)
    downloadJSON(content, `backup-${year}-${timestamp}.json`)
    return
  }
  
  if (exportScope.value === 'month' && month) {
    if (exportFormat.value === 'csv') {
      const content = exportMonthToCSV(month, year)
      downloadCSV(content, `${month.name.toLowerCase()}-${year}-${timestamp}.csv`)
    } else {
      const content = generateMonthPDF(month, year)
      downloadPDF(content, `${month.name.toLowerCase()}-${year}-${timestamp}.pdf`)
    }
  } else {
    if (exportFormat.value === 'csv') {
      const content = exportYearToCSV(props.yearPlan)
      downloadCSV(content, `reporte-anual-${year}-${timestamp}.csv`)
    } else {
      const content = generateYearPDF(props.yearPlan)
      downloadPDF(content, `reporte-anual-${year}-${timestamp}.pdf`)
    }
  }
}

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  
  importError.value = ''
  importSuccess.value = ''
  
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string
      
      if (file.name.endsWith('.json')) {
        const newPlan = importFullBackup(content)
        emit('import', newPlan)
        importSuccess.value = `✅ Backup restaurado: ${newPlan.months.flatMap(m => m.goals).length} metas importadas`
      } else if (file.name.endsWith('.csv')) {
        const newPlan = importFromCSV(content, props.yearPlan)
        emit('import', newPlan)
        const totalGoals = newPlan.months.flatMap(m => m.goals).length
        importSuccess.value = `✅ CSV importado: ${totalGoals} metas en total`
      } else {
        importError.value = 'Formato no soportado. Usa archivos .csv o .json'
      }
    } catch (err) {
      importError.value = err instanceof Error ? err.message : 'Error al importar el archivo'
    }
  }
  reader.readAsText(file)
  input.value = ''
}
</script>

<template>
  <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
    <!-- Header -->
    <div class="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold text-white flex items-center gap-2">
          📦 Importar / Exportar
        </h2>
        <button
          @click="emit('close')"
          class="w-8 h-8 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors flex items-center justify-center"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex border-b border-gray-200">
      <button
        @click="activeTab = 'export'"
        class="flex-1 py-3 px-4 text-sm font-medium transition-colors"
        :class="activeTab === 'export' 
          ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50' 
          : 'text-gray-500 hover:text-gray-700'"
      >
        📤 Exportar
      </button>
      <button
        @click="activeTab = 'import'"
        class="flex-1 py-3 px-4 text-sm font-medium transition-colors"
        :class="activeTab === 'import' 
          ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50' 
          : 'text-gray-500 hover:text-gray-700'"
      >
        📥 Importar
      </button>
    </div>

    <!-- Content -->
    <div class="p-6">
      <!-- Export Tab -->
      <div v-if="activeTab === 'export'" class="space-y-5">
        <!-- Scope Selection -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">¿Qué exportar?</label>
          <div class="grid grid-cols-2 gap-3">
            <button
              @click="exportScope = 'month'"
              class="p-4 rounded-xl border-2 transition-all text-left"
              :class="exportScope === 'month' 
                ? 'border-indigo-500 bg-indigo-50' 
                : 'border-gray-200 hover:border-gray-300'"
            >
              <div class="text-2xl mb-1">📅</div>
              <div class="font-semibold text-sm">Mes Actual</div>
              <div class="text-xs text-gray-500">{{ selectedMonth?.name }}</div>
            </button>
            <button
              @click="exportScope = 'year'"
              class="p-4 rounded-xl border-2 transition-all text-left"
              :class="exportScope === 'year' 
                ? 'border-indigo-500 bg-indigo-50' 
                : 'border-gray-200 hover:border-gray-300'"
            >
              <div class="text-2xl mb-1">📊</div>
              <div class="font-semibold text-sm">Año Completo</div>
              <div class="text-xs text-gray-500">{{ yearPlan.year }}</div>
            </button>
          </div>
        </div>

        <!-- Format Selection -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Formato</label>
          <div class="grid grid-cols-3 gap-3">
            <button
              @click="exportFormat = 'csv'"
              class="p-3 rounded-xl border-2 transition-all text-center"
              :class="exportFormat === 'csv' 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-200 hover:border-gray-300'"
            >
              <div class="text-xl mb-1">📄</div>
              <div class="font-semibold text-xs">CSV</div>
              <div class="text-[10px] text-gray-500">Excel</div>
            </button>
            <button
              @click="exportFormat = 'pdf'"
              class="p-3 rounded-xl border-2 transition-all text-center"
              :class="exportFormat === 'pdf' 
                ? 'border-red-500 bg-red-50' 
                : 'border-gray-200 hover:border-gray-300'"
            >
              <div class="text-xl mb-1">📑</div>
              <div class="font-semibold text-xs">PDF</div>
              <div class="text-[10px] text-gray-500">Imprimible</div>
            </button>
            <button
              @click="exportFormat = 'json'"
              class="p-3 rounded-xl border-2 transition-all text-center"
              :class="exportFormat === 'json' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'"
            >
              <div class="text-xl mb-1">💾</div>
              <div class="font-semibold text-xs">Backup</div>
              <div class="text-[10px] text-gray-500">Completo</div>
            </button>
          </div>
        </div>

        <!-- Export Info -->
        <div class="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
          <div v-if="exportFormat === 'csv'">
            📄 <strong>CSV:</strong> Archivo compatible con Excel/Google Sheets para análisis de datos.
          </div>
          <div v-else-if="exportFormat === 'pdf'">
            📑 <strong>PDF:</strong> Reporte visual listo para imprimir o compartir.
          </div>
          <div v-else>
            💾 <strong>Backup:</strong> Copia completa de todos tus datos para restaurar después.
          </div>
        </div>

        <!-- Export Button -->
        <button
          @click="handleExport"
          class="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
        >
          📤 Exportar {{ exportFormat.toUpperCase() }}
        </button>
      </div>

      <!-- Import Tab -->
      <div v-if="activeTab === 'import'" class="space-y-5">
        <div class="text-center">
          <div class="w-20 h-20 mx-auto bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center text-4xl mb-4">
            📥
          </div>
          <h3 class="font-semibold text-gray-800 mb-1">Importar Datos</h3>
          <p class="text-sm text-gray-500">Sube un archivo CSV o un backup JSON</p>
        </div>

        <!-- Hidden file input -->
        <input
          ref="fileInput"
          type="file"
          accept=".csv,.json"
          class="hidden"
          @change="handleFileSelect"
        />

        <!-- Drop zone -->
        <button
          @click="triggerFileInput"
          class="w-full p-8 border-2 border-dashed border-gray-300 rounded-2xl hover:border-indigo-400 hover:bg-indigo-50 transition-all cursor-pointer"
        >
          <div class="text-center">
            <div class="text-3xl mb-2">📁</div>
            <div class="text-sm font-medium text-gray-700">Click para seleccionar archivo</div>
            <div class="text-xs text-gray-400 mt-1">.csv o .json</div>
          </div>
        </button>

        <!-- Success/Error messages -->
        <div v-if="importSuccess" class="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700">
          {{ importSuccess }}
        </div>
        <div v-if="importError" class="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          ❌ {{ importError }}
        </div>

        <!-- Import Info -->
        <div class="bg-amber-50 rounded-xl p-4 text-sm text-amber-800">
          <div class="font-semibold mb-1">⚠️ Importante:</div>
          <ul class="list-disc list-inside space-y-1 text-xs">
            <li><strong>CSV:</strong> Agrega o actualiza metas según el título</li>
            <li><strong>JSON (Backup):</strong> Reemplaza TODOS los datos actuales</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
