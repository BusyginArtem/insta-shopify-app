// ** Types
import type { ProductType } from 'src/types'
import type { Service } from './types'

interface IProductDBAdapter {
  getProductList: ({ shopId }: { shopId: string }) => Promise<ProductType[]>
  saveProducts: (products: ProductType[]) => Promise<void>
  getProductCount: ({ shopId }: { shopId: string }) => Promise<number>
  clearProductsDB: () => Promise<void>
  productService: Service
}

class ProductDBAdapter implements IProductDBAdapter {
  public productService: Service

  constructor(productService: Service) {
    this.productService = productService
  }

  async getProductList({ shopId }: { shopId: string }): Promise<ProductType[]> {
    return await this.productService.getAllByShopId({ shopId })
  }

  async saveProducts(products: ProductType[]) {
    await this.productService.save(products)
  }

  async getProductCount({ shopId }: { shopId: string }): Promise<number> {
    return await this.productService.getCount({ shopId })
  }

  async clearProductsDB(): Promise<void> {
    if (this.productService.clear) {
      await this.productService.clear()
    }
  }
}

export default ProductDBAdapter
