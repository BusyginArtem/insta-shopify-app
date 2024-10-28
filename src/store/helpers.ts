// ** Types
import { GenerateContentRequest, InlineDataPart, TextPart } from 'firebase/vertexai-preview'
import { GeneratedContent, StorageFileStructure, ProductType, PostContent } from 'src/types'

// ** Hooks
import useFirebaseVertexAI from 'src/hooks/useFirebaseVertexAI'

export const extractProductId = (id: string) => {
  const startIdIdx = id.lastIndexOf('/')

  return id.slice(startIdIdx + 1)
}

// const isValidJSON = (string: string) => {
//   try {
//     return JSON.parse(string)
//   } catch (e) {
//     return false
//   }
// }

export const processProductsByVertexAI = async (
  products: ProductType[],
  //                 ^?
  categories: StorageFileStructure,
  collections: StorageFileStructure
) => {
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
      text: `This is categories in JSON format ${JSON.stringify(categories)}`
    },
    {
      text: `This is collections in JSON format ${JSON.stringify(collections)}`
    },
    {
      text: `I provided you with images of products, categories in JSON stringified format and collections in JSON stringified format.
        One image - one product.
        Only to start for each image you need to focus and understood what product on the image.
        Identify and send me a title, description, meta title, meta description for each product on the image for publishing this product on my online store.
        Keys for product object: title, description, meta_title, meta_description, category, collection.
        When you identified title, description, meta title,
        meta description for each product you need to do next actions base on image, title and description that you have.
        In the first part before this text I attached categories of products in JSON format where key is ID of category and value is name.
        In the second part before this text I attached collections of products in JSON format where key is ID of collection and value is name.
        I need to add this product to right category and collection that I have in my online store.
        Provide me with valid json array format without any other data for each product and save product's order that I sent. Don't ask me any additional questions.
        If you can't identify any field for image send empty object.
        If you can identify title and description but can't identify one or more fields leave unidentified fields as empty strings.`
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
  let parsedContent: GeneratedContent | PostContent = []
  // console.log('%c result.response.candidates', 'color: green; font-weight: bold;', result.response.candidates)
  if (result.response.candidates?.length) {
    const text = result.response.candidates[0].content.parts[0].text!
    // if (text && isValidJSON(text)) {
    parsedContent = JSON.parse(text.replace('```json', '').replace('```', ''))
    // }
  }

  // console.log('%c parsedContent', 'color: green; font-weight: bold;', parsedContent)

  processedProducts = processedProducts.map((product, idx) => {
    let { thumbnailBase64, ...processedProduct } = product
    // console.log('%c processedProduct', 'color: green; font-weight: bold;', processedProduct)

    if (Array.isArray(parsedContent) && parsedContent.length) {
      // console.log('%c parsedContent[idx]', 'color: green; font-weight: bold;', parsedContent[idx])
      return {
        ...processedProduct,
        title: parsedContent[idx].title || processedProduct.title,
        description: parsedContent[idx].description || processedProduct.description,
        category: parsedContent[idx].category || '',
        collection: parsedContent[idx].collection || '',
        metaTitle: parsedContent[idx].meta_title || processedProduct.metaTitle,
        metaDescription: parsedContent[idx].meta_description || processedProduct.metaDescription
      }
    }

    if (!Array.isArray(parsedContent)) {
      return {
        ...processedProduct,
        title: parsedContent.title || processedProduct.title,
        description: parsedContent.description || processedProduct.description,
        category: parsedContent.category || '',
        collection: parsedContent.collection || '',
        metaTitle: parsedContent.meta_title || processedProduct.metaTitle,
        metaDescription: parsedContent.meta_description || processedProduct.metaDescription
      }
    }

    return {
      ...processedProduct,
      title: processedProduct.title,
      description: processedProduct.description,
      category: '',
      collection: '',
      metaTitle: processedProduct.metaTitle,
      metaDescription: processedProduct.metaDescription
    }
  })

  return processedProducts
}
