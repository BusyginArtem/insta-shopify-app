import { REQUEST_STATUTES } from './../configs/constants'

import { User } from '@firebase/auth'
import { FieldValue } from '@firebase/firestore'

declare const __brand__type__: unique symbol

type Brand<BaseType, BrandName> = BaseType & {
  readonly [__brand__type__]: BrandName
}

export type UserId = User
export type ShopId = Brand<string, 'SHOP_ID'>
export type InstagramAccountId = Brand<string, 'INSTA_ACCOUNT_ID'>
export type InstagramPostId = Brand<string, 'INSTA_POST_ID'>
export type ShopifyProductId = Brand<string, 'SHOPIFY_PRODUCT_ID'>
export type ShopifyProductNodeId = Brand<string, 'SHOPIFY_PRODUCT_NODE_ID'>
export type ShopifyCategoryNodeId = Brand<string, 'SHOPIFY_CATEGORY_NODE_ID'>

// export type UserDataType = {
//   id: UserDataId
//   role: string
//   email: string
//   fullName: string
//   username: string
//   password: string
//   avatar?: string | null
// }

export type Shop = {
  id: ShopId
  ownerId: string
  shopName: string
  shopDescription: string
  shopEmail: string
  shopLogo: string
  shopInstagramId: string
  shopInstagramUsername: string
  initialProductsSyncStatus: number
  productsScheduleSyncStatus: number
  shopDomain: string | null
  shopCustomDomain: string | null
  initialShopDeployStatus: number
  scheduleShopDeployStatus: number
  isVertaxEnabled: boolean
}

export type AuthValuesType = {
  facebookAccessToken: string
  shop: Shop | null
  selectedInstagramAccount: InstagramAccountType | null
  loading: boolean
  isReady: boolean
  user: User | null
  error: Error | null
  onHandleSetUp: (data: InstagramSetupFormValues) => Promise<void>
  onLogout: () => void
  onLogin: () => Promise<void>
  onSelectInstagramAccount: (account: InstagramAccountType) => void
}

export type SignInPayloadType = {
  facebookAccessToken: string
  user: User
}

export type InstagramAccountType = {
  profile_picture_url: string
  id: InstagramAccountId
  username: string
  name: string
  ig_id: number
  biography: string
}

export type InstagramPostType = {
  id: InstagramPostId
  caption: string
  media_url: string
  media_type: string
  thumbnail_url: string
  permalink: string
}

export type InstagramSetupFormValues = {
  shopDescription: string
  shopName: string
  email: string
  // isVertaxEnabled: boolean
}

export type ProductType = {
  id: ShopifyProductId
  instagramId: string
  shopId: Shop['id']
  shopOwnerId: UserId
  type: string | null
  status: 'draft'
  title: string | null
  description: string
  permalink: string
  metaTitle: string | null
  metaDescription: string | null
  price: string | null
  oldPrice: string | null
  color: string | null
  size: string | null
  material: string | null
  thumbnail: string | null
  images: string[]
  videoUrl: string | null
  variants: object[]
  similar: string[]
  category: string | null
  createdAt: FieldValue
  updatedAt: FieldValue
  thumbnailBase64?: string
  shopifyProductId?: ShopifyProductId
}

export type ProductTypeWithoutId = Omit<ProductType, 'id'>

export type ExtendedProductTypeByShopifyFields = ProductType & {
  collection?: string
  collectionsToJoin?: string
  onlineStorePreviewUrl?: string
}

export type RequestStatusTypes = (typeof REQUEST_STATUTES)[keyof typeof REQUEST_STATUTES]

export type PostContent = {
  title: string
  category: string
  description: string
  meta_description: string
  meta_title: string
  collection: string
}

export type GeneratedContent = PostContent[]

type ShopifyEdgeMetaFieldNode = {
  node: {
    // key: 'instagram_id'
    // namespace: 'product_origin'
    value: string
  }
}

export type ShopifyEdge = {
  // cursor: string
  node: {
    id: ShopifyProductNodeId
    onlineStorePreviewUrl: string
    metafields: {
      edges: ShopifyEdgeMetaFieldNode[]
    }
  }
}

export type ShopifyProduct = { shopifyProductId: string; instagramId: string; onlineStorePreviewUrl: string }

export type StorageFileStructure = {
  [id: string]: string
}

export type ShopifyCategory = {
  // cursor: string
  node: {
    name: string
    fullName: string
    isLeaf: boolean
    level: number
    id: ShopifyCategoryNodeId
  }
}
