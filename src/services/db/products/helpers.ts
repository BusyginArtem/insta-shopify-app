// ** Third party imports
import { v4 } from 'uuid'
import { serverTimestamp } from '@firebase/firestore'
import { getDownloadURL, ref, uploadString } from '@firebase/storage'

// ** Types
import type { User } from '@firebase/auth'
import type { InstagramPostType, ProductType, Shop } from 'src/types'
// import { InlineDataPart, TextPart } from 'firebase/vertexai-preview'

// ** Hooks
import useFirebaseStorage from 'src/hooks/useFirebaseStorage'
import { FormatProductsType } from './types'

const STORAGE_PRODUCTS = 'products'

const storage = useFirebaseStorage()

export async function uploadImage(imageUrl: string, shopId: string) {
  try {
    const filename = `${v4()}.jpg`
    const productImagesRef = ref(storage, STORAGE_PRODUCTS)
    const productImagesShopRef = ref(productImagesRef, `${shopId}`)
    const productImageRef = ref(productImagesShopRef, `${filename}`)
    const imageBase64 = await getImageBase64(imageUrl)

    const productFileSnapshot = await uploadString(productImageRef, imageBase64, 'base64', {
      contentType: 'image/jpeg'
    })

    const productImageUrl = await getDownloadURL(productFileSnapshot.ref)

    return productImageUrl
  } catch (error) {
    console.log(error)

    return ''
  }
}

export const getImageBase64 = async (url: string) => {
  // Fetch the image
  const response = await fetch(url)

  const arrayBuffer = await response.arrayBuffer()

  const base64String = Buffer.from(arrayBuffer).toString('base64')

  return `${base64String}`
}

export const formatProduct = (igPost: InstagramPostType, shopId: Shop['id'], shopOwnerId: User['uid']): ProductType => {
  let type = null
  let thumbnail = null
  let images: string[] = []
  let videoUrl = null

  switch (igPost.media_type) {
    case 'IMAGE':
      type = 'image'
      thumbnail = igPost.media_url
      images = [igPost.media_url]
      break

    case 'VIDEO':
      type = 'video'
      thumbnail = igPost.thumbnail_url
      images = [igPost.thumbnail_url]
      videoUrl = igPost.media_url
      break

    case 'CAROUSEL_ALBUM':
      type = 'carousel_album'
      thumbnail = igPost.media_url
      images = [igPost.media_url]
      break
  }

  return {
    instagramId: igPost.id,
    shopOwnerId,
    shopId,
    type,
    status: 'draft',
    title: null,
    description: igPost.caption || '',
    permalink: igPost.permalink,
    metaTitle: null,
    metaDescription: null,
    price: null,
    oldPrice: null,
    color: null,
    size: null,
    material: null,
    thumbnail,
    images,
    videoUrl,
    variants: [],
    similar: [],
    category: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }
}

export const formatProducts = async ({ shop, userId, posts }: FormatProductsType) => {
  const shopId = shop.id
  let formattedProducts = posts.map(post => formatProduct(post, shopId, userId))

  formattedProducts = await Promise.all(
    formattedProducts.map(async formattedProduct => {
      if (formattedProduct.thumbnail) {
        formattedProduct.thumbnailBase64 = await getImageBase64(formattedProduct.thumbnail)
        // upload thumbnail
        formattedProduct.thumbnail = await uploadImage(formattedProduct.thumbnail, shopId)
      }

      if (formattedProduct.images) {
        formattedProduct.images = await Promise.all(
          formattedProduct.images.map(async image => {
            return await uploadImage(image, shopId)
          })
        )
      }

      return formattedProduct
    })
  )

  return formattedProducts
}

// const formatAndStoreProducts = async (shop: Shop): Promise<string> => {
//   if (!state.selectedInstagramAccount?.id) {
//     return Promise.reject('Instagram account is missed!')
//   }

//   const shopId = shop.id

//   try {
//     const posts: InstagramPostType[] = await facebook.getInstagramPosts(state.selectedInstagramAccount.id.toString())
//     let formattedProducts = posts.map(post => formatProduct(post, shopId, state.user?.uid!))

//     formattedProducts = await Promise.all(
//       formattedProducts.map(async formattedProduct => {
//         if (formattedProduct.thumbnail) {
//           formattedProduct.thumbnailBase64 = await getImageBase64(formattedProduct.thumbnail)
//           // upload thumbnail
//           formattedProduct.thumbnail = await uploadImage(formattedProduct.thumbnail, shopId)
//         }

//         if (formattedProduct.images) {
//           formattedProduct.images = await Promise.all(
//             formattedProduct.images.map(async image => {
//               return await uploadImage(image, shopId)
//             })
//           )
//         }

//         return formattedProduct
//       })
//     )

//     if (!formattedProducts.length) {
//       return Promise.resolve('Instagram posts not found!')
//     }

//     const parts: (InlineDataPart | TextPart)[] = [
//       ...formattedProducts.map(fp => ({
//         inlineData: {
//           data: fp.thumbnailBase64 as string,
//           mimeType: 'image/jpeg'
//         }
//       })),
//       {
//         text: `
//           I provide you with images of products. For each image you need to focus and understood what product on the image. Write me a title, description, meta title,
//           meta description and category for each product for publishing this product on my online store.
//           Choose mo relevant category from list that I provide.
//           Provide me with valid json array format without any other data for each product and save product's order that I sent.
//         `
//       }
//     ]

//     const requestToVertexAI = {
//       contents: [
//         {
//           role: 'user',
//           parts
//         }
//       ]
//     }

//     const result = await vertex.model.generateContent(requestToVertexAI as GenerateContentRequest)
//     let parsedContent: GeneratedContent = []

//     if (result.response.candidates?.length) {
//       parsedContent = JSON.parse(
//         result.response.candidates[0].content.parts[0].text?.replace('```json', '').replace('```', '')!
//       )
//     }

//     formattedProducts = formattedProducts.map((fp, fpIndex) => {
//       delete fp.thumbnailBase64

//       fp.title = parsedContent[fpIndex].title || fp.title
//       fp.description = parsedContent[fpIndex].description || fp.description
//       fp.category = parsedContent[fpIndex].category || fp.category
//       fp.metaTitle = parsedContent[fpIndex].meta_title || fp.metaTitle
//       fp.metaDescription = parsedContent[fpIndex].meta_description || fp.metaDescription

//       return fp
//     })

//     await saveProducts(formattedProducts)

//     return Promise.resolve('Success!')
//   } catch (error) {
//     console.log('%c error', 'color: red; font-weight: bold;', error)

//     return Promise.reject('Something went wrong!')
//   }
// }

export const isError = (err: unknown): err is Error => err instanceof Error
