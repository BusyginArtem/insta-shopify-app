// import { GenerativeModel, VertexAI } from 'firebase/vertexai-preview'
// import type { IFacebookService } from 'src/services/facebook'

// ** Types
import {
  InstagramAccountId,
  InstagramPostId,
  InstagramPostType,
  ProductType,
  ProductTypeWithoutId,
  Shop,
  ShopId,
  UserId
} from 'src/types'

export interface Service {
  getAllByShopId: ({ shopId }: { shopId: ShopId }) => Promise<ProductType[]>
  save: (products: ProductTypeWithoutId[]) => Promise<void>
  getCount: ({ shopId }: { shopId: ShopId }) => Promise<number>
  edit: (product: ProductType) => Promise<void>
  clear?: () => Promise<void>
  isStored: ({ instagramId }: { instagramId: InstagramPostId }) => Promise<boolean>
}

export type FormatProductsType = {
  shop: Shop
  posts: InstagramPostType[]
  userId: UserId
}

export type SaveDBProductsType = {
  shop: Shop
  instagramAccountId: InstagramAccountId
  userId: UserId
  facebookAccessToken: string
}
