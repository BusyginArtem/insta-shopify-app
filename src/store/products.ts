// ** Third party imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Constants
import { REQUEST_STATUTES } from 'src/configs/constants'

// ** Types
import type { ProductType, RequestStatusTypes } from 'src/types'
import { RootState } from '.'
import { FormatProductsType } from 'src/services/db/products/types'

// ** Service
// import FirestoreService from 'src/services/db/products/firestore'
import IndexedDBService from 'src/services/db/products/indexeddb'
import ProductDBAdapter from 'src/services/db/products/adapter'

// ** Helpers
import { isError, formatProducts } from 'src/services/db/products/helpers'

// const dbAdapter = new ProductDBAdapter(FirestoreService)
const dbAdapter = new ProductDBAdapter(IndexedDBService)

// ** Fetch products
export const fetchProducts = createAsyncThunk('products/fetchData', async ({ shopId }: { shopId: string }) => {
  return dbAdapter.getProductList({ shopId })
})

// ** Save products
export const saveProducts = createAsyncThunk(
  'products/saveData',
  async ({ shop, instagramAccountId, userId, facebookAccessToken }: FormatProductsType) => {
    const shopId = shop.id
    const storedProductsCount = await dbAdapter.getProductCount({ shopId })

    if (!storedProductsCount) {
      const formattedProducts = await formatProducts({ shop, instagramAccountId, userId, facebookAccessToken })

      await dbAdapter.saveProducts(formattedProducts)
    }
  }
)

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
    builder.addCase(saveProducts.pending, state => {
      state.status = REQUEST_STATUTES.PENDING
    })
    builder.addCase(saveProducts.fulfilled, state => {
      state.status = REQUEST_STATUTES.RESOLVED
    })
    builder.addCase(saveProducts.rejected, (state, action) => {
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

// export const { formatProducts } = productsSlice.actions

export default productsSlice.reducer
