import type { YearPlan, Month, Goal } from '../types'

const MONTH_NAMES_LIST = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

// ============ CSV EXPORT ============

function escapeCSV(value: string | number | boolean | undefined): string {
  if (value === undefined || value === null) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0
  }).format(value)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-MX')
}

export function exportMonthToCSV(month: Month, year: number): string {
  const headers = [
    'Mes', 'Año', 'Título', 'Tipo', 'Meta', 'Actual', 'Progreso %', 
    'Estado', 'Creado', 'Completado', 'Detalles Gastos'
  ]
  
  const rows = month.goals.map(goal => {
    const progress = goal.targetValue > 0 
      ? Math.round((goal.currentValue / goal.targetValue) * 100) 
      : 0
    
    let expenseDetails = ''
    if (goal.expenses?.length) {
      expenseDetails = goal.expenses.map(e => `${e.name}: ${formatCurrency(e.cost)}`).join(' | ')
    } else if (goal.purchaseItems?.length) {
      expenseDetails = goal.purchaseItems.map(e => `${e.name}: ${formatCurrency(e.cost)}`).join(' | ')
    }
    
    return [
      month.name,
      year,
      goal.title,
      goal.type,
      goal.targetValue,
      goal.currentValue,
      progress,
      goal.status,
      formatDate(goal.createdAt),
      goal.completedAt ? formatDate(goal.completedAt) : '',
      expenseDetails
    ].map(escapeCSV).join(',')
  })
  
  return [headers.join(','), ...rows].join('\n')
}

export function exportYearToCSV(yearPlan: YearPlan): string {
  const headers = [
    'Mes', 'Año', 'Título', 'Tipo', 'Meta', 'Actual', 'Progreso %', 
    'Estado', 'Mes Cerrado', 'Creado', 'Completado', 'Detalles Gastos'
  ]
  
  const rows: string[] = []
  
  yearPlan.months.forEach(month => {
    month.goals.forEach(goal => {
      const progress = goal.targetValue > 0 
        ? Math.round((goal.currentValue / goal.targetValue) * 100) 
        : 0
      
      let expenseDetails = ''
      if (goal.expenses?.length) {
        expenseDetails = goal.expenses.map(e => `${e.name}: ${formatCurrency(e.cost)}`).join(' | ')
      } else if (goal.purchaseItems?.length) {
        expenseDetails = goal.purchaseItems.map(e => `${e.name}: ${formatCurrency(e.cost)}`).join(' | ')
      }
      
      rows.push([
        month.name,
        yearPlan.year,
        goal.title,
        goal.type,
        goal.targetValue,
        goal.currentValue,
        progress,
        goal.status,
        month.isClosed ? 'Sí' : 'No',
        formatDate(goal.createdAt),
        goal.completedAt ? formatDate(goal.completedAt) : '',
        expenseDetails
      ].map(escapeCSV).join(','))
    })
  })
  
  return [headers.join(','), ...rows].join('\n')
}

// ============ PDF EXPORT ============

function generatePDFStyles(): string {
  return `
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #333; }
      .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #6366f1; }
      .header h1 { color: #4f46e5; font-size: 28px; margin-bottom: 5px; }
      .header p { color: #666; font-size: 14px; }
      .summary { display: flex; gap: 20px; margin-bottom: 30px; flex-wrap: wrap; }
      .summary-card { flex: 1; min-width: 150px; padding: 15px; border-radius: 12px; text-align: center; }
      .summary-card.total { background: #f3f4f6; }
      .summary-card.completed { background: #dcfce7; }
      .summary-card.pending { background: #fef3c7; }
      .summary-card.progress { background: #dbeafe; }
      .summary-card .value { font-size: 32px; font-weight: bold; }
      .summary-card .label { font-size: 12px; color: #666; margin-top: 5px; }
      .month-section { margin-bottom: 30px; page-break-inside: avoid; }
      .month-header { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 12px 20px; border-radius: 12px 12px 0 0; display: flex; justify-content: space-between; align-items: center; }
      .month-header h2 { font-size: 18px; }
      .month-header .status { font-size: 12px; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; }
      .goals-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
      .goals-table th { background: #f8fafc; padding: 12px; text-align: left; font-size: 12px; color: #64748b; border-bottom: 2px solid #e2e8f0; }
      .goals-table td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
      .goals-table tr:hover { background: #f8fafc; }
      .type-badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
      .type-ahorro { background: #dcfce7; color: #166534; }
      .type-viaje { background: #dbeafe; color: #1e40af; }
      .type-compra { background: #f3e8ff; color: #7c3aed; }
      .status-badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 11px; }
      .status-cumplida { background: #dcfce7; color: #166534; }
      .status-pendiente { background: #fef3c7; color: #92400e; }
      .status-parcial { background: #dbeafe; color: #1e40af; }
      .status-no_cumplida { background: #fee2e2; color: #dc2626; }
      .progress-bar { width: 100px; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
      .progress-fill { height: 100%; background: linear-gradient(90deg, #6366f1, #8b5cf6); border-radius: 4px; }
      .expenses-list { font-size: 11px; color: #666; margin-top: 5px; }
      .empty-state { text-align: center; padding: 30px; color: #9ca3af; }
      .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #9ca3af; }
      @media print { body { padding: 20px; } .month-section { page-break-inside: avoid; } }
    </style>
  `
}

function generateGoalRow(goal: Goal): string {
  const progress = goal.targetValue > 0 
    ? Math.round((goal.currentValue / goal.targetValue) * 100) 
    : 0
  
  let expensesHtml = ''
  if (goal.expenses?.length) {
    expensesHtml = `<div class="expenses-list">${goal.expenses.map(e => `${e.name}: ${formatCurrency(e.cost)}`).join(', ')}</div>`
  } else if (goal.purchaseItems?.length) {
    expensesHtml = `<div class="expenses-list">${goal.purchaseItems.map(e => `${e.name}: ${formatCurrency(e.cost)}`).join(', ')}</div>`
  }
  
  return `
    <tr>
      <td>
        <strong>${goal.title}</strong>
        ${expensesHtml}
      </td>
      <td><span class="type-badge type-${goal.type}">${goal.type.toUpperCase()}</span></td>
      <td>${formatCurrency(goal.targetValue)}</td>
      <td>${formatCurrency(goal.currentValue)}</td>
      <td>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${Math.min(progress, 100)}%"></div>
        </div>
        <span style="font-size: 11px; color: #666;">${progress}%</span>
      </td>
      <td><span class="status-badge status-${goal.status}">${goal.status}</span></td>
    </tr>
  `
}

function generateMonthSection(month: Month, year: number): string {
  if (month.goals.length === 0) {
    return `
      <div class="month-section">
        <div class="month-header">
          <h2>📅 ${month.name} ${year}</h2>
          <span class="status">${month.isClosed ? '🔒 Cerrado' : '📝 Abierto'}</span>
        </div>
        <div class="empty-state">Sin metas registradas</div>
      </div>
    `
  }
  
  const goalsRows = month.goals.map(generateGoalRow).join('')
  
  return `
    <div class="month-section">
      <div class="month-header">
        <h2>📅 ${month.name} ${year}</h2>
        <span class="status">${month.isClosed ? '🔒 Cerrado' : '📝 Abierto'} • ${month.goals.length} metas</span>
      </div>
      <table class="goals-table">
        <thead>
          <tr>
            <th>Meta</th>
            <th>Tipo</th>
            <th>Objetivo</th>
            <th>Actual</th>
            <th>Progreso</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          ${goalsRows}
        </tbody>
      </table>
    </div>
  `
}

function calculateYearStats(yearPlan: YearPlan) {
  const allGoals = yearPlan.months.flatMap(m => m.goals)
  const total = allGoals.length
  const completed = allGoals.filter(g => g.status === 'cumplida').length
  const pending = allGoals.filter(g => g.status === 'pendiente').length
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
  
  return { total, completed, pending, percentage }
}

export function generateMonthPDF(month: Month, year: number): string {
  const stats = {
    total: month.goals.length,
    completed: month.goals.filter(g => g.status === 'cumplida').length,
    pending: month.goals.filter(g => g.status === 'pendiente').length,
    percentage: month.goals.length > 0 
      ? Math.round((month.goals.filter(g => g.status === 'cumplida').length / month.goals.length) * 100) 
      : 0
  }
  
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Reporte ${month.name} ${year}</title>
      ${generatePDFStyles()}
    </head>
    <body>
      <div class="header">
        <h1>📊 Reporte de ${month.name} ${year}</h1>
        <p>Generado el ${new Date().toLocaleDateString('es-MX', { dateStyle: 'full' })}</p>
      </div>
      
      <div class="summary">
        <div class="summary-card total">
          <div class="value">${stats.total}</div>
          <div class="label">Metas Totales</div>
        </div>
        <div class="summary-card completed">
          <div class="value" style="color: #166534;">${stats.completed}</div>
          <div class="label">Completadas</div>
        </div>
        <div class="summary-card pending">
          <div class="value" style="color: #92400e;">${stats.pending}</div>
          <div class="label">Pendientes</div>
        </div>
        <div class="summary-card progress">
          <div class="value" style="color: #1e40af;">${stats.percentage}%</div>
          <div class="label">Progreso</div>
        </div>
      </div>
      
      ${generateMonthSection(month, year)}
      
      <div class="footer">
        📊 Planificador Anual • Reporte generado automáticamente
      </div>
    </body>
    </html>
  `
}

export function generateYearPDF(yearPlan: YearPlan): string {
  const stats = calculateYearStats(yearPlan)
  const monthsHtml = yearPlan.months
    .filter(m => m.goals.length > 0)
    .map(m => generateMonthSection(m, yearPlan.year))
    .join('')
  
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Reporte Anual ${yearPlan.year}</title>
      ${generatePDFStyles()}
    </head>
    <body>
      <div class="header">
        <h1>📊 Reporte Anual ${yearPlan.year}</h1>
        <p>Generado el ${new Date().toLocaleDateString('es-MX', { dateStyle: 'full' })}</p>
      </div>
      
      <div class="summary">
        <div class="summary-card total">
          <div class="value">${stats.total}</div>
          <div class="label">Metas Totales</div>
        </div>
        <div class="summary-card completed">
          <div class="value" style="color: #166534;">${stats.completed}</div>
          <div class="label">Completadas</div>
        </div>
        <div class="summary-card pending">
          <div class="value" style="color: #92400e;">${stats.pending}</div>
          <div class="label">Pendientes</div>
        </div>
        <div class="summary-card progress">
          <div class="value" style="color: #1e40af;">${stats.percentage}%</div>
          <div class="label">Progreso</div>
        </div>
      </div>
      
      ${monthsHtml || '<div class="empty-state">No hay metas registradas este año</div>'}
      
      <div class="footer">
        📊 Planificador Anual • Reporte generado automáticamente
      </div>
    </body>
    </html>
  `
}

// ============ DOWNLOAD HELPERS ============

export function downloadCSV(content: string, filename: string) {
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function downloadPDF(htmlContent: string, _filename: string) {
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    alert('Por favor permite las ventanas emergentes para descargar el PDF')
    return
  }
  
  printWindow.document.write(htmlContent)
  printWindow.document.close()
  
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }
}

// ============ CSV IMPORT ============

function parseCSV(csv: string): string[][] {
  const lines = csv.split(/\r?\n/)
  const result: string[][] = []
  
  for (const line of lines) {
    if (!line.trim()) continue
    
    const row: string[] = []
    let cell = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (inQuotes) {
        if (char === '"' && line[i + 1] === '"') {
          cell += '"'
          i++
        } else if (char === '"') {
          inQuotes = false
        } else {
          cell += char
        }
      } else {
        if (char === '"') {
          inQuotes = true
        } else if (char === ',') {
          row.push(cell.trim())
          cell = ''
        } else {
          cell += char
        }
      }
    }
    row.push(cell.trim())
    result.push(row)
  }
  
  return result
}

function parseGoalType(type: string): 'ahorro' | 'viaje' | 'compra' {
  const normalized = type.toLowerCase().trim()
  if (normalized === 'viaje') return 'viaje'
  if (normalized === 'compra') return 'compra'
  return 'ahorro'
}

function parseGoalStatus(status: string): 'pendiente' | 'cumplida' | 'parcial' | 'no_cumplida' {
  const normalized = status.toLowerCase().trim()
  if (normalized === 'cumplida') return 'cumplida'
  if (normalized === 'parcial') return 'parcial'
  if (normalized === 'no_cumplida' || normalized === 'no cumplida') return 'no_cumplida'
  return 'pendiente'
}

function getMonthId(monthName: string): number {
  const normalized = monthName.toLowerCase().trim()
  const index = MONTH_NAMES_LIST.findIndex(m => m.toLowerCase() === normalized)
  return index >= 0 ? index + 1 : 1
}

export function importFromCSV(csv: string, yearPlan: YearPlan): YearPlan {
  const rows = parseCSV(csv)
  if (rows.length < 2) {
    throw new Error('El archivo CSV está vacío o no tiene datos válidos')
  }
  
  const headerRow = rows[0]
  if (!headerRow) {
    throw new Error('El archivo CSV no tiene encabezados')
  }
  
  const headers = headerRow.map(h => h.toLowerCase())
  const mesIdx = headers.findIndex(h => h.includes('mes'))
  const tituloIdx = headers.findIndex(h => h.includes('título') || h.includes('titulo'))
  const tipoIdx = headers.findIndex(h => h.includes('tipo'))
  const metaIdx = headers.findIndex(h => h.includes('meta') || h.includes('objetivo'))
  const actualIdx = headers.findIndex(h => h.includes('actual'))
  const estadoIdx = headers.findIndex(h => h.includes('estado'))
  
  if (tituloIdx === -1 || tipoIdx === -1) {
    throw new Error('El CSV debe tener columnas "Título" y "Tipo"')
  }
  
  const newPlan = JSON.parse(JSON.stringify(yearPlan)) as YearPlan
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    if (!row || row.length < 3) continue
    
    const mesValue = mesIdx >= 0 ? row[mesIdx] : undefined
    const monthId = mesValue ? getMonthId(mesValue) : 1
    const month = newPlan.months.find(m => m.id === monthId)
    if (!month) continue
    
    const title = row[tituloIdx]
    if (!title) continue
    
    const existingGoal = month.goals.find(g => g.title.toLowerCase() === title.toLowerCase())
    if (existingGoal) {
      const actualValue = actualIdx >= 0 ? row[actualIdx] : undefined
      if (actualValue) {
        existingGoal.currentValue = parseFloat(actualValue.replace(/[^0-9.-]/g, '')) || existingGoal.currentValue
      }
      const estadoValue = estadoIdx >= 0 ? row[estadoIdx] : undefined
      if (estadoValue) {
        existingGoal.status = parseGoalStatus(estadoValue)
      }
    } else {
      const tipoValue = row[tipoIdx] || 'ahorro'
      const metaValue = metaIdx >= 0 ? row[metaIdx] : undefined
      const actualValue = actualIdx >= 0 ? row[actualIdx] : undefined
      const estadoValue = estadoIdx >= 0 ? row[estadoIdx] : undefined
      
      const newGoal: Goal = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2) + i,
        title: title,
        type: parseGoalType(tipoValue),
        targetValue: metaValue ? (parseFloat(metaValue.replace(/[^0-9.-]/g, '')) || 0) : 0,
        currentValue: actualValue ? (parseFloat(actualValue.replace(/[^0-9.-]/g, '')) || 0) : 0,
        status: estadoValue ? parseGoalStatus(estadoValue) : 'pendiente',
        carryOver: false,
        createdAt: new Date().toISOString()
      }
      month.goals.push(newGoal)
    }
  }
  
  return newPlan
}

export function exportFullBackup(yearPlan: YearPlan): string {
  return JSON.stringify(yearPlan, null, 2)
}

export function importFullBackup(jsonStr: string): YearPlan {
  try {
    const data = JSON.parse(jsonStr) as YearPlan
    if (!data.year || !Array.isArray(data.months)) {
      throw new Error('Formato de backup inválido')
    }
    return data
  } catch (e) {
    throw new Error('No se pudo leer el archivo de backup')
  }
}

export function downloadJSON(content: string, filename: string) {
  const blob = new Blob([content], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
