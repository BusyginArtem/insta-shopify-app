// ** Types
import { GenerateContentRequest, InlineDataPart, TextPart } from 'firebase/vertexai-preview'
import { GeneratedContent, ProductCategories, ProductType } from 'src/types'

// ** Hooks
import useFirebaseVertexAI from 'src/hooks/useFirebaseVertexAI'

export const extractProductId = (id: string) => {
  const startIdIdx = id.lastIndexOf('/')

  return id.slice(startIdIdx + 1)
}

export const processProductsByVertexAI = async (products: ProductType[], categories: ProductCategories) => {
  let processedProducts = products
  const vertex = useFirebaseVertexAI()

  const parts: (InlineDataPart | TextPart)[] = [
    ...processedProducts.map(product => ({
      inlineData: {
        data: product.thumbnailBase64 as string,
        mimeType: 'image/jpeg'
      }
    })),
    {
      text: `
              I provide you with images of products. For each image you need to focus and understood what product on the image. Write me a title, description, meta title,
              meta description and category for each product for publishing this product on my online store.
              Choose mo relevant category from list that I provide.
              Provide me with valid json array format without any other data for each product and save product's order that I sent.
            `
    }
  ]

  const requestToVertexAI = {
    contents: [
      {
        role: 'user',
        parts
      }
    ]
  }

  const result = await vertex.model.generateContent(requestToVertexAI as GenerateContentRequest)
  let parsedContent: GeneratedContent = []

  if (result.response.candidates?.length) {
    parsedContent = JSON.parse(
      result.response.candidates[0].content.parts[0].text?.replace('```json', '').replace('```', '')!
    )
  }

  processedProducts = processedProducts.map((product, idx) => {
    let { thumbnailBase64, ...processedProduct } = product

    return {
      ...processedProduct,
      title: parsedContent[idx].title || processedProduct.title,
      description: parsedContent[idx].description || processedProduct.description,
      category: parsedContent[idx].category || processedProduct.category,
      metaTitle: parsedContent[idx].meta_title || processedProduct.metaTitle,
      metaDescription: parsedContent[idx].meta_description || processedProduct.metaDescription
    }
  })

  return processedProducts
}
