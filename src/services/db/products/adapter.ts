// ** Types
import type { ProductType } from 'src/types'
import type { Service } from './types'

interface IProductDBAdapter {
  getProductList: ({ shopId }: { shopId: string }) => Promise<ProductType[]>
  saveProducts: () => Promise<void>
  productService: Service
}

class ProductDBAdapter implements IProductDBAdapter {
  public productService: Service

  constructor(productService: Service) {
    this.productService = productService
  }

  async getProductList({ shopId }: { shopId: string }) {
    return await this.productService.getProducts({ shopId })
  }

  async saveProducts() {
    await this.productService.saveProducts([])
  }
}

export default ProductDBAdapter
