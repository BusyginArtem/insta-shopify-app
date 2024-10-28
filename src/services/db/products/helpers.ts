// ** Third party imports
import { v4 } from 'uuid'
import { serverTimestamp } from '@firebase/firestore'
import { getDownloadURL, ref, uploadString, uploadBytes } from '@firebase/storage'

// ** Types
import type { User } from '@firebase/auth'
import type { InstagramPostType, StorageFileStructure, ProductType, Shop } from 'src/types'
// import { InlineDataPart, TextPart } from 'firebase/vertexai-preview'

// ** Hooks
import useFirebaseStorage from 'src/hooks/useFirebaseStorage'
import { FormatProductsType } from './types'

const STORAGE_PRODUCTS = 'products'

const storage = useFirebaseStorage()

export function convertObjToCSV(data: StorageFileStructure) {
  try {
    return `${'ID,NAME'}\n${Object.entries(data)
      .map(([id, value]) => `${id},${value}`)
      .join('\r\n')}`
  } catch (error) {
    console.error(error)
    return ''
  }
}

export async function uploadCSVFile({ csv, fileName }: { csv: string; fileName: string }) {
  try {
    const storageFileRef = ref(storage, `uploads/${(window as any).shopify.config.shop}/${fileName}.csv`)

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })

    const result = await uploadBytes(storageFileRef, blob)
    console.log(`${fileName} were uploaded to the storage successfully!`)

    return result?.ref.toString()
  } catch (error) {
    console.error(error)
  }
}

export async function uploadJSONFile({ file, fileName }: { file: StorageFileStructure; fileName: string }) {
  try {
    const storageFileRef = ref(storage, `uploads/${(window as any).shopify.config.shop}/${fileName}.json`)

    const blob = new Blob([JSON.stringify(file)], { type: 'application/json' })

    const result = await uploadBytes(storageFileRef, blob)
    console.log(`${fileName} were uploaded to the storage successfully!`)

    return result?.ref.toString()
  } catch (error) {
    console.error(error)
  }
}

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

export const isError = (err: unknown): err is Error => err instanceof Error
