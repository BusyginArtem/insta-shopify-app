// ** React Imports
import { createContext, useEffect, ReactNode, useReducer } from 'react'

// ** Third party imports
import { v4 } from 'uuid'
import {
  FacebookAuthProvider,
  OAuthCredential,
  UserCredential,
  onAuthStateChanged,
  signInWithCredential,
  signInWithPopup,
  signOut
} from '@firebase/auth'
import { getDoc, setDoc, doc, addDoc, collection, Timestamp } from '@firebase/firestore'
import { getDownloadURL, ref, uploadString } from '@firebase/storage'
import { User } from '@firebase/auth'

import toast from 'react-hot-toast'

// ** Next Import
import { useRouter } from 'next/router'

// ** Hooks
import useFirebaseAuth from 'src/hooks/useFirebaseAuth'
import useFirebaseFirestore from 'src/hooks/useFirebaseFirestore'
import useFacebook from 'src/hooks/useFacebook'
import useFirebaseVertexAI from 'src/hooks/useFirebaseVertexAI'
import useFirebaseStorage from 'src/hooks/useFirebaseStorage'

// ** Config
import authConfig from 'src/configs/auth'

// ** Types & Reducer
import type {
  Shop,
  ProductType,
  AuthValuesType,
  InstagramPostType,
  InstagramAccountType,
  InstagramSetupFormValues,
  GeneratedContent
} from '../../types'
import productReducer from './reducer'
import { ActionTypes } from './actionTypes'

// ** Constants
import { APP_ROUTES } from 'src/configs/constants'
import { GenerateContentRequest, InlineDataPart, Part, TextPart } from 'firebase/vertexai-preview'

const COLLECTION_PRODUCTS = 'products'
const STORAGE_PRODUCTS = 'products'

// ** Defaults
const initialState = {
  data: []
}

type Props = {
  children: ReactNode
}

const ProductAdapterContext = createContext(initialState)

const ProductAdapterProvider = ({ children }: Props) => {
  const [state, dispatch] = useReducer(productReducer, initialState)

  const values = {
    ...state
  }

  return <ProductAdapterContext.Provider value={values}>{children}</ProductAdapterContext.Provider>
}

export { ProductAdapterContext, ProductAdapterProvider }
