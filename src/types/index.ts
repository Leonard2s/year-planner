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
