// import { GenerativeModel, VertexAI } from 'firebase/vertexai-preview'
// import type { IFacebookService } from 'src/services/facebook'

// ** Types
import { InstagramPostType, ProductType, Shop } from 'src/types'

export interface Service {
  getAllByShopId: ({ shopId }: { shopId: string }) => Promise<ProductType[]>
  save: (products: ProductType[]) => Promise<void>
  getCount: ({ shopId }: { shopId: string }) => Promise<number>
  edit: (product: ProductType) => Promise<void>
  clear?: () => Promise<void>
  isStored: ({ instagramId }: { instagramId: string }) => Promise<boolean>
}

export type FormatProductsType = {
  shop: Shop
  posts: InstagramPostType[]
  userId: string
}

export type SaveDBProductsType = {
  shop: Shop
  instagramAccountId: string
  userId: string
  facebookAccessToken: string
}
