// ** Third party imports
import { v4 } from 'uuid'

// ** Types
import { Service } from './types'
import { ProductType } from 'src/types'

const PRODUCTS_DB = 'products'

class IndexedDBService implements Service {
  private static instance: IndexedDBService
  private dbName = 'insta-shop-db'
  private dbVersion = 1
  private storeName = PRODUCTS_DB
  private db: IDBDatabase | null = null

  private constructor() {}

  public static getInstance(): IndexedDBService {
    if (!IndexedDBService.instance) {
      IndexedDBService.instance = new IndexedDBService()
    }

    IndexedDBService.instance.init()

    return IndexedDBService.instance
  }

  // Initialize the database
  public async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => reject(`Failed to open database ${this.dbName}`)

      request.onsuccess = event => {
        this.db = (event.target as IDBOpenDBRequest).result
        resolve()
      }

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result

        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' })
        }
      }
    })
  }

  public async getAll(): Promise<ProductType[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject('Database is not initialized')

      const transaction = this.db.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject('Failed to retrieve items')
    })
  }

  public async save(products: ProductType[]): Promise<void> {
    if (!this.db) {
      throw new Error('Database is not initialized')
    }

    const transaction = this.db.transaction([this.storeName], 'readwrite')
    const store = transaction.objectStore(this.storeName)

    for (const product of products) {
      await new Promise<void>((resolve, reject) => {
        const request = store.add({ id: v4(), ...product })

        request.onsuccess = () => resolve()
        request.onerror = () => reject('Failed to add product')
      })
    }
  }

  public async edit(key: IDBValidKey, updatedItem: ProductType): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject('Database is not initialized')

      const transaction = this.db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)

      const getRequest = store.get(key)

      getRequest.onsuccess = () => {
        const existingItem = getRequest.result

        if (existingItem) {
          // Merge updated fields with existing fields if needed
          const updatedRecord = { ...existingItem, ...updatedItem }

          const putRequest = store.put(updatedRecord)

          putRequest.onsuccess = () => resolve()
          putRequest.onerror = () => reject('Failed to update product')
        } else {
          reject(`Product with key ${key} not found`)
        }
      }

      getRequest.onerror = () => reject('Failed to retrieve product for update')
    })
  }

  public async getCount(): Promise<number> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject('Database is not initialized')

      const transaction = this.db.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.count()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject('Failed to get count')
    })
  }
}

//  // Delete an item by key
//  public async deleteItem(key: IDBValidKey): Promise<void> {
//   return new Promise((resolve, reject) => {
//     if (!this.db) return reject("Database is not initialized");

//     const transaction = this.db.transaction([this.storeName], "readwrite");
//     const store = transaction.objectStore(this.storeName);
//     const request = store.delete(key);

//     request.onsuccess = () => resolve();
//     request.onerror = () => reject(`Failed to delete item with key ${key}`);
//   });
// }

// // Clear the store
// public async clearStore(): Promise<void> {
//   return new Promise((resolve, reject) => {
//     if (!this.db) return reject("Database is not initialized");

//     const transaction = this.db.transaction([this.storeName], "readwrite");
//     const store = transaction.objectStore(this.storeName);
//     const request = store.clear();

//     request.onsuccess = () => resolve();
//     request.onerror = () => reject("Failed to clear store");
//   });
// }

// // Close the database
// public close(): void {
//   if (this.db) {
//     this.db.close();
//   }
// }

export default IndexedDBService.getInstance()
