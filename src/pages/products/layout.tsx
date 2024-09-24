// ** React Imports
import { ReactNode, useEffect } from 'react'

// ** Third Party Components
import toast from 'react-hot-toast'

// ** Hooks
import useAuth from 'src/hooks/useAuth'

// ** Store
import { useAppDispatch, useTypedSelector } from 'src/store'
import { fetchDBProducts, fetchShopifyProducts, selectProductsError } from 'src/store/products'

type Props = {
  children: ReactNode
}

export default function ProductsLayout({ children }: Props) {
  // ** Hooks
  const auth = useAuth()
  const dispatch = useAppDispatch()

  const error = useTypedSelector(selectProductsError)

  useEffect(() => {
    if (auth.shop?.id) {
      const dbPromise = dispatch(fetchDBProducts({ shopId: auth.shop.id }))
      const shopifyPromise = dispatch(fetchShopifyProducts())

      return () => {
        dbPromise.abort()
        shopifyPromise.abort()
      }
    }
  }, [auth.shop?.id])

  useEffect(() => {
    if (error?.message) {
      toast.error(error.message)
    }
  }, [error?.message])

  return <>{children}</>
}
