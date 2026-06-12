/**
 * Capa mínima sobre IndexedDB (nativo, sin Dexie: el uso es simple
 * y evita una dependencia más) para datos recientes y cola offline.
 */

const DB_NAME = 'calendar-pwa'
const DB_VERSION = 1

export const STORES = {
  events: 'events',
  tasks: 'tasks',
  queue: 'mutationQueue',
  meta: 'meta',
} as const

type StoreName = (typeof STORES)[keyof typeof STORES]

let dbPromise: Promise<IDBDatabase> | null = null

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORES.events)) {
        db.createObjectStore(STORES.events, { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains(STORES.tasks)) {
        db.createObjectStore(STORES.tasks, { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains(STORES.queue)) {
        db.createObjectStore(STORES.queue, { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains(STORES.meta)) {
        db.createObjectStore(STORES.meta)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('No se pudo abrir IndexedDB'))
  })
  return dbPromise
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Error de IndexedDB'))
  })
}

export async function getAll<T>(store: StoreName): Promise<T[]> {
  const db = await openDb()
  const tx = db.transaction(store, 'readonly')
  return requestToPromise(tx.objectStore(store).getAll() as IDBRequest<T[]>)
}

/** Reemplaza el contenido completo del store con las filas dadas (snapshot). */
export async function replaceAll<T>(store: StoreName, rows: T[]): Promise<void> {
  const db = await openDb()
  const tx = db.transaction(store, 'readwrite')
  const objectStore = tx.objectStore(store)
  objectStore.clear()
  for (const row of rows) {
    objectStore.put(row)
  }
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('Error guardando snapshot'))
  })
}

export async function putRow<T>(store: StoreName, row: T): Promise<void> {
  const db = await openDb()
  const tx = db.transaction(store, 'readwrite')
  tx.objectStore(store).put(row)
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('Error escribiendo en IndexedDB'))
  })
}

export async function deleteRow(store: StoreName, key: string): Promise<void> {
  const db = await openDb()
  const tx = db.transaction(store, 'readwrite')
  tx.objectStore(store).delete(key)
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('Error borrando en IndexedDB'))
  })
}

export async function getMeta<T>(key: string): Promise<T | undefined> {
  const db = await openDb()
  const tx = db.transaction(STORES.meta, 'readonly')
  return requestToPromise(tx.objectStore(STORES.meta).get(key) as IDBRequest<T | undefined>)
}

export async function setMeta<T>(key: string, value: T): Promise<void> {
  const db = await openDb()
  const tx = db.transaction(STORES.meta, 'readwrite')
  tx.objectStore(STORES.meta).put(value, key)
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('Error escribiendo meta'))
  })
}
