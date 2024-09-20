// ** Firebase imports
import { addDoc, collection, getDocs, query, where } from '@firebase/firestore'

// ** Hooks
// import useFacebook from 'src/hooks/useFacebook'
// import useFirebaseVertexAI from 'src/hooks/useFirebaseVertexAI'
import useFirebaseFirestore from 'src/hooks/useFirebaseFirestore'

// ** Types
import { Service } from './types'
import { ProductType } from 'src/types'

const PRODUCTS_COLLECTION = 'products'

class FirestoreService implements Service {
  // private facebook = useFacebook('')
  // private vertex = useFirebaseVertexAI()
  private db = useFirebaseFirestore()

  async getProducts({ shopId }: { shopId: string }): Promise<ProductType[]> {
    const productsRef = collection(this.db, PRODUCTS_COLLECTION)
    const querySnapshot = await getDocs(query(productsRef, where('shopId', '==', shopId)))

    return !querySnapshot.empty ? querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as ProductType) })) : []
  }

  async saveProducts(products: ProductType[]) {
    for (const product of products) {
      await addDoc(collection(this.db, PRODUCTS_COLLECTION), product)
    }
  }
}

export default FirestoreService
