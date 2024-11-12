// ** Third party imports
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

// ** Constants
import { REQUEST_STATUTES } from 'src/configs/constants'

// ** Types
import type {
  ShopifyEdge,
  ShopifyProduct,
  ShopifyCategory,
  StorageFileStructure,
  RequestStatusTypes,
  ProductType,
  ExtendedProductTypeByShopifyFields
} from 'src/types'
import { AppDispatch, RootState } from '.'
import type { GridRowId } from '@mui/x-data-grid'

// ** Service
import IndexedDBService from 'src/services/db/products/indexeddb'
import ProductDBAdapter from 'src/services/db/products/adapter'

// ** Helpers
import { convertObjToCSV, isError, uploadCSVFile } from 'src/services/db/products/helpers'
import shopifyAdminFetch from 'src/utils/shopifyAdminFetch'
import {
  createProduct,
  fetchCollections,
  fetchProductCategoriesNestedLevel,
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

// ** Add to Shopify shop products
export const addToShopProducts = createAppAsyncThunk(
  'products/addToShopify',
  async ({ productIds, vertexAIEnabled }: { productIds: GridRowId[]; vertexAIEnabled: boolean }, { getState }) => {
    try {
      const { products, shopify } = getState()

      let selectedProductsData = products.data.filter(product => productIds.includes(product.id as string))
      const instagramIDs: ShopifyProduct[] = []

      if (vertexAIEnabled && shopify.categories.list && shopify.collections.list) {
        selectedProductsData = await processProductsByVertexAI(
          selectedProductsData,
          shopify.categories.list,
          shopify.collections.list
        )
      }
      // console.log('%c selectedProductsData', 'color: red; font-weight: bold;', selectedProductsData)

      selectedProductsData = await Promise.all(
        selectedProductsData.map(async product => {
          const { data } = await shopifyAdminFetch({
            query: createProduct(product)
          })

          if (data.productCreate?.product?.id) {
            instagramIDs.push({
              instagramId: product.instagramId,
              shopifyProductId: extractProductId(data.productCreate.product.id),
              onlineStorePreviewUrl: data.productCreate.product.onlineStorePreviewUrl
            })
          }

          const { collection, onlineStorePreviewUrl, collectionsToJoin, ...rest } =
            product as ExtendedProductTypeByShopifyFields

          return rest
        })
      )
      // console.log('%c SAVE -----> selectedProductsData', 'color: green; font-weight: bold;', selectedProductsData)
      await dbAdapter.editProducts(selectedProductsData)

      return instagramIDs
    } catch (error) {
      console.log('%c ERROR --------->', 'color: red; font-weight: bold;', error)
    }
  }
)

const fetchProductCategoriesNestedLevels = async (category: ShopifyCategory) => {
  let nestedCategoryList: StorageFileStructure = {}

  const result = await shopifyAdminFetch({
    query: fetchProductCategoriesNestedLevel({ categoryId: category.node.id })
  })

  let data = result.data?.taxonomy?.categories

  if (!data?.edges.length) {
    return nestedCategoryList
  }

  const nestedCategories = data.edges

  for (const { node } of nestedCategories) {
    if (node.isLeaf) {
      nestedCategoryList[node.id] = node.name
    }
  }

  return nestedCategoryList
}

// ** Fetch Shopify product categories
export const fetchShopifyProductCategories = createAppAsyncThunk(
  'products/getShopifyProductCategories',
  async (_, { getState }) => {
    const { shopify } = getState()
    const categories: StorageFileStructure = {}

    if (shopify.categories.list) {
      return {
        list: shopify.categories.list
        // fileRef: shopify.categories.fileRef
      }
    }

    const { data } = await shopifyAdminFetch({
      query: fetchProductCategoriesTopLevel()
    })

    if (data?.taxonomy?.categories?.edges.length) {
      const categoryList = await data.taxonomy.categories.edges.reduce(
        async (
          categoriesAccumulatorPromise: Promise<StorageFileStructure>,
          category: ShopifyCategory
        ): Promise<StorageFileStructure> => {
          let categories = await categoriesAccumulatorPromise

          if (category.node.isLeaf) {
            categories[category.node.id] = category.node.name
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

      // const categoriesFileRef = await uploadJSONFile(categoryList, 'categories')
      // const categoriesFileRef = await uploadCSVFile({ csv: convertObjToCSV(categoryList), fileName: 'categories' })
      // console.log('%c categoriesFileRef', 'color: green; font-weight: bold;', categoriesFileRef)
      // if (categoriesFileRef) {
      return {
        list: categoryList
        // fileRef: categoriesFileRef
      }
      // }
    }

    return null
  }
)

// ** Fetch Shopify collections
export const fetchShopifyCollections = createAppAsyncThunk(
  'products/getShopifyCollections',
  async (_, { getState }) => {
    const { shopify } = getState()
    const collections: StorageFileStructure = {}

    if (shopify.collections.list) {
      return {
        list: shopify.collections.list
        // fileRef: shopify.collections.fileRef
      }
    }

    let hasNextPage: boolean = false
    let cursor: string | null = null

    do {
      const { data } = await shopifyAdminFetch({
        query: fetchCollections({ cursor })
      })

      if (!data?.collections.edges.length) {
        return collections
      }

      hasNextPage = data.collections.pageInfo.hasNextPage

      if (hasNextPage && data.collections.edges.length) {
        const lastNode = data.collections.edges.at(-1)
        cursor = lastNode?.cursor || null
      }

      for (const { node } of data.collections.edges) {
        collections[node.id] = node.title
      }
    } while (hasNextPage)

    // const collectionsFileRef = await uploadJSONFile(collections, 'collections')
    // const collectionsFileRef = await uploadCSVFile({ csv: convertObjToCSV(collections), fileName: 'collections' })
    // console.log('%c collectionsFileRef', 'color: green; font-weight: bold;', collectionsFileRef)

    // if (collectionsFileRef) {
    return {
      list: collections
      // fileRef: collectionsFileRef
    }
    // }

    return { list: null, fileRef: null }
  }
)

type ShopifyState = {
  data: ShopifyProduct[]
  // TODO remove 'list' field if it's unnecessary
  categories: {
    list: StorageFileStructure | null
    // fileRef: string | null
  }
  // TODO remove 'list' field if it's unnecessary
  collections: {
    list: StorageFileStructure | null
    // fileRef: string | null
  }
  status: RequestStatusTypes
  error: Error | null
}

const initialState: ShopifyState = {
  data: [],
  categories: {
    list: null
    // fileRef: null
  },
  collections: {
    list: null
    // fileRef: null
  },
  error: null,
  status: REQUEST_STATUTES.IDLE
}

export const shopifySlice = createSlice({
  name: 'shopify',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchShopifyInstagramProducts.pending, state => {
      state.status = REQUEST_STATUTES.PENDING
      state.error = null
    })
    builder.addCase(fetchShopifyInstagramProducts.fulfilled, (state, action) => {
      state.data = action.payload
      state.status = REQUEST_STATUTES.RESOLVED
    })
    builder.addCase(fetchShopifyInstagramProducts.rejected, (state, action) => {
      if (isError(action.error)) {
        state.error = action.error
      } else if (action.error.message) {
        state.error = Error(action.error.message)
      } else {
        state.error = Error('Something went wrong!')
      }

      state.status = REQUEST_STATUTES.REJECTED
    })
    builder.addCase(addToShopProducts.pending, state => {
      state.status = REQUEST_STATUTES.PENDING
      state.error = null
    })
    builder.addCase(addToShopProducts.fulfilled, (state, action) => {
      console.log('%c action.payload', 'color: green; font-weight: bold;', action.payload)
      state.data = [...state.data, ...(action.payload?.length ? action.payload : [])]
      state.status = REQUEST_STATUTES.RESOLVED
    })
    builder.addCase(addToShopProducts.rejected, (state, action) => {
      if (isError(action.error)) {
        state.error = action.error
      } else if (action.error.message) {
        state.error = Error(action.error.message)
      } else {
        state.error = Error('Something went wrong!')
      }

      state.status = REQUEST_STATUTES.REJECTED
    })
    builder.addCase(fetchShopifyProductCategories.pending, state => {
      state.status = REQUEST_STATUTES.PENDING
    })
    builder.addCase(fetchShopifyProductCategories.fulfilled, (state, action) => {
      state.categories.list = action.payload ? (action.payload.list as StorageFileStructure) : null
      // state.categories.fileRef = action.payload ? action.payload.fileRef : null
      state.status = REQUEST_STATUTES.RESOLVED
    })
    builder.addCase(fetchShopifyProductCategories.rejected, (state, action) => {
      if (isError(action.error)) {
        state.error = action.error
      } else if (action.error.message) {
        state.error = Error(action.error.message)
      } else {
        state.error = Error('Something went wrong!')
      }

      state.status = REQUEST_STATUTES.REJECTED
    })
    builder.addCase(fetchShopifyCollections.pending, state => {
      state.status = REQUEST_STATUTES.PENDING
    })
    builder.addCase(fetchShopifyCollections.fulfilled, (state, action) => {
      state.collections.list = action.payload ? (action.payload.list as StorageFileStructure) : null
      // state.collections.fileRef = action.payload ? action.payload.fileRef : null
      state.status = REQUEST_STATUTES.RESOLVED
    })
    builder.addCase(fetchShopifyCollections.rejected, (state, action) => {
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

export const selectShopifyProducts = (state: RootState) => state.shopify.data
export const selectShopifyProductsStatus = (state: RootState) => state.shopify.status
export const selectShopifyError = (state: RootState) => state.shopify.error

export default shopifySlice.reducer
