// ** React Imports
import { createContext, useEffect, ReactNode, useReducer } from 'react'

// ** Third party imports
import { FacebookAuthProvider, onAuthStateChanged, signInWithCredential, signInWithPopup } from '@firebase/auth'
import { getDoc, setDoc, doc } from '@firebase/firestore'
import toast from 'react-hot-toast'

// ** Next Import
import { useRouter } from 'next/router'

// ** Axios
import axios from 'axios'

// ** Hooks
import useFirebaseAuth from 'src/hooks/useFirebaseAuth'
import useFirebaseFirestore from 'src/hooks/useFirebaseFirestore'

// ** Config
import authConfig from 'src/configs/auth'

// ** Types & Reducer
import type { AuthValuesType, InstagramAccountType, Shop } from './types'
import authReducer from './reducer'
import { ActionTypes } from './actionTypes'

const COLLECTION_SHOPS = 'shops'

// ** Defaults
const initialState: AuthValuesType = {
  facebookAccessToken: '',
  shop: null,
  user: null,
  selectedInstagramAccount: null,
  error: null,
  // setSelectedInstagramAccount: () => Promise.resolve(),
  loading: false,
  // setUser: () => null,
  // setShop: () => null,
  // getShop: () => null,
  // setLoading: () => Boolean,
  setup: () => Promise.resolve(),
  onLogin: () => {},
  onLogout: () => {},
  onSelectInstagramAccount: () => {}
}

type Props = {
  children: ReactNode
}

const AuthContext = createContext(initialState)

const AuthProvider = ({ children }: Props) => {
  const [state, dispatch] = useReducer(authReducer, initialState)
  console.log('%c state', 'color: green; font-weight: bold;', state)

  // ** Hooks
  const router = useRouter()
  const firebaseAuth = useFirebaseAuth()
  const firestore = useFirebaseFirestore()

  useEffect(() => {
    if (state.user) {
      const instagramAccount = window.localStorage.getItem(authConfig.instagramAccountKeyName)

      if (instagramAccount) {
        // setSelectedInstagramAccount(JSON.parse(instagramAccount))
        dispatch({ type: ActionTypes.STORE_INSTAGRAM_ACCOUNT, payload: JSON.parse(instagramAccount) })
      } else {
        router.replace('/instagram-account')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.user])

  useEffect(() => {
    ;(async () => {
      if (state.selectedInstagramAccount && state.user) {
        dispatch({ type: ActionTypes.STORE_SHOP_ENTITY })

        try {
          const userShop = await getShopByUserId()
          console.log('%c userShop', 'color: green; font-weight: bold;', userShop)
          if (userShop) {
            dispatch({ type: ActionTypes.STORE_SHOP_ENTITY_SUCCESS, payload: userShop })

            router.replace('/')
          } else {
            router.replace('/instagram-account/setup')
          }
        } catch (error) {
          console.log(error)
          toast.error(`Authorization failed`)
          dispatch({ type: ActionTypes.STORE_SHOP_ENTITY_FAILURE, payload: error as Error })
        } finally {
          // setLoading(false)
          dispatch({ type: ActionTypes.STORE_SHOP_ENTITY_PROCESSED })
        }
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.selectedInstagramAccount, state.user])

  // TODO DONE
  useEffect(() => {
    ;(async () => {
      const storedAccessToken = window.localStorage.getItem(authConfig.storageTokenKeyName)

      if (storedAccessToken) {
        dispatch({ type: ActionTypes.SIGN_IN })

        signInWithCredential(firebaseAuth.auth, FacebookAuthProvider.credential(storedAccessToken))
          .then(async result => {
            const credential = FacebookAuthProvider.credentialFromResult(result)
            const accessToken = credential?.accessToken

            if (!accessToken) {
              return
            }

            dispatch({
              type: ActionTypes.SIGN_IN_SUCCESS,
              payload: { facebookAccessToken: accessToken, user: result.user }
            })

            window.localStorage.setItem(authConfig.storageTokenKeyName, accessToken)
          })
          .catch(err => {
            console.error(err)
            window.localStorage.removeItem(authConfig.storageTokenKeyName)
            dispatch({ type: ActionTypes.SIGN_IN_FAILURE, payload: err })
          })
      }
    })()
  }, [firebaseAuth.auth])
  // TODO PROCESSING
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth.auth, firebaseUser => {
      if (firebaseUser) {
        console.log('onAuthStateChanged')
        dispatch({ type: ActionTypes.STORE_USER_ACCOUNT, payload: firebaseUser })
        // console.log('onAuthStateChanged', firebaseUser)
      }
    })

    return () => {
      unsubscribe()
    }
  }, [firebaseAuth.auth])
  // TODO DONE
  const handleLogin = () => {
    dispatch({ type: ActionTypes.SIGN_IN })

    signInWithPopup(firebaseAuth.auth, firebaseAuth.fbProvider)
      .then(async result => {
        const credential = FacebookAuthProvider.credentialFromResult(result)
        const accessToken = credential?.accessToken

        if (!accessToken) {
          return
        }

        dispatch({
          type: ActionTypes.SIGN_IN_SUCCESS,
          payload: { facebookAccessToken: accessToken, user: result.user }
        })

        window.localStorage.setItem(authConfig.storageTokenKeyName, accessToken)
      })
      .catch(err => {
        console.error(err)
        toast.error(`Authorization failed`)
        dispatch({ type: ActionTypes.SIGN_IN_FAILURE, payload: err })
      })
  }
  // TODO DONE
  const handleLogout = () => {
    dispatch({ type: ActionTypes.LOGOUT })

    // window.localStorage.removeItem(authConfig.storageUserDataKeyName)
    window.localStorage.removeItem(authConfig.storageTokenKeyName)
    window.localStorage.removeItem(authConfig.instagramAccountKeyName)

    router.push('/login')
  }

  const createShop = async (data: Shop) => {
    if (!state.selectedInstagramAccount?.id) {
      return null
    }

    const shop = await setDoc(doc(firestore, COLLECTION_SHOPS, state.selectedInstagramAccount.id.toString()), data)

    return shop
  }

  const getShop = async (shopId: string) => {
    const shop = await getDoc(doc(firestore, COLLECTION_SHOPS, shopId))

    return shop.exists() ? { id: shop.id, ...shop.data() } : null
  }

  const getShopByUserId = async () => {
    try {
      if (!state.selectedInstagramAccount?.id) {
        return null
      }

      const shop = await getShop(state.selectedInstagramAccount.id.toString())
      console.log('%c shop', 'color: green; font-weight: bold;', shop)
      return shop || null
    } catch (error) {
      console.log('%c error', 'color: red; font-weight: bold;', error)
    }
  }

  const updateShop = async (shopId: string, data: Shop) => {
    const shopsRef = doc(firestore, COLLECTION_SHOPS, shopId)
    const shop = await setDoc(shopsRef, data, { merge: true })

    return shop
  }

  const handleSetSelectedInstagramAccount = (account: InstagramAccountType) => {
    window.localStorage.setItem(authConfig.instagramAccountKeyName, JSON.stringify(account))

    dispatch({ type: ActionTypes.STORE_INSTAGRAM_ACCOUNT, payload: account })
  }

  const values = {
    ...state,
    onLogin: handleLogin,
    onLogout: handleLogout,
    onSelectInstagramAccount: handleSetSelectedInstagramAccount
  }

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthProvider }
