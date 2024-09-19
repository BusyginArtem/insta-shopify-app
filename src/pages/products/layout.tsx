// ** React Imports
import { ReactNode, useEffect } from 'react'

// ** Hooks
import useAuth from 'src/hooks/useAuth'

// ** Store
import { useAppDispatch } from 'src/store'
import { fetchProducts } from 'src/store/products'

type Props = {
  children: ReactNode
}

export default function ProductsLayout({ children }: Props) {
  // ** Hooks
  const auth = useAuth()
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (auth.shop?.id) {
      dispatch(fetchProducts({ shopId: auth.shop.id }))
    }
  }, [auth.shop?.id])

  return <>{children}</>
}
