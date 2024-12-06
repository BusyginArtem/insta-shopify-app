// ** Types
import type { InstagramPostId, ProductType, ProductTypeWithoutId, ShopId } from 'src/types'
import type { Service } from './types'

interface IProductDBAdapter {
  getProductList: ({ shopId }: { shopId: ShopId }) => Promise<ProductType[]>
  saveProducts: (products: ProductType[]) => Promise<void>
  editProducts: (products: ProductType[]) => Promise<void>
  getProductCount: ({ shopId }: { shopId: ShopId }) => Promise<number>
  clearProductsDB: () => Promise<void>
  checkProductExistence: ({ instagramId }: { instagramId: InstagramPostId }) => Promise<boolean>
  productService: Service
}

class ProductDBAdapter implements IProductDBAdapter {
  public productService: Service

  constructor(productService: Service) {
    this.productService = productService
  }

  async getProductList({ shopId }: { shopId: ShopId }): Promise<ProductType[]> {
    if (this.productService.getAllByShopId) {
      return await this.productService.getAllByShopId({ shopId })
    }

    return []
  }

  async saveProducts(products: ProductTypeWithoutId[]) {
    await this.productService.save(products)
  }

  async editProducts(products: ProductType[]) {
    await Promise.all(
      products.map(async product => {
        return await this.productService.edit(product)
      })
    )
  }

  async getProductCount({ shopId }: { shopId: ShopId }): Promise<number> {
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

  async checkProductExistence({ instagramId }: { instagramId: InstagramPostId }): Promise<boolean> {
    if (this.productService.isStored) {
      return await this.productService.isStored({ instagramId })
    }

    return false
  }
}

export default ProductDBAdapter
