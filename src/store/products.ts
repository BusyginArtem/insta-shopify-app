// ** Third party imports
import { createAsyncThunk, createSlice, createSelector } from '@reduxjs/toolkit'

// ** Constants
import { REQUEST_STATUTES } from 'src/configs/constants'

// ** Types
import type {
  ShopifyEdge,
  ProductType,
  ShopifyProduct,
  ShopifyCategory,
  ProductCategories,
  InstagramPostType,
  RequestStatusTypes
} from 'src/types'
import { AppDispatch, RootState } from '.'
import type { SaveDBProductsType } from 'src/services/db/products/types'
import type { GridRowId } from '@mui/x-data-grid'

// ** Service
import IndexedDBService from 'src/services/db/products/indexeddb'
import ProductDBAdapter from 'src/services/db/products/adapter'

// ** Hooks
import useFacebook from 'src/hooks/useFacebook'

// ** Helpers
import { isError, formatProducts, uploadShopifyCategories } from 'src/services/db/products/helpers'
import shopifyAdminFetch from 'src/utils/shopifyAdminFetch'
import {
  createProduct,
  fetchProductCategoriesNestedLevel,
  fetchProductCategoriesNestedLevelNext,
  fetchProductCategoriesTopLevel,
  queryProductsByInstagramOrigin
} from 'src/utils/shopifySchemas'
import { extractProductId, processProductsByVertexAI } from './helpers'

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

// ** Fetch Shopify products
export const fetchShopifyInstagramProducts = createAppAsyncThunk('products/fetchShopifyItems', async () => {
  let hasNextPage = false
  let shopifyProducts: ShopifyProduct[] = []

  do {
    const { data } = await shopifyAdminFetch({ query: queryProductsByInstagramOrigin() })

    hasNextPage = data.products.pageInfo.hasNextPage
    const products = data.products.edges

    const shopifyStoredProducts = products
      .map((product: ShopifyEdge) => {
        if (product.node.metafields.edges[0]?.node?.value) {
          return {
            shopifyProductId: extractProductId(product.node.id),
            instagramId: product.node.metafields.edges[0]?.node?.value,
            onlineStorePreviewUrl: product.node.onlineStorePreviewUrl
          }
        }

        return null
      })
      .filter((product: any) => product)

    shopifyProducts = [...shopifyProducts, ...shopifyStoredProducts]
  } while (hasNextPage)

  return shopifyProducts
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
  async ({ productIds, vertexAIEnabled }: { productIds: GridRowId[]; vertexAIEnabled: boolean }, { getState }) => {
    const { products } = getState()

    let selectedProductsData = products.data.client.filter(product => productIds.includes(product.id as string))
    const instagramIDs: ShopifyProduct[] = []

    if (vertexAIEnabled && products.categories) {
      selectedProductsData = await processProductsByVertexAI(selectedProductsData, products.categories)
    }

    await Promise.all(
      selectedProductsData.map(async (product, idx) => {
        const { data } = await shopifyAdminFetch({ query: createProduct(product) })

        if (data.productCreate?.product?.id) {
          selectedProductsData[idx].onlineStorePreviewUrl = data.productCreate?.product?.onlineStorePreviewUrl

          instagramIDs.push({
            instagramId: product.instagramId,
            shopifyProductId: extractProductId(data.productCreate.product.id),
            onlineStorePreviewUrl: product.onlineStorePreviewUrl!
          })
        }
      })
    )

    await dbAdapter.editProducts(selectedProductsData)

    return instagramIDs
  }
)

const fetchProductCategoriesNestedLevels = async (category: ShopifyCategory) => {
  let nestedCategoryList: ProductCategories = {}
  let hasNextPage: boolean = false
  let cursor: string | null = null

  do {
    let data: {
      edges: ShopifyCategory[]
      pageInfo: {
        hasNextPage: boolean
      }
    } = {
      edges: [],
      pageInfo: {
        hasNextPage: false
      }
    }

    if (cursor) {
      const result = await shopifyAdminFetch({
        query: fetchProductCategoriesNestedLevelNext({ categoryId: category.node.id, cursor })
      })

      cursor = null
      data = result.data?.taxonomy?.categories
    } else {
      const result = await shopifyAdminFetch({
        query: fetchProductCategoriesNestedLevel({ categoryId: category.node.id })
      })

      cursor = null
      data = result.data?.taxonomy?.categories
    }

    if (!data?.edges.length) {
      return nestedCategoryList
    }

    hasNextPage = data.pageInfo.hasNextPage

    if (hasNextPage && data.edges.length) {
      const lastNode = data.edges.at(-1)
      cursor = lastNode?.cursor || null
    }

    const nestedCategories = data.edges

    for (const { node } of nestedCategories) {
      if (node.isLeaf) {
        nestedCategoryList[node.name] = node.id
      }
    }
  } while (hasNextPage)

  return nestedCategoryList
}

// ** Fetch Shopify product categories
export const fetchProductCategories = createAppAsyncThunk(
  'products/getShopifyProductCategories',
  async (_, { getState }) => {
    const { products } = getState()
    const categories: ProductCategories = {}

    if (products.categories) {
      return products.categories
    }

    const { data } = await shopifyAdminFetch({
      query: fetchProductCategoriesTopLevel()
    })

    if (data?.taxonomy?.categories?.edges.length) {
      const categoryList = await data.taxonomy.categories.edges.reduce(
        async (
          categoriesAccumulatorPromise: Promise<ProductCategories>,
          category: ShopifyCategory
        ): Promise<ProductCategories> => {
          let categories = await categoriesAccumulatorPromise
          // TODO
          if (!category.node.childrenIds.length) {
            categories[category.node.name] = category.node.id
          } else {
            const nestedCategories = await fetchProductCategoriesNestedLevels(category)

            categories = {
              ...categories,
              ...nestedCategories
            }
          }

          return categories
        },
        Promise.resolve(categories)
      )

      uploadShopifyCategories(categoryList)

      return categoryList
    }

    return null
  }
)

type ProductsState = {
  data: {
    client: ProductType[]
    shopify: ShopifyProduct[]
  }
  categories: ProductCategories | null
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
  categories: null,
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
    builder.addCase(fetchProductCategories.pending, state => {
      state.status.shopify = REQUEST_STATUTES.PENDING
    })
    builder.addCase(fetchProductCategories.fulfilled, (state, action) => {
      state.categories = action.payload as ProductCategories
      state.status.shopify = REQUEST_STATUTES.RESOLVED
    })
    builder.addCase(fetchProductCategories.rejected, (state, action) => {
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
export const selectShopifyProductsStatus = (state: RootState) => state.products.status.shopify
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

// export const { formatProducts } = productsSlice.actions

export default productsSlice.reducer
