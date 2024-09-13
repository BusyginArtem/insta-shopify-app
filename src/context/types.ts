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
  id: string
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
  setup: () => void
  onLogout: () => void
  onLogin: () => void
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
}
