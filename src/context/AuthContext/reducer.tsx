import { Actions, ActionTypes } from './actionTypes'
import type { AuthValuesType } from '../../types'

const authReducer = (state: AuthValuesType, action: Actions) => {
  console.groupCollapsed(action.type)
  console.log('%c state', 'color: green; font-weight: bold;', state)
  console.log('%c action', 'color: green; font-weight: bold;', action)
  console.groupEnd()

  switch (action.type) {
    case ActionTypes.SIGN_IN:
      return {
        ...state,
        loading: true,
        error: null
      }

    case ActionTypes.SIGN_IN_SUCCESS:
      return {
        ...state,
        facebookAccessToken: action.payload.facebookAccessToken,
        user: action.payload.user,
        loading: false
      }

    case ActionTypes.SIGN_IN_FAILURE:
      return {
        ...state,
        error: action.payload,
        loading: false
      }

    case ActionTypes.SIGN_OUT:
      return {
        ...state,
        loading: true
      }

    case ActionTypes.SIGN_OUT_SUCCESS:
      return {
        ...state,
        user: null,
        selectedInstagramAccount: null,
        facebookAccessToken: '',
        shop: null,
        loading: false
      }

    case ActionTypes.SIGN_OUT_FAILURE:
      return {
        ...state,
        error: action.payload,
        loading: false
      }

    case ActionTypes.STORE_INSTAGRAM_ACCOUNT:
      return {
        ...state,
        selectedInstagramAccount: action.payload
      }
    // TODO FIX
    case ActionTypes.STORE_USER_ACCOUNT:
      return {
        ...state,
        user: action.payload,
        isReady: true
      }

    case ActionTypes.STORE_SHOP_ENTITY:
      return state

    case ActionTypes.STORE_SHOP_ENTITY_SUCCESS:
      return {
        ...state,
        shop: action.payload
      }

    case ActionTypes.STORE_SHOP_ENTITY_FAILURE:
      return {
        ...state,
        error: action.payload
      }

    case ActionTypes.UPDATE_SHOP_ENTITY:
      return {
        ...state,
        shop: action.payload
      }

    default:
      return state
  }
}

export default authReducer
