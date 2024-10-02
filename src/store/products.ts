// ** Third party imports
import { createAsyncThunk, createSlice, createSelector } from '@reduxjs/toolkit'

// ** Constants
import { REQUEST_STATUTES } from 'src/configs/constants'

// ** Types
import type { ProductType, InstagramPostType, RequestStatusTypes } from 'src/types'
import { AppDispatch, RootState } from '.'
import type { SaveDBProductsType } from 'src/services/db/products/types'

// ** Service
import IndexedDBService from 'src/services/db/products/indexeddb'
import ProductDBAdapter from 'src/services/db/products/adapter'

// ** Hooks
import useFacebook from 'src/hooks/useFacebook'

// ** Helpers
import { isError, formatProducts } from 'src/services/db/products/helpers'
import { selectShopifyProducts } from './shopify'

// NOTE Don't remove
// const dbAdapter = new ProductDBAdapter(FirestoreService)
const dbAdapter = new ProductDBAdapter(IndexedDBService)

export const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: RootState
  dispatch: AppDispatch
  rejectValue: string
  // extra: { s: string; n: number }
}>()

// ** Fetch DB products
export const fetchDBProducts = createAppAsyncThunk('products/fetchDBItems', async ({ shopId }: { shopId: string }) => {
  return dbAdapter.getProductList({ shopId })
})

// ** Save products
export const saveDBProducts = createAppAsyncThunk(
  'products/saveDBItems',
  async ({ shop, instagramAccountId, userId, facebookAccessToken }: SaveDBProductsType) => {
    const shopId = shop.id
    const storedProductsCount = await dbAdapter.getProductCount({ shopId })

    if (!storedProductsCount) {
      const facebook = useFacebook(facebookAccessToken)
      const posts: InstagramPostType[] = await facebook.getInstagramPosts(instagramAccountId)

      const formattedProducts = await formatProducts({ shop, userId, posts })

      await dbAdapter.saveProducts(formattedProducts)
    }
  }
)

// ** Sync products
export const syncDBProducts = createAppAsyncThunk(
  'products/syncDBItems',
  async ({ shop, instagramAccountId, userId, facebookAccessToken }: SaveDBProductsType) => {
    const facebook = useFacebook(facebookAccessToken)
    const posts: InstagramPostType[] = await facebook.getInstagramPosts(instagramAccountId)

    let unStoredPosts = await Promise.all(
      posts.map(async post => {
        try {
          return (await dbAdapter.checkProductExistence({ instagramId: post.id })) ? null : post
        } catch (e) {
          return null
        }
      })
    )

    unStoredPosts = unStoredPosts.filter(post => post !== null)

    const formattedProducts = await formatProducts({ shop, userId, posts: unStoredPosts as InstagramPostType[] })

    await dbAdapter.saveProducts(formattedProducts)
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
    builder.addCase(fetchDBProducts.pending, state => {
      state.status = REQUEST_STATUTES.PENDING
      state.error = null
    })
    builder.addCase(fetchDBProducts.fulfilled, (state, action) => {
      state.data = action.payload
      state.status = REQUEST_STATUTES.RESOLVED
    })
    builder.addCase(fetchDBProducts.rejected, (state, action) => {
      if (isError(action.error)) {
        state.error = action.error
      } else if (action.error.message) {
        state.error = Error(action.error.message)
      } else {
        state.error = Error('Something went wrong!')
      }

      state.status = REQUEST_STATUTES.REJECTED
    })
    builder.addCase(saveDBProducts.pending, state => {
      state.status = REQUEST_STATUTES.PENDING
    })
    builder.addCase(saveDBProducts.fulfilled, state => {
      state.status = REQUEST_STATUTES.RESOLVED
    })
    builder.addCase(saveDBProducts.rejected, (state, action) => {
      if (isError(action.error)) {
        state.error = action.error
      } else if (action.error.message) {
        state.error = Error(action.error.message)
      } else {
        state.error = Error('Something went wrong!')
      }

      state.status = REQUEST_STATUTES.REJECTED
    })
    builder.addCase(syncDBProducts.pending, state => {
      state.status = REQUEST_STATUTES.PENDING
    })
    builder.addCase(syncDBProducts.fulfilled, state => {
      state.status = REQUEST_STATUTES.RESOLVED
    })
    builder.addCase(syncDBProducts.rejected, (state, action) => {
      if (isError(action.error)) {
        state.error = action.error
      } else if (action.error.message) {
        state.error = Error(action.error.message)
      } else {
        state.error = Error('Something went wrong!')
      }

      state.status = REQUEST_STATUTES.REJECTED
    })
  }
})

export const selectClientProductsData = (state: RootState) => state.products.data
export const selectFetchClientProductsStatus = (state: RootState) => state.products.status
export const selectProductsError = (state: RootState) => state.products.error

export const selectIntersectedProducts = createSelector(
  selectClientProductsData,
  selectShopifyProducts,
  (products, shopifyProducts) =>
    products.map(product => {
      const shopifyProduct = shopifyProducts.find(shopifyProduct => shopifyProduct.instagramId === product.instagramId)

      if (shopifyProduct) {
        return {
          ...product,
          shopifyProductId: shopifyProduct.shopifyProductId,
          onlineStorePreviewUrl: shopifyProduct.onlineStorePreviewUrl
        }
      }

      return product
    })
)

export default productsSlice.reducer
