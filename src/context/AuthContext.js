// ** React Imports
import { createContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import { FacebookAuthProvider, onAuthStateChanged, signInWithCredential, signInWithPopup } from '@firebase/auth'

// ** Config
// import authConfig from 'src/configs/auth'
import useFirebaseAuth from 'src/hooks/useFirebaseAuth'
import useFirebaseFirestore from 'src/hooks/useFirebaseFirestore'
import { doc, getDoc, setDoc } from '@firebase/firestore'
// import useFacebook from 'src/hooks/useFacebook'

const COLLECTION_SHOPS = 'shops'
// const COLLLECTION_PRODUCTS = 'products'

// ** Defaults
const defaultProvider = {
  facebookAccessToken: null,
  shop: null,
  user: null,
  selectedInstagramAccount: null,
  setSelectedInstagramAccount: () => Promise.resolve(),
  setup: () => Promise.resolve(),
  loading: true,
  setUser: () => null,
  setShop: () => null,
  getShop: () => null,
  setLoading: () => Boolean,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve()
}
const AuthContext = createContext(defaultProvider)

const AuthProvider = ({ children }) => {
  // ** States
  const [user, setUser] = useState(defaultProvider.user)
  const [shop, setShop] = useState(defaultProvider.shop)
  const [selectedInstagramAccount, setSelectedInstagramAccount] = useState(defaultProvider.selectedInstagramAccount)
  const [loading, setLoading] = useState(defaultProvider.loading)
  const [facebookAccessToken, setFacebookAccessToken] = useState(defaultProvider.facebookAccessToken)

  // ** Hooks
  const router = useRouter()
  const firebaseAuth = useFirebaseAuth()
  const firestore = useFirebaseFirestore()

  const createShop = async data => {
    const shop = await setDoc(doc(firestore, COLLECTION_SHOPS, selectedInstagramAccount.id.toString()), data)

    return shop
  }

  const getShopByUserId = async () => {
    const shop = await getShop(selectedInstagramAccount.id.toString())

    return shop || null
  }

  const getShop = async shopId => {
    const shop = await getDoc(doc(firestore, COLLECTION_SHOPS, shopId))

    return shop.exists() ? { id: shop.id, ...shop.data() } : null
  }

  const updateShop = async (shopId, data) => {
    const shopsRef = doc(firestore, COLLECTION_SHOPS, shopId)
    const shop = await setDoc(shopsRef, data, { merge: true })

    return shop
  }

  useEffect(() => {
    if (user) {
      const instagramAccount = window.localStorage.getItem('instagramAccount')
      if (instagramAccount) {
        setSelectedInstagramAccount(JSON.parse(instagramAccount))
      } else {
        setLoading(false)
        router.replace('/instagram-account')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  useEffect(() => {
    if (selectedInstagramAccount && user) {
      setLoading(true)

      getShopByUserId()
        .then(async userShop => {
          if (userShop) {
            setShop(userShop)
            // TODO ask Bohdan about this replace method
            // router.replace('/')
          } else {
            router.replace('/instagram-account/setup')
          }
        })
        .catch(err => {
          console.log(err)
          toast.error(`Authorization failed`)
        })
        .finally(() => {
          setLoading(false)
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedInstagramAccount])

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true)

      const accessToken = window.localStorage.getItem('accessToken')

      if (accessToken) {
        signInWithCredential(firebaseAuth.auth, FacebookAuthProvider.credential(accessToken))
          .then(async result => {
            const credential = FacebookAuthProvider.credentialFromResult(result)
            setFacebookAccessToken(credential.accessToken)
            setUser(result.user)

            window.localStorage.setItem('accessToken', credential.accessToken)
            setLoading(false)
          })
          .catch(err => {
            console.error(err)
            window.localStorage.removeItem('accessToken')
            setLoading(false)
          })
      } else {
        setLoading(false)
      }
    }

    initAuth()

    onAuthStateChanged(firebaseAuth.auth, firebaseUser => {
      if (!firebaseUser) {
        setUser(firebaseUser)
        console.log('onAuthStateChanged', firebaseUser)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSetUp = async (data, callback) => {
    let shop = await getShop(selectedInstagramAccount.id.toString())

    if (!shop.exists()) {
      await createShop({
        ownerId: user.uid,
        shopName: data.shopName,
        shopDescription: data.shopDescription,
        shopEmail: data.email,
        shopLogo: selectedInstagramAccount.profile_picture_url,
        shopInstagramId: selectedInstagramAccount.id,
        shopInstagramUsername: selectedInstagramAccount.username,
        initialProductsSyncStatus: 0,
        productsScheduleSyncStatus: 0,
        shopDomain: null,
        shopCustomDomain: null,
        initialShopDeployStatus: 0,
        scheduleShopDeployStatus: 0
      })

      shop = await getShop(selectedInstagramAccount.id.toString())
    }

    setShop(shop)

    await callback(shop)
    await updateShop(shop.id, {
      initialProductsSyncStatus: true
    })

    shop = await getShop(selectedInstagramAccount.id.toString())

    setShop(shop)

    router.replace('/')
  }

  const handleLogin = () => {
    signInWithPopup(firebaseAuth.auth, firebaseAuth.fbProvider)
      .then(async result => {
        const credential = FacebookAuthProvider.credentialFromResult(result)
        const accessToken = credential.accessToken

        setUser(result.user)
        setFacebookAccessToken(accessToken)
        window.localStorage.setItem('accessToken', accessToken)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        toast.error(`Authorization failed`)
        setLoading(false)
      })
  }

  const handleSetSelectedInstagramAccount = account => {
    window.localStorage.setItem('instagramAccount', JSON.stringify(account))
    setSelectedInstagramAccount(account)
  }

  const handleLogout = () => {
    setUser(null)
    setFacebookAccessToken(null)
    setSelectedInstagramAccount(null)
    window.localStorage.removeItem('accessToken')
    window.localStorage.removeItem('instagramAccount')
    router.push('/login')
  }

  const getAuthShop = () => {
    return shop
  }

  const values = {
    facebookAccessToken,
    selectedInstagramAccount,
    setSelectedInstagramAccount: handleSetSelectedInstagramAccount,
    user,
    shop,
    getShop: getAuthShop,
    setShop,
    loading,
    setUser,
    setLoading,
    login: handleLogin,
    logout: handleLogout,
    setup: handleSetUp
  }

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthProvider }
