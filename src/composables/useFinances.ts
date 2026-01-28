import { ref, computed, watch } from 'vue'
import type { 
  Transaction, 
  Account, 
  Budget, 
  FinancialData,
  IncomeCategory,
  ExpenseCategory
} from '../types'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

function createEmptyFinancialData(year: number): FinancialData {
  return {
    transactions: [],
    accounts: [
      {
        id: generateId(),
        name: 'Efectivo',
        type: 'efectivo',
        balance: 0,
        currency: 'MXN',
        color: '#22c55e',
        icon: '💵',
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: generateId(),
        name: 'Banco Principal',
        type: 'banco',
        balance: 0,
        currency: 'MXN',
        color: '#3b82f6',
        icon: '🏦',
        isActive: true,
        createdAt: new Date().toISOString()
      }
    ],
    budgets: [],
    year
  }
}

export function useFinances() {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1
  const selectedMonth = ref(currentMonth)
  const isInitialized = ref(false)
  
  // Load from localStorage
  const localStorageKey = `finance-manager-${currentYear}`
  let initialData: FinancialData = createEmptyFinancialData(currentYear)
  
  try {
    const stored = localStorage.getItem(localStorageKey)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (parsed && parsed.year === currentYear) {
        initialData = parsed
      }
    }
  } catch (e) {
    console.error('Error loading finances from localStorage:', e)
  }
  
  const financialData = ref<FinancialData>(initialData)
  isInitialized.value = true

  // Watch for changes and save
  watch(financialData, (newValue) => {
    if (!isInitialized.value) return
    try {
      localStorage.setItem(localStorageKey, JSON.stringify(newValue))
    } catch (e) {
      console.error('Error saving finances to localStorage:', e)
    }
  }, { deep: true })

  // ============ COMPUTED PROPERTIES ============

  const transactions = computed(() => financialData.value.transactions)
  const accounts = computed(() => financialData.value.accounts)
  const budgets = computed(() => financialData.value.budgets)

  // Transactions for selected month
  const monthlyTransactions = computed(() => {
    return transactions.value.filter(t => {
      const date = new Date(t.date)
      return date.getMonth() + 1 === selectedMonth.value && 
             date.getFullYear() === currentYear
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  })

  // Monthly income
  const monthlyIncome = computed(() => {
    return monthlyTransactions.value
      .filter(t => t.type === 'ingreso')
      .reduce((sum, t) => sum + t.amount, 0)
  })

  // Monthly expenses
  const monthlyExpenses = computed(() => {
    return monthlyTransactions.value
      .filter(t => t.type === 'gasto')
      .reduce((sum, t) => sum + t.amount, 0)
  })

  // Monthly balance
  const monthlyBalance = computed(() => monthlyIncome.value - monthlyExpenses.value)

  // Total balance across all accounts
  const totalBalance = computed(() => {
    return accounts.value
      .filter(a => a.isActive && a.type !== 'credito')
      .reduce((sum, a) => sum + a.balance, 0)
  })

  // Total debt (credit accounts)
  const totalDebt = computed(() => {
    return accounts.value
      .filter(a => a.isActive && a.type === 'credito')
      .reduce((sum, a) => sum + Math.abs(a.balance), 0)
  })

  // Expenses by category for selected month
  const expensesByCategory = computed(() => {
    const categoryTotals: Record<string, number> = {}
    
    monthlyTransactions.value
      .filter(t => t.type === 'gasto')
      .forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount
      })
    
    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category: category as ExpenseCategory, amount }))
      .sort((a, b) => b.amount - a.amount)
  })

  // Income by category for selected month
  const incomeByCategory = computed(() => {
    const categoryTotals: Record<string, number> = {}
    
    monthlyTransactions.value
      .filter(t => t.type === 'ingreso')
      .forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount
      })
    
    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category: category as IncomeCategory, amount }))
      .sort((a, b) => b.amount - a.amount)
  })

  // Savings rate
  const savingsRate = computed(() => {
    if (monthlyIncome.value === 0) return 0
    return Math.round((monthlyBalance.value / monthlyIncome.value) * 100)
  })

  // Budget status for selected month
  const budgetStatus = computed(() => {
    return budgets.value
      .filter(b => b.month === selectedMonth.value && b.year === currentYear)
      .map(budget => {
        const spent = monthlyTransactions.value
          .filter(t => t.type === 'gasto' && t.category === budget.category)
          .reduce((sum, t) => sum + t.amount, 0)
        
        return {
          ...budget,
          currentSpent: spent,
          percentage: budget.monthlyLimit > 0 ? Math.round((spent / budget.monthlyLimit) * 100) : 0,
          remaining: budget.monthlyLimit - spent,
          isOverBudget: spent > budget.monthlyLimit
        }
      })
  })

  // Year totals
  const yearlyIncome = computed(() => {
    return transactions.value
      .filter(t => {
        const date = new Date(t.date)
        return t.type === 'ingreso' && date.getFullYear() === currentYear
      })
      .reduce((sum, t) => sum + t.amount, 0)
  })

  const yearlyExpenses = computed(() => {
    return transactions.value
      .filter(t => {
        const date = new Date(t.date)
        return t.type === 'gasto' && date.getFullYear() === currentYear
      })
      .reduce((sum, t) => sum + t.amount, 0)
  })

  // ============ TRANSACTION METHODS ============

  function addTransaction(data: Omit<Transaction, 'id' | 'createdAt'>) {
    const transaction: Transaction = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString()
    }
    
    financialData.value.transactions.push(transaction)
    
    // Update account balance if account is specified
    if (data.account) {
      const account = financialData.value.accounts.find(a => a.id === data.account)
      if (account) {
        if (data.type === 'ingreso') {
          account.balance += data.amount
        } else if (data.type === 'gasto') {
          account.balance -= data.amount
        }
      }
    }
    
    return transaction
  }

  function updateTransaction(id: string, updates: Partial<Transaction>) {
    const index = financialData.value.transactions.findIndex(t => t.id === id)
    if (index === -1) return
    
    const oldTransaction = financialData.value.transactions[index]
    if (!oldTransaction) return
    
    // Revert old account balance
    if (oldTransaction.account) {
      const oldAccount = financialData.value.accounts.find(a => a.id === oldTransaction.account)
      if (oldAccount) {
        if (oldTransaction.type === 'ingreso') {
          oldAccount.balance -= oldTransaction.amount
        } else if (oldTransaction.type === 'gasto') {
          oldAccount.balance += oldTransaction.amount
        }
      }
    }
    
    // Apply updates
    const updatedTransaction: Transaction = {
      ...oldTransaction,
      ...updates,
      id: oldTransaction.id,
      createdAt: oldTransaction.createdAt,
      updatedAt: new Date().toISOString()
    }
    
    financialData.value.transactions[index] = updatedTransaction
    
    // Apply new account balance
    if (updatedTransaction.account) {
      const newAccount = financialData.value.accounts.find(a => a.id === updatedTransaction.account)
      if (newAccount) {
        if (updatedTransaction.type === 'ingreso') {
          newAccount.balance += updatedTransaction.amount
        } else if (updatedTransaction.type === 'gasto') {
          newAccount.balance -= updatedTransaction.amount
        }
      }
    }
  }

  function deleteTransaction(id: string) {
    const transaction = financialData.value.transactions.find(t => t.id === id)
    if (!transaction) return
    
    // Revert account balance
    if (transaction.account) {
      const account = financialData.value.accounts.find(a => a.id === transaction.account)
      if (account) {
        if (transaction.type === 'ingreso') {
          account.balance -= transaction.amount
        } else if (transaction.type === 'gasto') {
          account.balance += transaction.amount
        }
      }
    }
    
    financialData.value.transactions = financialData.value.transactions.filter(t => t.id !== id)
  }

  // ============ ACCOUNT METHODS ============

  function addAccount(data: Omit<Account, 'id' | 'createdAt'>) {
    const account: Account = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString()
    }
    financialData.value.accounts.push(account)
    return account
  }

  function updateAccount(id: string, updates: Partial<Account>) {
    const index = financialData.value.accounts.findIndex(a => a.id === id)
    if (index === -1) return
    
    const existing = financialData.value.accounts[index]
    if (!existing) return
    
    financialData.value.accounts[index] = {
      ...existing,
      ...updates,
      id: existing.id,
      createdAt: existing.createdAt
    }
  }

  function deleteAccount(id: string) {
    financialData.value.accounts = financialData.value.accounts.filter(a => a.id !== id)
  }

  // ============ BUDGET METHODS ============

  function addBudget(data: Omit<Budget, 'id' | 'currentSpent'>) {
    // Check if budget already exists for this category/month
    const existing = financialData.value.budgets.find(
      b => b.category === data.category && b.month === data.month && b.year === data.year
    )
    
    if (existing) {
      // Update existing
      existing.monthlyLimit = data.monthlyLimit
      existing.alerts = data.alerts
      existing.alertThreshold = data.alertThreshold
      return existing
    }
    
    const budget: Budget = {
      ...data,
      id: generateId(),
      currentSpent: 0
    }
    financialData.value.budgets.push(budget)
    return budget
  }

  function updateBudget(id: string, updates: Partial<Budget>) {
    const index = financialData.value.budgets.findIndex(b => b.id === id)
    if (index === -1) return
    
    const existing = financialData.value.budgets[index]
    if (!existing) return
    
    financialData.value.budgets[index] = {
      ...existing,
      ...updates,
      id: existing.id
    }
  }

  function deleteBudget(id: string) {
    financialData.value.budgets = financialData.value.budgets.filter(b => b.id !== id)
  }

  // ============ UTILITY METHODS ============

  function resetFinances() {
    financialData.value = createEmptyFinancialData(currentYear)
  }

  function getTransactionsByDateRange(startDate: string, endDate: string) {
    const start = new Date(startDate).getTime()
    const end = new Date(endDate).getTime()
    
    return transactions.value.filter(t => {
      const date = new Date(t.date).getTime()
      return date >= start && date <= end
    })
  }

  return {
    // Data
    financialData,
    selectedMonth,
    
    // Computed
    transactions,
    accounts,
    budgets,
    monthlyTransactions,
    monthlyIncome,
    monthlyExpenses,
    monthlyBalance,
    totalBalance,
    totalDebt,
    expensesByCategory,
    incomeByCategory,
    savingsRate,
    budgetStatus,
    yearlyIncome,
    yearlyExpenses,
    
    // Transaction methods
    addTransaction,
    updateTransaction,
    deleteTransaction,
    
    // Account methods
    addAccount,
    updateAccount,
    deleteAccount,
    
    // Budget methods
    addBudget,
    updateBudget,
    deleteBudget,
    
    // Utility
    resetFinances,
    getTransactionsByDateRange
  }
}
