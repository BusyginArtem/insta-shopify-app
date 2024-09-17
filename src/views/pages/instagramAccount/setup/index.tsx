import { useState } from 'react'
import { v4 } from 'uuid'

import { addDoc, collection, Firestore, Timestamp } from '@firebase/firestore'
import { getDownloadURL, ref, uploadString } from '@firebase/storage'

import InstagramAccountSetupLoaderView from './InstagramAccountSetupLoader'
import InstagramAccountSetupFormView from './InstagramAccountSetupForm'

// ** Types
import type { Theme } from '@mui/material'
import type FacebookService from 'src/services/facebook'
import type { GenerativeModel, VertexAI } from '@firebase/vertexai'
import type { AuthValuesType, InstagramPostType, InstagramSetupFormValues, ProductType, Shop } from 'src/context/types'

type Props = {
  theme: Theme
  auth: AuthValuesType
  facebook: FacebookService
  firestore: Firestore
  vertex: {
    vertexAI: VertexAI
    model: GenerativeModel
  }
  storage: any
}

const InstagramAccountSetupView = ({ auth, theme, facebook, firestore, vertex, storage }: Props) => {
  const [loading, setLoading] = useState(false)

  const formatProduct = (igPost: InstagramPostType, shop: Shop): ProductType => {
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
      shopOwnerId: auth.user?.uid || '',
      shopId: shop.id ? shop.id.toString() : '',
      type,
      status: 'draft',
      title: null,
      description: igPost.caption,
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
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    }
  }

  // TODO fix
  const saveProducts = async (products: ProductType[]) => {
    for (const product of products) {
      await addDoc(collection(firestore, 'products'), product)
    }
  }

  async function getImageBase64(url: string) {
    // Fetch the image
    const response = await fetch(url)

    const arrayBuffer = await response.arrayBuffer()

    const base64String = Buffer.from(arrayBuffer).toString('base64')

    return `${base64String}`
  }

  async function uploadImage(imageUrl: string, shopId: string) {
    const filename = `${v4()}.jpg`
    const productImagesRef = ref(storage, `products`)
    const productImagesShopRef = ref(productImagesRef, `${shopId}`)
    const productImageRef = ref(productImagesShopRef, `${filename}`)
    const imageBase64 = await getImageBase64(imageUrl)

    const productFileSnapshot = await uploadString(productImageRef, imageBase64, 'base64', {
      contentType: 'image/jpeg'
    })

    const productImageUrl = await getDownloadURL(productFileSnapshot.ref)

    return productImageUrl
  }

  const onSubmit = (data: InstagramSetupFormValues) => {
    setLoading(true)

    auth.onHandleSetUp(data, async (shop: Shop) => {
      if (!auth.selectedInstagramAccount?.id) {
        return
      }

      const posts: InstagramPostType[] = await facebook.getInstagramPosts(auth.selectedInstagramAccount.id.toString())
      const formattedProducts = posts.map(post => formatProduct(post, shop))
      console.log('%c posts', 'color: green; font-weight: bold;', posts)
      console.log('%c formattedProducts', 'color: red; font-weight: bold;', formattedProducts)
      for (const formattedProduct of formattedProducts) {
        if (!formattedProduct?.thumbnail) {
          continue
        }

        const imageBase64 = await getImageBase64(formattedProduct.thumbnail)

        // upload thumbnail
        formattedProduct.thumbnail = await uploadImage(formattedProduct.thumbnail, shop.id!)

        if (formattedProduct.images) {
          formattedProduct.images = await Promise.all(
            formattedProduct.images.map(async image => {
              return await uploadImage(image, shop.id!)
            })
          )
        }

        const prompt =
          'I have an image of product. You need to understand what product is it. Write me a title, description, meta title, meta description and category of product for publishing this product on my online store. Choose mo relevant category from list that I provide. Provide me with valid json format without any other data. '

        const result = await vertex.model.generateContent([
          prompt,
          {
            inlineData: {
              data: imageBase64,
              mimeType: 'image/jpeg'
            }
          }
        ])

        const response = result.response
        const text = response.text()

        const jsonData = JSON.parse(text.replace('```json', '').replace('```', ''))

        formattedProduct.title = jsonData.title || formattedProduct.title
        formattedProduct.description = jsonData.description || formattedProduct.description
        formattedProduct.category = jsonData.category || formattedProduct.category
        formattedProduct.metaTitle = jsonData.meta_title || formattedProduct.metaTitle
        formattedProduct.metaDescription = jsonData.meta_description || formattedProduct.metaDescription
      }

      await saveProducts(formattedProducts)

      setLoading(false)
    })
  }

  return loading ? (
    <InstagramAccountSetupLoaderView loading={loading} theme={theme} />
  ) : (
    <InstagramAccountSetupFormView auth={auth} theme={theme} onSubmit={onSubmit} />
  )
}

export default InstagramAccountSetupView
