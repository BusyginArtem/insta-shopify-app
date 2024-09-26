// ** Third party imports
import { createAsyncThunk, createSlice, createSelector } from '@reduxjs/toolkit'

// ** Constants
import { REQUEST_STATUTES } from 'src/configs/constants'

// ** Types
import type { InstagramPostType, ProductType, RequestStatusTypes, ShopifyEdge, ShopifyProduct } from 'src/types'
import { AppDispatch, RootState } from '.'
import type { SaveDBProductsType } from 'src/services/db/products/types'
import type { GridRowId } from '@mui/x-data-grid'

// ** Service
// import FirestoreService from 'src/services/db/products/firestore'
import IndexedDBService from 'src/services/db/products/indexeddb'
import ProductDBAdapter from 'src/services/db/products/adapter'

// ** Helpers
import { isError, formatProducts } from 'src/services/db/products/helpers'
import shopifyAdminFetch from 'src/utils/shopifyAdminFetch'
import { createProduct, queryProductsByInstagramOrigin } from 'src/utils/shopifySchemas'
import useFacebook from 'src/hooks/useFacebook'
// import { getInstagramIDsFromShopifyProducts } from './helpers'

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

// ** Fetch Shopify products
export const fetchShopifyInstagramProducts = createAppAsyncThunk('products/fetchShopifyItems', async () => {
  const { data } = await shopifyAdminFetch({ query: queryProductsByInstagramOrigin() })

  // TODO add infinity request to get all products
  const products = data.products.edges

  const shopifyStoredProducts = products
    .map((product: ShopifyEdge) => {
      if (product.node.metafields.edges[0]?.node?.value) {
        return {
          shopifyProductId: product.node.id,
          instagramId: product.node.metafields.edges[0]?.node?.value
        }
      }

      return null
    })
    .filter((product: any) => product)

  return shopifyStoredProducts
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

// ** Add to Shopify shop products
export const addToShopProducts = createAppAsyncThunk(
  'products/addToShopify',
  async ({ productIds }: { productIds: GridRowId[] }, { getState }) => {
    const { products } = getState()

    try {
      const selectedProductsData = products.data.client.filter(product => productIds.includes(product.id as string))
      const instagramIDs: ShopifyProduct[] = []

      await Promise.all(
        selectedProductsData.map(async product => {
          const { data } = await shopifyAdminFetch({ query: createProduct(product) })
          console.log('%c data', 'color: green; font-weight: bold;', data)

          // const productId = data?.data?.productCreate?.product?.id

          // if (productId) {
          //   const metafieldResponse = await shopifyAdminFetch({
          //     query: metafieldMutation(productId, product.instagramId)
          //   })

          //   console.log('%c metafieldResponse', 'color: green; font-weight: bold;', metafieldResponse)
          // }
          instagramIDs.push({
            instagramId: product.instagramId,
            shopifyProductId: data.productCreate.product.id
          })
        })
      )

      return instagramIDs
    } catch (error) {
      console.log('%c error', 'color: red; font-weight: bold;', error)
    }
  }
)

type ProductsState = {
  data: {
    client: ProductType[]
    shopify: ShopifyProduct[]
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
      state.error = null
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
    builder.addCase(fetchShopifyInstagramProducts.pending, state => {
      state.status.shopify = REQUEST_STATUTES.PENDING
      state.error = null
    })
    builder.addCase(fetchShopifyInstagramProducts.fulfilled, (state, action) => {
      state.data.shopify = action.payload
      state.status.shopify = REQUEST_STATUTES.RESOLVED
    })
    builder.addCase(fetchShopifyInstagramProducts.rejected, (state, action) => {
      if (isError(action.error)) {
        state.error = action.error
      } else if (action.error.message) {
        state.error = Error(action.error.message)
      } else {
        state.error = Error('Something went wrong!')
      }

      state.status.shopify = REQUEST_STATUTES.REJECTED
    })
    builder.addCase(saveDBProducts.pending, state => {
      state.status.client = REQUEST_STATUTES.PENDING
    })
    builder.addCase(saveDBProducts.fulfilled, state => {
      state.status.client = REQUEST_STATUTES.RESOLVED
    })
    builder.addCase(saveDBProducts.rejected, (state, action) => {
      if (isError(action.error)) {
        state.error = action.error
      } else if (action.error.message) {
        state.error = Error(action.error.message)
      } else {
        state.error = Error('Something went wrong!')
      }

      state.status.client = REQUEST_STATUTES.REJECTED
    })
    builder.addCase(syncDBProducts.pending, state => {
      state.status.client = REQUEST_STATUTES.PENDING
    })
    builder.addCase(syncDBProducts.fulfilled, state => {
      state.status.client = REQUEST_STATUTES.RESOLVED
    })
    builder.addCase(syncDBProducts.rejected, (state, action) => {
      if (isError(action.error)) {
        state.error = action.error
      } else if (action.error.message) {
        state.error = Error(action.error.message)
      } else {
        state.error = Error('Something went wrong!')
      }

      state.status.client = REQUEST_STATUTES.REJECTED
    })
    builder.addCase(addToShopProducts.pending, state => {
      state.status.shopify = REQUEST_STATUTES.PENDING
      state.error = null
    })
    builder.addCase(addToShopProducts.fulfilled, (state, action) => {
      state.data.shopify = [...state.data.shopify, ...(action.payload as ShopifyProduct[])]
      state.status.shopify = REQUEST_STATUTES.RESOLVED
    })
    builder.addCase(addToShopProducts.rejected, (state, action) => {
      if (isError(action.error)) {
        state.error = action.error
      } else if (action.error.message) {
        state.error = Error(action.error.message)
      } else {
        state.error = Error('Something went wrong!')
      }

      state.status.shopify = REQUEST_STATUTES.REJECTED
    })
  }
})

export const selectClientProductsData = (state: RootState) => state.products.data.client
export const selectShopifyProducts = (state: RootState) => state.products.data.shopify
export const selectFetchClientProductsStatus = (state: RootState) => state.products.status.client
export const selectProductsError = (state: RootState) => state.products.error

export const select = createSelector(selectClientProductsData, selectShopifyProducts, (products, shopifyProducts) =>
  products.map(product => {
    if (product.instagramId === shopifyProducts) {
    }
  })
)

// export const { formatProducts } = productsSlice.actions

export default productsSlice.reducer
