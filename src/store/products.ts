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
import shopifyAdminFetch from 'src/utils/shopifyAdminFetch'
import { queryProductsByInstagramOrigin } from 'src/utils/shopifySchemas'

// const dbAdapter = new ProductDBAdapter(FirestoreService)
const dbAdapter = new ProductDBAdapter(IndexedDBService)

// ** Fetch DB products
export const fetchDBProducts = createAsyncThunk('products/fetchDBItems', async ({ shopId }: { shopId: string }) => {
  return dbAdapter.getProductList({ shopId })
})

// ** Fetch Shopify products
export const fetchShopifyProducts = createAsyncThunk('products/fetchShopifyItems', async () => {
  const { data: products } = await shopifyAdminFetch({ query: queryProductsByInstagramOrigin() })
  console.log('%c response', 'color: green; font-weight: bold;', products)
  return []
})

// ** Save products
export const saveProducts = createAsyncThunk(
  'products/saveDBItems',
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
  data: {
    client: ProductType[]
    shopify: ProductType[]
  }
  status: {
    client: RequestStatusTypes
    shopify: RequestStatusTypes
  }
  error: Error | null
}

const initialState: ProductsState = {
  data: {
    client: [],
    shopify: []
  },
  error: null,
  status: {
    client: REQUEST_STATUTES.IDLE,
    shopify: REQUEST_STATUTES.IDLE
  }
}

export const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchDBProducts.pending, state => {
      state.status.client = REQUEST_STATUTES.PENDING
    })
    builder.addCase(fetchDBProducts.fulfilled, (state, action) => {
      state.data.client = action.payload
      state.status.client = REQUEST_STATUTES.RESOLVED
    })
    builder.addCase(fetchDBProducts.rejected, (state, action) => {
      if (isError(action.error)) {
        state.error = action.error
      } else if (action.error.message) {
        state.error = Error(action.error.message)
      } else {
        state.error = Error('Something went wrong!')
      }

      state.status.client = REQUEST_STATUTES.REJECTED
    })
    builder.addCase(fetchShopifyProducts.pending, state => {
      state.status.shopify = REQUEST_STATUTES.PENDING
    })
    builder.addCase(fetchShopifyProducts.fulfilled, (state, action) => {
      state.data.shopify = action.payload
      state.status.shopify = REQUEST_STATUTES.RESOLVED
    })
    builder.addCase(fetchShopifyProducts.rejected, (state, action) => {
      if (isError(action.error)) {
        state.error = action.error
      } else if (action.error.message) {
        state.error = Error(action.error.message)
      } else {
        state.error = Error('Something went wrong!')
      }

      state.status.shopify = REQUEST_STATUTES.REJECTED
    })
    builder.addCase(saveProducts.pending, state => {
      state.status.client = REQUEST_STATUTES.PENDING
    })
    builder.addCase(saveProducts.fulfilled, state => {
      state.status.client = REQUEST_STATUTES.RESOLVED
    })
    builder.addCase(saveProducts.rejected, (state, action) => {
      if (isError(action.error)) {
        state.error = action.error
      } else if (action.error.message) {
        state.error = Error(action.error.message)
      } else {
        state.error = Error('Something went wrong!')
      }

      state.status.client = REQUEST_STATUTES.REJECTED
    })
  }
})

export const selectClientProductsData = (state: RootState) => state.products.data.client
export const selectFetchClientProductsStatus = (state: RootState) => state.products.status.client
export const selectProductsError = (state: RootState) => state.products.error

// export const { formatProducts } = productsSlice.actions

export default productsSlice.reducer
