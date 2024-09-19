// ** Third party imports
import { collection, getDocs, query, where } from '@firebase/firestore'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Hooks
import useAuth from 'src/hooks/useAuth'
import useFirebaseFirestore from 'src/hooks/useFirebaseFirestore'

// ** Constants
import { REQUEST_STATUTES } from 'src/configs/constants'

// ** Types
import type { ProductType, RequestStatusTypes } from 'src/types'
import { RootState } from '.'

const PRODUCTS_COLLECTION = 'products'

// ** Helpers
const isError = (err: unknown): err is Error => err instanceof Error

const db = useFirebaseFirestore()

// ** Fetch products
export const fetchProducts = createAsyncThunk('products/fetchData', async ({ shopId }: { shopId: string }) => {
  const productsRef = collection(db, PRODUCTS_COLLECTION)
  const querySnapshot = await getDocs(query(productsRef, where('shopId', '==', shopId)))

  return !querySnapshot.empty ? querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as ProductType) })) : []
})

type ProductsState = {
  data: ProductType[]
  status: RequestStatusTypes
  error: Error | null
}

const initialState: ProductsState = {
  data: [],
  error: null,
  status: REQUEST_STATUTES.IDLE
}

export const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchProducts.pending, state => {
      state.status = REQUEST_STATUTES.PENDING
    })
    builder.addCase(fetchProducts.fulfilled, (state, action) => {
      state.data = action.payload
      state.status = REQUEST_STATUTES.RESOLVED
    })
    builder.addCase(fetchProducts.rejected, (state, action) => {
      if (isError(action.payload)) {
        state.error = action.payload
      } else {
        state.error = Error('Something went wrong!')
      }
      state.status = REQUEST_STATUTES.REJECTED
    })
  }
})

export const selectProductsData = (state: RootState) => state.products.data
export const selectFetchProductsStatus = (state: RootState) => state.products.status

export default productsSlice.reducer
