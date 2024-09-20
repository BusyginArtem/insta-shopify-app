import type { User } from '@firebase/auth'
import type { InstagramAccountType, Shop, SignInPayloadType } from '../../types'

export enum ActionTypes {
  SIGN_IN = 'SIGN_IN',
  SIGN_IN_SUCCESS = 'SIGN_IN_SUCCESS',
  SIGN_IN_FAILURE = 'SIGN_IN_FAILURE',
  SIGN_OUT = 'SIGN_OUT',
  SIGN_OUT_SUCCESS = 'SIGN_OUT_SUCCESS',
  SIGN_OUT_FAILURE = 'SIGN_OUT_FAILURE',

  //
  STORE_INSTAGRAM_ACCOUNT = 'STORE_INSTAGRAM_ACCOUNT',
  STORE_USER_ACCOUNT = 'STORE_USER_ACCOUNT',

  //
  STORE_SHOP_ENTITY = 'STORE_SHOP_ENTITY',
  STORE_SHOP_ENTITY_SUCCESS = 'STORE_SHOP_ENTITY_SUCCESS',
  STORE_SHOP_ENTITY_FAILURE = 'STORE_SHOP_ENTITY_FAILURE',
  // STORE_SHOP_ENTITY_PROCESSED = 'STORE_SHOP_ENTITY_PROCESSED',
  UPDATE_SHOP_ENTITY = 'UPDATE_SHOP_ENTITY'
}

type SignIn = { type: ActionTypes.SIGN_IN }
type SignInSuccess = { type: ActionTypes.SIGN_IN_SUCCESS; payload: SignInPayloadType }
type SignInFailure = { type: ActionTypes.SIGN_IN_FAILURE; payload: Error }
type SignOut = { type: ActionTypes.SIGN_OUT }
type SignOutSuccess = { type: ActionTypes.SIGN_OUT_SUCCESS }
type SignOutFailure = { type: ActionTypes.SIGN_OUT_FAILURE; payload: Error }

//
type StoreInstagramAccount = { type: ActionTypes.STORE_INSTAGRAM_ACCOUNT; payload: InstagramAccountType }
type StoreUserAccount = { type: ActionTypes.STORE_USER_ACCOUNT; payload: User }

//
type StoreShopEntity = { type: ActionTypes.STORE_SHOP_ENTITY }
type StoreShopEntitySuccess = { type: ActionTypes.STORE_SHOP_ENTITY_SUCCESS; payload: Shop }
type StoreShopEntityFailure = { type: ActionTypes.STORE_SHOP_ENTITY_FAILURE; payload: Error }
type UpdateShopEntity = { type: ActionTypes.UPDATE_SHOP_ENTITY; payload: Shop }

export type Actions =
  | SignIn
  | SignInSuccess
  | SignInFailure
  | SignOut
  | SignOutSuccess
  | SignOutFailure
  | StoreInstagramAccount
  | StoreUserAccount
  | StoreShopEntity
  | StoreShopEntitySuccess
  | StoreShopEntityFailure
  | UpdateShopEntity
