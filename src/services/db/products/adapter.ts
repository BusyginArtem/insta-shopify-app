// ** Types
import type { ProductType } from 'src/types'
import type { Service } from './types'

interface IProductDBAdapter {
  getProductList: ({ shopId }: { shopId: string }) => Promise<ProductType[]>
  saveProducts: (products: ProductType[]) => Promise<void>
  getProductCount: ({ shopId }: { shopId: string }) => Promise<number>
  productService: Service
}

class ProductDBAdapter implements IProductDBAdapter {
  public productService: Service

  constructor(productService: Service) {
    this.productService = productService
  }

  async getProductList({ shopId }: { shopId: string }) {
    return await this.productService.getAll({ shopId })
  }

  async saveProducts(products: ProductType[]) {
    await this.productService.save(products)
  }

  async getProductCount({ shopId }: { shopId: string }): Promise<number> {
    return await this.productService.getCount({ shopId })
  }
}

export default ProductDBAdapter
