// ** Third party imports
import { v4 } from 'uuid'

// ** Types
import { Service } from './types'
import { InstagramPostId, ProductType, ProductTypeWithoutId, ShopId } from 'src/types'

const PRODUCTS_DB = 'products'
const PRODUCTS_DB_SHOP_ID_KEY_PATH = 'shopId'
const PRODUCTS_DB_SHOP_ID_FIELD_NAME = 'by_shop_id'
const PRODUCTS_DB_INSTAGRAM_ID_FIELD_NAME = 'by_instagram_id'
const PRODUCTS_DB_PRODUCT_INSTAGRAM_ID_FIELD_PATH = 'instagramId'
class IndexedDBService implements Service {
  private static instance: IndexedDBService
  private dbName = 'insta-shop-db'
  private dbVersion = 1
  private storeName = PRODUCTS_DB
  private db: IDBDatabase | null = null

  private constructor() {}

  // private constructor(storeName: string, dbVersion: number = 1) {
  //   this.storeName = storeName
  //   this.dbVersion = dbVersion
  // }

  // public static setStore(storeName: string, dbVersion: number = 1): IndexedDBService {
  //   if (!IndexedDBService.instance) {
  //     IndexedDBService.instance = new IndexedDBService(storeName, dbVersion)
  //   }

  //   IndexedDBService.instance.init()

  //   return IndexedDBService.instance
  // }

  public static getInstance(): IndexedDBService {
    if (!IndexedDBService.instance) {
      // throw new Error("You have to invoke the setStore method before using the instance!")
      IndexedDBService.instance = new IndexedDBService()
    }

    IndexedDBService.instance.init()

    return IndexedDBService.instance
  }

  // Initialize the database
  public async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        return
      }

      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => reject(`Failed to open database ${this.dbName}`)

      request.onsuccess = event => {
        this.db = (event.target as IDBOpenDBRequest).result
        resolve()
      }

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result

        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' })
          store.createIndex(PRODUCTS_DB_SHOP_ID_FIELD_NAME, PRODUCTS_DB_SHOP_ID_KEY_PATH, { unique: false })
          store.createIndex(PRODUCTS_DB_INSTAGRAM_ID_FIELD_NAME, PRODUCTS_DB_PRODUCT_INSTAGRAM_ID_FIELD_PATH, {
            unique: true
          })
        }
      }
    })
  }

  public async getAllByShopId({ shopId }: { shopId: ShopId }): Promise<ProductType[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject('Database is not initialized')

      const transaction = this.db.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const index = store.index(PRODUCTS_DB_SHOP_ID_FIELD_NAME) // Use the specified index for querying
      const request = index.getAll(shopId)

      request.onsuccess = () => resolve(request.result as ProductType[])
      request.onerror = () => reject('Failed to retrieve items')
    })
  }

  public async save(products: ProductTypeWithoutId[]): Promise<void> {
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

  public async edit(product: ProductType): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject('Database is not initialized')

      const transaction = this.db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)

      const request = store.get(product.id!)

      request.onsuccess = () => {
        const existingProduct = request.result

        if (existingProduct) {
          // Merge updated fields with existing fields if needed
          const updatedRecord = { ...existingProduct, ...product }

          const putRequest = store.put(updatedRecord)

          putRequest.onsuccess = () => resolve()
          putRequest.onerror = () => reject('Failed to update product')
        } else {
          reject(`Product with key ${product.id} not found`)
        }
      }

      request.onerror = () => reject('Failed to retrieve product for update')
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

  public async clear(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject('Database is not initialized')

      const transaction = this.db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => reject('Failed to clear store')
    })
  }

  public async deleteItem(key: IDBValidKey): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject('Database is not initialized')

      const transaction = this.db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.delete(key)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(`Failed to delete item with key ${key}`)
    })
  }

  public async isStored({ instagramId }: { instagramId: InstagramPostId }): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject('Database is not initialized')

      const transaction = this.db.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const index = store.index(PRODUCTS_DB_INSTAGRAM_ID_FIELD_NAME)

      const request = index.get(instagramId)

      request.onsuccess = () => {
        const result = request.result

        if (result) {
          resolve(true)
        } else {
          resolve(false)
        }
      }

      request.onerror = () => {
        console.error(`Failed to find item with key ${instagramId}`)
        reject()
      }
    })
  }

  // Close the database
  public close(): void {
    if (this.db) {
      this.db.close()
    }
  }
}

export default IndexedDBService.getInstance()
