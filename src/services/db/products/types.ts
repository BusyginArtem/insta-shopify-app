// import { GenerativeModel, VertexAI } from 'firebase/vertexai-preview'
// import type { IFacebookService } from 'src/services/facebook'

// ** Types
import { ProductType } from 'src/types'

export interface Service {
  getProducts: ({ shopId }: { shopId: string }) => Promise<ProductType[]>
  saveProducts: (products: ProductType[]) => Promise<void>
  // facebook: IFacebookService
  // vertex: {
  //   vertexAI: VertexAI
  //   model: GenerativeModel
  // }
}
