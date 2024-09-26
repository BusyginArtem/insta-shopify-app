import { REQUEST_STATUTES } from './../configs/constants'
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'ui-nav-menu': any
    }
  }
}

import { User } from '@firebase/auth'
import { FieldValue } from '@firebase/firestore'

export type UserDataType = {
  id: number
  role: string
  email: string
  fullName: string
  username: string
  password: string
  avatar?: string | null
}

export type Shop = {
  id: string
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
  id: string
  username: string
  name: string
  ig_id: number
  biography: string
}

export type InstagramPostType = {
  id: string
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
  id?: string
  instagramId: string
  shopId: Shop['id']
  shopOwnerId: User['uid']
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
}

export type RequestStatusTypes = (typeof REQUEST_STATUTES)[keyof typeof REQUEST_STATUTES]

export type PostContent = {
  title: string
  category: string
  description: string
  meta_description: string
  meta_title: string
}

export type GeneratedContent = PostContent[]

type ShopifyEdgeMetaFieldNode = {
  node: {
    key: 'instagram_id'
    namespace: 'product_origin'
    value: 'string'
  }
}

export type ShopifyEdge = {
  cursor: string
  node: {
    id: 'string'
    metafields: {
      edges: ShopifyEdgeMetaFieldNode[]
    }
  }
}

export type ShopifyProduct = { shopifyProductId: string; instagramId: string }
