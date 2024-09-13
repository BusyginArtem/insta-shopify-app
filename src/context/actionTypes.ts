import type { User } from '@firebase/auth'
import type { InstagramAccountType, Shop, SignInPayloadType } from './types'

export enum ActionTypes {
  SIGN_IN = 'SIGN_IN',
  SIGN_IN_SUCCESS = 'SIGN_IN_SUCCESS',
  SIGN_IN_FAILURE = 'SIGN_IN_FAILURE',
  LOGOUT = 'LOGOUT',
  STORE_INSTAGRAM_ACCOUNT = 'STORE_INSTAGRAM_ACCOUNT',
  STORE_USER_ACCOUNT = 'STORE_USER_ACCOUNT',
  STORE_SHOP_ENTITY = 'STORE_SHOP_ENTITY',
  STORE_SHOP_ENTITY_SUCCESS = 'STORE_SHOP_ENTITY_SUCCESS',
  STORE_SHOP_ENTITY_FAILURE = 'STORE_SHOP_ENTITY_FAILURE',
  STORE_SHOP_ENTITY_PROCESSED = 'STORE_SHOP_ENTITY_PROCESSED'
}

type SignIn = { type: ActionTypes.SIGN_IN }
type SignInSuccess = { type: ActionTypes.SIGN_IN_SUCCESS; payload: SignInPayloadType }
type SignInFailure = { type: ActionTypes.SIGN_IN_FAILURE; payload: Error }
type Logout = { type: ActionTypes.LOGOUT }

type DeleteUser = { type: ActionTypes.SIGN_IN_FAILURE }

//
type StoreInstagramAccount = { type: ActionTypes.STORE_INSTAGRAM_ACCOUNT; payload: InstagramAccountType }
type StoreUserAccount = { type: ActionTypes.STORE_USER_ACCOUNT; payload: User }

type StoreShopEntity = { type: ActionTypes.STORE_SHOP_ENTITY }
type StoreShopEntitySuccess = { type: ActionTypes.STORE_SHOP_ENTITY_SUCCESS; payload: Shop }
type StoreShopEntityFailure = { type: ActionTypes.STORE_SHOP_ENTITY_FAILURE; payload: Error }
type StoreShopEntityProcessed = { type: ActionTypes.STORE_SHOP_ENTITY_PROCESSED }

export type Actions =
  | SignIn
  | SignInSuccess
  | SignInFailure
  | Logout
  | StoreInstagramAccount
  | StoreUserAccount
  | StoreShopEntity
  | StoreShopEntitySuccess
  | StoreShopEntityFailure
  | StoreShopEntityProcessed
