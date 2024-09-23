// import { GenerativeModel, VertexAI } from 'firebase/vertexai-preview'
// import type { IFacebookService } from 'src/services/facebook'

// ** Types
import { ProductType, Shop } from 'src/types'

export interface Service {
  getAll: ({ shopId }: { shopId: string }) => Promise<ProductType[]>
  save: (products: ProductType[]) => Promise<void>
  getCount: ({ shopId }: { shopId: string }) => Promise<number>
  edit: (key: string, product: ProductType) => Promise<void>
}

export type FormatProductsType = {
  shop: Shop
  instagramAccountId: string
  userId: string
  facebookAccessToken: string
}
