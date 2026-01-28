// ============ GOAL TYPES (existing) ============
export type GoalType = 'ahorro' | 'viaje' | 'compra'
export type GoalStatus = 'pendiente' | 'cumplida' | 'parcial' | 'no_cumplida'
export type Evaluation = 'vas bien' | 'atrasado' | 'cumplido'
export type TravelStatus = 'planeado' | 'reservado' | 'realizado'
export type PurchaseStatus = 'pendiente' | 'comprado'

export interface ExpenseItem {
  id: string
  name: string
  cost: number
}

// ============ FINANCE MANAGER TYPES ============

// Income Categories
export type IncomeCategory = 
  | 'salario'           // Salary/wages
  | 'freelance'         // Freelance/consulting
  | 'negocio'           // Business income
  | 'inversiones'       // Investment returns
  | 'alquiler'          // Rental income
  | 'bonos'             // Bonuses
  | 'regalos'           // Gifts received
  | 'reembolsos'        // Refunds
  | 'ventas'            // Sales (selling items)
  | 'otros_ingresos'    // Other income

// Expense Categories
export type ExpenseCategory = 
  | 'vivienda'          // Housing (rent, mortgage)
  | 'servicios'         // Utilities (electricity, water, gas, internet)
  | 'alimentacion'      // Food & groceries
  | 'transporte'        // Transportation (gas, public transit, uber)
  | 'salud'             // Health (insurance, medical, pharmacy)
  | 'educacion'         // Education (courses, books, tuition)
  | 'entretenimiento'   // Entertainment (movies, games, streaming)
  | 'restaurantes'      // Dining out
  | 'ropa'              // Clothing & accessories
  | 'tecnologia'        // Technology (gadgets, software)
  | 'hogar'             // Home (furniture, appliances, maintenance)
  | 'mascotas'          // Pets
  | 'cuidado_personal'  // Personal care (gym, beauty, spa)
  | 'seguros'           // Insurance (life, car, home)
  | 'deudas'            // Debt payments (loans, credit cards)
  | 'impuestos'         // Taxes
  | 'donaciones'        // Donations/charity
  | 'regalos_dados'     // Gifts given
  | 'viajes'            // Travel & vacation
  | 'suscripciones'     // Subscriptions
  | 'ahorro_inversion'  // Savings & investments
  | 'otros_gastos'      // Other expenses

export type TransactionType = 'ingreso' | 'gasto' | 'transferencia'

export type RecurrenceType = 'unica' | 'diaria' | 'semanal' | 'quincenal' | 'mensual' | 'anual'

export type PaymentMethod = 
  | 'efectivo'
  | 'tarjeta_debito'
  | 'tarjeta_credito'
  | 'transferencia'
  | 'cheque'
  | 'paypal'
  | 'otro'

// Transaction (income or expense)
export interface Transaction {
  id: string
  type: TransactionType
  category: IncomeCategory | ExpenseCategory
  amount: number
  description: string
  date: string
  paymentMethod: PaymentMethod
  account?: string
  notes?: string
  tags?: string[]
  isRecurring: boolean
  recurrence?: RecurrenceType
  createdAt: string
  updatedAt?: string
}

// Account (bank, cash, credit card, etc.)
export interface Account {
  id: string
  name: string
  type: 'efectivo' | 'banco' | 'credito' | 'inversion' | 'ahorro'
  balance: number
  currency: string
  color: string
  icon: string
  isActive: boolean
  createdAt: string
}

// Budget for a category
export interface Budget {
  id: string
  category: ExpenseCategory
  monthlyLimit: number
  currentSpent: number
  month: number
  year: number
  alerts: boolean
  alertThreshold: number // percentage (0-100)
}

// Monthly financial summary
export interface MonthlyFinancialSummary {
  month: number
  year: number
  totalIncome: number
  totalExpenses: number
  balance: number
  savingsRate: number
  topExpenseCategories: { category: ExpenseCategory; amount: number }[]
  topIncomeCategories: { category: IncomeCategory; amount: number }[]
}

// Complete financial data structure
export interface FinancialData {
  transactions: Transaction[]
  accounts: Account[]
  budgets: Budget[]
  year: number
}

// Category labels for display
export const INCOME_CATEGORY_LABELS: Record<IncomeCategory, string> = {
  salario: '💼 Salario',
  freelance: '💻 Freelance',
  negocio: '🏢 Negocio',
  inversiones: '📈 Inversiones',
  alquiler: '🏠 Alquiler',
  bonos: '🎁 Bonos',
  regalos: '🎀 Regalos',
  reembolsos: '💰 Reembolsos',
  ventas: '🛒 Ventas',
  otros_ingresos: '📥 Otros'
}

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  vivienda: '🏠 Vivienda',
  servicios: '💡 Servicios',
  alimentacion: '🛒 Alimentación',
  transporte: '🚗 Transporte',
  salud: '🏥 Salud',
  educacion: '📚 Educación',
  entretenimiento: '🎬 Entretenimiento',
  restaurantes: '🍽️ Restaurantes',
  ropa: '👔 Ropa',
  tecnologia: '📱 Tecnología',
  hogar: '🪑 Hogar',
  mascotas: '🐾 Mascotas',
  cuidado_personal: '💆 Cuidado Personal',
  seguros: '🛡️ Seguros',
  deudas: '💳 Deudas',
  impuestos: '📋 Impuestos',
  donaciones: '❤️ Donaciones',
  regalos_dados: '🎁 Regalos',
  viajes: '✈️ Viajes',
  suscripciones: '📺 Suscripciones',
  ahorro_inversion: '🏦 Ahorro/Inversión',
  otros_gastos: '📤 Otros'
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  efectivo: '💵 Efectivo',
  tarjeta_debito: '💳 Débito',
  tarjeta_credito: '💳 Crédito',
  transferencia: '🏦 Transferencia',
  cheque: '📝 Cheque',
  paypal: '🅿️ PayPal',
  otro: '📦 Otro'
}

export const RECURRENCE_LABELS: Record<RecurrenceType, string> = {
  unica: 'Única vez',
  diaria: 'Diaria',
  semanal: 'Semanal',
  quincenal: 'Quincenal',
  mensual: 'Mensual',
  anual: 'Anual'
}

export const ACCOUNT_TYPE_LABELS: Record<Account['type'], string> = {
  efectivo: '💵 Efectivo',
  banco: '🏦 Banco',
  credito: '💳 Crédito',
  inversion: '📈 Inversión',
  ahorro: '🐷 Ahorro'
}

export interface Goal {
  id: string
  title: string
  type: GoalType
  targetValue: number
  currentValue: number
  status: GoalStatus
  carryOver: boolean
  createdAt: string
  completedAt?: string
  // Campos específicos para viajes
  destination?: string
  travelStatus?: TravelStatus
  expenses?: ExpenseItem[]
  // Campos específicos para compras
  product?: string
  purchaseStatus?: PurchaseStatus
  purchaseItems?: ExpenseItem[]
  // Campos para metas distribuidas
  isDistributed?: boolean
  startMonth?: number
  endMonth?: number
  monthlyAmount?: number
}

export interface MonthSummary {
  totalGoals: number
  completedGoals: number
  pendingGoals: number
  progressPercentage: number
  evaluation: Evaluation
}

export interface Month {
  id: number
  name: string
  goals: Goal[]
  isClosed: boolean
}

export interface YearPlan {
  year: number
  months: Month[]
}

export const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export const GOAL_TYPE_LABELS: Record<GoalType, string> = {
  ahorro: 'Ahorro',
  viaje: 'Viaje',
  compra: 'Compra'
}

export const STATUS_LABELS: Record<GoalStatus, string> = {
  pendiente: 'Pendiente',
  cumplida: 'Cumplida',
  parcial: 'Parcial',
  no_cumplida: 'No Cumplida'
}
