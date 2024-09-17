// export type ErrCallbackType = (err: { [key: string]: string }) => void
// TODO update
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'ui-nav-menu': any
    }
  }
}

import { User } from '@firebase/auth'
import { Timestamp } from '@firebase/firestore'

// TODO remove
export type UserDataType = {
  id: number
  role: string
  email: string
  fullName: string
  username: string
  password: string
  avatar?: string | null
}

// TODO update
export type Shop = {
  id?: string
  ownerId: string
  shopName: string
  shopDescription: string
  shopEmail: string
  shopLogo: string
  shopInstagramId: string
  shopInstagramUsername: string
  initialProductsSyncStatus: boolean
  productsScheduleSyncStatus: number
  shopDomain: string | null
  shopCustomDomain: string | null
  initialShopDeployStatus: number
  scheduleShopDeployStatus: number
}

export type AuthValuesType = {
  facebookAccessToken: string
  shop: Shop | null
  selectedInstagramAccount: InstagramAccountType | null
  loading: boolean
  user: User | null
  error: Error | null
  // setLoading: (value: boolean) => void
  // setUser: (value: UserDataType | null) => void
  // login: (params: LoginParams, errorCallback?: ErrCallbackType) => void
  onHandleSetUp: (data: InstagramSetupFormValues, callback: (shop: Shop) => Promise<void>) => Promise<void>
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
}

export type ProductType = {
  instagramId: string
  shopOwnerId: string
  shopId: string
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
  createdAt: Timestamp
  updatedAt: Timestamp
}
