import type { YearPlan } from '../types'

const DB_NAME = 'YearPlannerDB'
const DB_VERSION = 1
const STORE_NAME = 'yearPlans'

let db: IDBDatabase | null = null

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db)
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      reject(new Error('Error al abrir IndexedDB'))
    }

    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result
      
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'year' })
      }
    }
  })
}

export async function saveYearPlan(yearPlan: YearPlan): Promise<void> {
  try {
    const database = await openDB()
    const transaction = database.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    
    store.put(yearPlan)
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(new Error('Error al guardar en IndexedDB'))
    })
  } catch (error) {
    console.error('Error saving to IndexedDB:', error)
    localStorage.setItem(`year-planner-${yearPlan.year}`, JSON.stringify(yearPlan))
  }
}

export async function loadYearPlan(year: number): Promise<YearPlan | null> {
  try {
    const database = await openDB()
    const transaction = database.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.get(year)
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        resolve(request.result || null)
      }
      request.onerror = () => reject(new Error('Error al cargar desde IndexedDB'))
    })
  } catch (error) {
    console.error('Error loading from IndexedDB:', error)
    const fallback = localStorage.getItem(`year-planner-${year}`)
    return fallback ? JSON.parse(fallback) : null
  }
}

export async function getAllYearPlans(): Promise<YearPlan[]> {
  try {
    const database = await openDB()
    const transaction = database.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.getAll()
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        resolve(request.result || [])
      }
      request.onerror = () => reject(new Error('Error al obtener todos los planes'))
    })
  } catch (error) {
    console.error('Error getting all plans from IndexedDB:', error)
    return []
  }
}

export async function deleteYearPlan(year: number): Promise<void> {
  try {
    const database = await openDB()
    const transaction = database.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    
    store.delete(year)
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(new Error('Error al eliminar de IndexedDB'))
    })
  } catch (error) {
    console.error('Error deleting from IndexedDB:', error)
    localStorage.removeItem(`year-planner-${year}`)
  }
}
