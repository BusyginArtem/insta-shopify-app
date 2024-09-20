import { Actions, ActionTypes } from './actionTypes'
import type { AuthValuesType } from '../../types'

const productReducer = (state: AuthValuesType, action: Actions) => {
  // console.groupCollapsed(action.type)
  // console.log('%c state', 'color: green; font-weight: bold;', state)
  // console.log('%c action', 'color: green; font-weight: bold;', action)
  // console.groupEnd()

  switch (action.type) {
    case ActionTypes.SIGN_IN:
      return {
        ...state,
        loading: true,
        error: null
      }

    default:
      return state
  }
}

export default productReducer
