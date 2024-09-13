import { Actions, ActionTypes } from './actionTypes'
import type { AuthValuesType } from './types'

const authReducer = (state: AuthValuesType, action: Actions) => {
  // console.log('%c state', 'color: green; font-weight: bold;', state)
  // console.log('%c action', 'color: red; font-weight: bold;', action)
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

    case ActionTypes.LOGOUT:
      return {
        ...state,
        user: null,
        selectedInstagramAccount: null,
        facebookAccessToken: '',
        shop: null
      }

    case ActionTypes.STORE_INSTAGRAM_ACCOUNT:
      return {
        ...state,
        selectedInstagramAccount: action.payload
      }

    case ActionTypes.STORE_USER_ACCOUNT:
      return {
        ...state,
        user: action.payload
      }

    case ActionTypes.STORE_SHOP_ENTITY:
      return {
        ...state,
        loading: true
      }

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

    case ActionTypes.STORE_SHOP_ENTITY_PROCESSED:
      return {
        ...state,
        loading: false
      }

    default:
      return state
  }
}

export default authReducer
