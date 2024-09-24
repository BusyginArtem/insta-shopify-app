// ** React Imports
import { createContext, useEffect, ReactNode, useReducer } from 'react'

// ** Third party imports
// import { v4 } from 'uuid'
import {
  signOut,
  UserCredential,
  signInWithPopup,
  OAuthCredential,
  onAuthStateChanged,
  signInWithCredential,
  FacebookAuthProvider
} from '@firebase/auth'
import { getDoc, setDoc, doc } from '@firebase/firestore'

import toast from 'react-hot-toast'

// ** Next Import
import { useRouter } from 'next/router'

// ** Hooks
import useFirebaseAuth from 'src/hooks/useFirebaseAuth'
import useFirebaseFirestore from 'src/hooks/useFirebaseFirestore'

// ** Config
import authConfig from 'src/configs/auth'

// ** Types & Reducer
import type { Shop, AuthValuesType, InstagramAccountType, InstagramSetupFormValues } from '../../types'
import authReducer from './reducer'
import { ActionTypes } from './actionTypes'

// ** Constants
import { APP_ROUTES } from 'src/configs/constants'
// import { GenerateContentRequest, InlineDataPart, Part, TextPart } from 'firebase/vertexai-preview'
import { useAppDispatch } from 'src/store'

// ** Store actions
import { saveProducts } from 'src/store/products'

// ** Services
// import IndexedDBService from 'src/services/db/products/indexeddb'
// import ProductDBAdapter from 'src/services/db/products/adapter'

const COLLECTION_SHOPS = 'shops'

// ** Helpers
const isError = (err: unknown): err is Error => err instanceof Error

// const dbAdapter = new ProductDBAdapter(IndexedDBService)

// ** Defaults
const initialState: AuthValuesType = {
  shop: null,
  user: null,
  error: null,
  loading: false,
  facebookAccessToken: '',
  selectedInstagramAccount: null,
  onLogin: () => Promise.resolve(),
  onLogout: () => {},
  onSelectInstagramAccount: () => {},
  onHandleSetUp: () => Promise.resolve()
}

type Props = {
  children: ReactNode
}

const AuthContext = createContext(initialState)

const AuthProvider = ({ children }: Props) => {
  const [state, dispatch] = useReducer(authReducer, initialState)
  const appDispatch = useAppDispatch()

  // ** Hooks
  const router = useRouter()
  const firebaseAuth = useFirebaseAuth()
  const firestore = useFirebaseFirestore()
  // const facebook = useFacebook(state.facebookAccessToken)
  // const vertex = useFirebaseVertexAI()
  // const storage = useFirebaseStorage()

  // ** If the Instagram account exists store it in the context otherwise redirect to the setup Instagram account page
  useEffect(() => {
    if (state.user?.uid) {
      const instagramAccount = window.localStorage.getItem(authConfig.instagramAccountKeyName)

      if (instagramAccount) {
        dispatch({ type: ActionTypes.STORE_INSTAGRAM_ACCOUNT, payload: JSON.parse(instagramAccount) })
      } else {
        router.replace(APP_ROUTES.INSTAGRAM_ACCOUNT)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.user?.uid])

  // ** If the Instagram account is stored in the context and a user is authorized check a shop existence in Firestore and redirect to the Main page or the setup Instagram account page, in case the shop doesn't exist in the DB
  useEffect(() => {
    ;(async () => {
      if (state.selectedInstagramAccount?.id && state.user?.uid) {
        dispatch({ type: ActionTypes.STORE_SHOP_ENTITY })

        try {
          const userShop = await getShopByUserId()

          if (userShop) {
            dispatch({ type: ActionTypes.STORE_SHOP_ENTITY_SUCCESS, payload: userShop })

            // router.replace(APP_ROUTES.MAIN)
          } else {
            router.replace(APP_ROUTES.INSTAGRAM_ACCOUNT_SETUP)
          }
        } catch (error) {
          if (isError(error)) {
            dispatch({ type: ActionTypes.STORE_SHOP_ENTITY_FAILURE, payload: error })
          } else {
            console.log(error)
          }

          toast.error(`Authorization failed`)
        }
        // finally {
        //   dispatch({ type: ActionTypes.STORE_SHOP_ENTITY_PROCESSED })
        // }
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.selectedInstagramAccount?.id, state.user?.uid])

  // ** If a user has Facebook access in the localStorage they are signed in to Firestore to get access to a shop entity and store it in the context
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

  // ** Subscribe to changes in the auth state of Firestore and store the authenticated user in the context. Unsubscribe from the changes if the user is logged out.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth.auth, firebaseUser => {
      if (firebaseUser) {
        dispatch({ type: ActionTypes.STORE_USER_ACCOUNT, payload: firebaseUser })
      }
    })

    return () => {
      unsubscribe()
    }
  }, [firebaseAuth.auth])

  const handleLogin = async () => {
    dispatch({ type: ActionTypes.SIGN_IN })

    try {
      const result: UserCredential = await signInWithPopup(firebaseAuth.auth, firebaseAuth.fbProvider)
      const credential: OAuthCredential | null = FacebookAuthProvider.credentialFromResult(result)
      const accessToken = credential?.accessToken

      if (!accessToken) {
        return
      }

      dispatch({
        type: ActionTypes.SIGN_IN_SUCCESS,
        payload: { facebookAccessToken: accessToken, user: result.user }
      })

      window.localStorage.setItem(authConfig.storageTokenKeyName, accessToken)
    } catch (error) {
      if (isError(error)) {
        console.error(error)
        dispatch({ type: ActionTypes.SIGN_IN_FAILURE, payload: error })
      } else {
        console.log(error)
      }

      toast.error(`Authorization failed!`)
    }
  }

  const handleLogout = async () => {
    try {
      dispatch({ type: ActionTypes.SIGN_OUT })

      await signOut(firebaseAuth.auth)

      // window.localStorage.removeItem(authConfig.storageUserDataKeyName)
      window.localStorage.removeItem(authConfig.storageTokenKeyName)
      window.localStorage.removeItem(authConfig.instagramAccountKeyName)

      // dbAdapter.clearProductsDB()

      dispatch({ type: ActionTypes.SIGN_OUT_SUCCESS })

      router.push(APP_ROUTES.LOGIN)
    } catch (error) {
      if (isError(error)) {
        dispatch({ type: ActionTypes.SIGN_OUT_FAILURE, payload: error })
      } else {
        console.log(error)
      }

      toast.error(`Logout failed!`)
    }
  }

  const createShop = async (data: Omit<Shop, 'id'>) => {
    if (!state.selectedInstagramAccount?.id) {
      return null
    }

    const shop = await setDoc(doc(firestore, COLLECTION_SHOPS, state.selectedInstagramAccount.id.toString()), data)

    return shop
  }

  const getShop = async (shopId: string): Promise<Shop | null> => {
    const shop = await getDoc(doc(firestore, COLLECTION_SHOPS, shopId))

    if (shop.exists()) {
      const shopData = {
        ...(shop.data() as Shop),
        id: shop.id
      }

      return shopData
    }

    return null
  }

  const getShopByUserId = async () => {
    try {
      if (!state.selectedInstagramAccount?.id) {
        return null
      }

      return await getShop(state.selectedInstagramAccount.id.toString())
    } catch (error) {
      console.error('%c error', error)
    }
  }

  const updateShop = async (shopId: string, data: Partial<Shop>) => {
    const shopsRef = doc(firestore, COLLECTION_SHOPS, shopId)
    await setDoc(shopsRef, data, { merge: true })

    dispatch({
      type: ActionTypes.UPDATE_SHOP_ENTITY,
      payload: {
        ...state.shop,
        ...data
      } as Shop
    })
  }

  const handleSelectInstagramAccount = (account: InstagramAccountType) => {
    window.localStorage.setItem(authConfig.instagramAccountKeyName, JSON.stringify(account))

    dispatch({ type: ActionTypes.STORE_INSTAGRAM_ACCOUNT, payload: account })

    router.replace(APP_ROUTES.INSTAGRAM_ACCOUNT_SETUP)
  }

  // const saveProducts = async (products: ProductType[]) => {
  //   for (const product of products) {
  //     await addDoc(collection(firestore, COLLECTION_PRODUCTS), product)
  //   }
  // }

  // async function uploadImage(imageUrl: string, shopId: string) {
  //   try {
  //     const filename = `${v4()}.jpg`
  //     const productImagesRef = ref(storage, STORAGE_PRODUCTS)
  //     const productImagesShopRef = ref(productImagesRef, `${shopId}`)
  //     const productImageRef = ref(productImagesShopRef, `${filename}`)
  //     const imageBase64 = await getImageBase64(imageUrl)

  //     const productFileSnapshot = await uploadString(productImageRef, imageBase64, 'base64', {
  //       contentType: 'image/jpeg'
  //     })

  //     const productImageUrl = await getDownloadURL(productFileSnapshot.ref)

  //     return productImageUrl
  //   } catch (error) {
  //     console.log(error)

  //     return ''
  //   }
  // }

  // const formatAndStoreProducts = async (shop: Shop): Promise<string> => {
  //   if (!state.selectedInstagramAccount?.id) {
  //     return Promise.reject('Instagram account is missed!')
  //   }

  //   const shopId = shop.id

  //   try {
  //     const posts: InstagramPostType[] = await facebook.getInstagramPosts(state.selectedInstagramAccount.id.toString())
  //     let formattedProducts = posts.map(post => formatProduct(post, shopId, state.user?.uid!))

  //     formattedProducts = await Promise.all(
  //       formattedProducts.map(async formattedProduct => {
  //         if (formattedProduct.thumbnail) {
  //           formattedProduct.thumbnailBase64 = await getImageBase64(formattedProduct.thumbnail)
  //           // upload thumbnail
  //           formattedProduct.thumbnail = await uploadImage(formattedProduct.thumbnail, shopId)
  //         }

  //         if (formattedProduct.images) {
  //           formattedProduct.images = await Promise.all(
  //             formattedProduct.images.map(async image => {
  //               return await uploadImage(image, shopId)
  //             })
  //           )
  //         }

  //         return formattedProduct
  //       })
  //     )

  //     if (!formattedProducts.length) {
  //       return Promise.resolve('Instagram posts not found!')
  //     }

  //     const parts: (InlineDataPart | TextPart)[] = [
  //       ...formattedProducts.map(fp => ({
  //         inlineData: {
  //           data: fp.thumbnailBase64 as string,
  //           mimeType: 'image/jpeg'
  //         }
  //       })),
  //       {
  //         text: `
  //           I provide you with images of products. For each image you need to focus and understood what product on the image. Write me a title, description, meta title,
  //           meta description and category for each product for publishing this product on my online store.
  //           Choose mo relevant category from list that I provide.
  //           Provide me with valid json array format without any other data for each product and save product's order that I sent.
  //         `
  //       }
  //     ]

  //     const requestToVertexAI = {
  //       contents: [
  //         {
  //           role: 'user',
  //           parts
  //         }
  //       ]
  //     }

  //     const result = await vertex.model.generateContent(requestToVertexAI as GenerateContentRequest)
  //     let parsedContent: GeneratedContent = []

  //     if (result.response.candidates?.length) {
  //       parsedContent = JSON.parse(
  //         result.response.candidates[0].content.parts[0].text?.replace('```json', '').replace('```', '')!
  //       )
  //     }

  //     formattedProducts = formattedProducts.map((fp, fpIndex) => {
  //       delete fp.thumbnailBase64

  //       fp.title = parsedContent[fpIndex].title || fp.title
  //       fp.description = parsedContent[fpIndex].description || fp.description
  //       fp.category = parsedContent[fpIndex].category || fp.category
  //       fp.metaTitle = parsedContent[fpIndex].meta_title || fp.metaTitle
  //       fp.metaDescription = parsedContent[fpIndex].meta_description || fp.metaDescription

  //       return fp
  //     })

  //     await saveProducts(formattedProducts)

  //     return Promise.resolve('Success!')
  //   } catch (error) {
  //     console.log('%c error', 'color: red; font-weight: bold;', error)

  //     return Promise.reject('Something went wrong!')
  //   }
  // }

  const handleSetUp = async (data: InstagramSetupFormValues) => {
    try {
      if (!state.selectedInstagramAccount?.id || !state.user?.uid) {
        return
      }

      let shop = await getShop(state.selectedInstagramAccount.id.toString())

      if (!shop) {
        dispatch({ type: ActionTypes.STORE_SHOP_ENTITY })

        await createShop({
          ownerId: state.user?.uid || '',
          shopName: data.shopName,
          shopDescription: data.shopDescription,
          shopEmail: data.email,
          shopLogo: state.selectedInstagramAccount.profile_picture_url,
          shopInstagramId: state.selectedInstagramAccount.id,
          shopInstagramUsername: state.selectedInstagramAccount.username,
          initialProductsSyncStatus: 0,
          productsScheduleSyncStatus: 0,
          shopDomain: null,
          shopCustomDomain: null,
          initialShopDeployStatus: 0,
          scheduleShopDeployStatus: 0,
          // isVertaxEnabled: data.isVertaxEnabled
          isVertaxEnabled: false
        })

        shop = await getShop(state.selectedInstagramAccount.id.toString())
      }

      if (shop) {
        dispatch({ type: ActionTypes.STORE_SHOP_ENTITY_SUCCESS, payload: shop })

        // await formatAndStoreProducts(shop)
        appDispatch(
          saveProducts({
            shop,
            instagramAccountId: state.selectedInstagramAccount?.id,
            userId: state.user?.uid,
            facebookAccessToken: state.facebookAccessToken
          })
        )

        await updateShop(shop.id!, {
          initialProductsSyncStatus: 0
        })
      }

      router.replace('/')
    } catch (error) {
      if (isError(error)) {
        dispatch({ type: ActionTypes.STORE_SHOP_ENTITY_FAILURE, payload: error })
      } else {
        console.log(error)
      }
    }
    // finally {
    //   dispatch({ type: ActionTypes.STORE_SHOP_ENTITY_PROCESSED })
    // }
  }

  const values = {
    ...state,
    onLogin: handleLogin,
    onLogout: handleLogout,
    onSelectInstagramAccount: handleSelectInstagramAccount,
    onHandleSetUp: handleSetUp
  }

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthProvider }
