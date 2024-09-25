// ** Types
import type { ProductType } from 'src/types'
import type { Service } from './types'

interface IProductDBAdapter {
  getProductList: ({ shopId }: { shopId: string }) => Promise<ProductType[]>
  saveProducts: (products: ProductType[]) => Promise<void>
  getProductCount: ({ shopId }: { shopId: string }) => Promise<number>
  clearProductsDB: () => Promise<void>
  checkProductExistence: ({ instagramId }: { instagramId: string }) => Promise<boolean>
  productService: Service
}

class ProductDBAdapter implements IProductDBAdapter {
  public productService: Service

  constructor(productService: Service) {
    this.productService = productService
  }

  async getProductList({ shopId }: { shopId: string }): Promise<ProductType[]> {
    if (this.productService.getAllByShopId) {
      return await this.productService.getAllByShopId({ shopId })
    }

    return []
  }

  async saveProducts(products: ProductType[]) {
    await this.productService.save(products)
  }

  async getProductCount({ shopId }: { shopId: string }): Promise<number> {
    if (this.productService.getCount) {
      return await this.productService.getCount({ shopId })
    }

    return 0
  }

  async clearProductsDB(): Promise<void> {
    if (this.productService.clear) {
      await this.productService.clear()
    }
  }

  async checkProductExistence({ instagramId }: { instagramId: string }): Promise<boolean> {
    if (this.productService.isStored) {
      return await this.productService.isStored({ instagramId })
    }

    return false
  }
}

export default ProductDBAdapter
