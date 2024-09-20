import { useContext } from 'react'
import { ProductAdapterContext } from 'src/context/ProductAdapterContext'

const useProductDBAdapter = () => {
  const context = useContext(ProductAdapterContext)

  if (!context) throw new Error('Product context must be use inside Provider')

  return context
}

export default useProductDBAdapter
