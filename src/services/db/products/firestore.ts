// ** Firebase imports
import { addDoc, collection, getCountFromServer, getDocs, query, where, updateDoc, doc } from '@firebase/firestore'

// ** Hooks
import useFirebaseFirestore from 'src/hooks/useFirebaseFirestore'

// ** Types
import { Service } from './types'
import { ProductType } from 'src/types'

const PRODUCTS_COLLECTION = 'products'

class FirestoreService implements Service {
  private static instance: FirestoreService
  private db = useFirebaseFirestore()

  private constructor() {}

  public static getInstance(): FirestoreService {
    if (!FirestoreService.instance) {
      FirestoreService.instance = new FirestoreService()
    }

    return FirestoreService.instance
  }

  public async getAllByShopId({ shopId }: { shopId: string }): Promise<ProductType[]> {
    const productsRef = collection(this.db, PRODUCTS_COLLECTION)
    const querySnapshot = await getDocs(query(productsRef, where('shopId', '==', shopId)))

    return !querySnapshot.empty ? querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as ProductType) })) : []
  }

  public async save(products: ProductType[]) {
    for (const product of products) {
      await addDoc(collection(this.db, PRODUCTS_COLLECTION), product)
    }
  }

  public async edit(productData: ProductType): Promise<void> {
    const productDocRef = doc(this.db, PRODUCTS_COLLECTION, productData.id!)

    await updateDoc(productDocRef, productData)
  }

  public async getCount({ shopId }: { shopId: string }): Promise<number> {
    const coll = collection(this.db, PRODUCTS_COLLECTION)
    const q = query(coll, where('shopId', '==', shopId))
    const snapshot = await getCountFromServer(q)

    return snapshot.data().count || 0
  }

  public async isStored({ instagramId }: { instagramId: string }): Promise<boolean> {
    const productsRef = collection(this.db, PRODUCTS_COLLECTION)

    const q = query(productsRef, where('instagramId', '==', instagramId))

    const querySnapshot = await getDocs(q)

    console.log(querySnapshot.empty)

    return querySnapshot.empty
  }
}

export default FirestoreService.getInstance()
