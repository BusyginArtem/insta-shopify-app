// ** React Imports
import { ReactNode, useEffect } from 'react'

// ** Third Party Components
import toast from 'react-hot-toast'

// ** Hooks
import useAuth from 'src/hooks/useAuth'

// ** Store
import { useAppDispatch, useTypedSelector } from 'src/store'
import {
  fetchDBProducts,
  fetchProductCategories,
  fetchShopifyInstagramProducts,
  selectProductsError
} from 'src/store/products'

type Props = {
  children: ReactNode
}

export default function ProductsLayout({ children }: Props) {
  // ** Hooks
  const auth = useAuth()
  const dispatch = useAppDispatch()

  const error = useTypedSelector(selectProductsError)

  useEffect(() => {
    let dbPromise: any = null
    let shopifyPromise: any = null

    if (auth.shop?.id) {
      dbPromise = dispatch(fetchDBProducts({ shopId: auth.shop.id }))
      shopifyPromise = dispatch(fetchShopifyInstagramProducts())
    }

    return () => {
      if (auth.shop?.id) {
        dbPromise?.abort()
        shopifyPromise?.abort()
      }
    }
  }, [auth.shop?.id])

  useEffect(() => {
    if (error?.message) {
      console.log('%c [ERROR]:', 'color: red; font-weight: bold;', error)
      toast.error(error.message)
    }
  }, [error?.message])

  return <>{children}</>
}
