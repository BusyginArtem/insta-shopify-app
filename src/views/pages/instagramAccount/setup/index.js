import { v4 } from 'uuid'
import { useState } from 'react'

import InstagramAccountSetupLoaderView from './InstagramAccountSetupLoader'
import InstagramAccountSetupFormView from './InstagramAccountSetupForm'
import { addDoc, collection, Timestamp } from '@firebase/firestore'
import { getDownloadURL, ref, uploadString } from '@firebase/storage';

const InstagramAccountSetupView = ({ auth, theme, facebook, firestore, vertex, storage }) => {
  const [loading, setLoading] = useState(false)

  const formatProduct = (igPost, shop) => {
    let type = null
    let thumbnail = null
    let images = []
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
      shopOwnerId: auth.user.uid,
      shopId: shop.id.toString(),
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
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    }
  }

  const saveProducts = async products => {
    for (const product of products) {
      await addDoc(collection(firestore, 'products'), product)
    }
  }

  async function getImageBase64(url) {
    // Fetch the image
    const response = await fetch(url)

    const arrayBuffer = await response.arrayBuffer()

    const base64String = Buffer.from(arrayBuffer).toString('base64')

    return `${base64String}`
  }

  async function uploadImage(imageUrl, shopId) {
    const filename = `${v4()}.jpg`
    const productImagesRef = ref(storage, `products`);
    const productImagesShopRef = ref(productImagesRef, `${shopId}`);
    const productImageRef = ref(productImagesShopRef, `${filename}`);
    const imageBase64 = await getImageBase64(imageUrl)

    const productFileSnapshot = await uploadString(productImageRef, imageBase64, 'base64', {
      contentType: 'image/jpeg'
    })

    const productImageUrl = await getDownloadURL(productFileSnapshot.ref)

    return productImageUrl
  }

  const onSubmit = data => {
    setLoading(true)

    auth.setup(data, async shop => {
      const posts = await facebook.getInstagramPosts(auth.selectedInstagramAccount.id.toString())
      const formatedProducts = posts.map(post => formatProduct(post, shop))

      for (const formatedProduct of formatedProducts) {
        const imageBase64 = await getImageBase64(formatedProduct.thumbnail)

        // upload thumbnail
        formatedProduct.thumbnail = await uploadImage(formatedProduct.thumbnail, shop.id)

        if (formatedProduct.images) {
          formatedProduct.images = await Promise.all(formatedProduct.images.map(async (image) => {
            return await uploadImage(image, shop.id)
          }))
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

        formatedProduct.title = jsonData.title || formatedProduct.title
        formatedProduct.description = jsonData.description || formatedProduct.description
        formatedProduct.category = jsonData.category || formatedProduct.category
        formatedProduct.metaTitle = jsonData.meta_title || formatedProduct.metaTitle
        formatedProduct.metaDescription = jsonData.meta_description || formatedProduct.metaDescription
      }

      await saveProducts(formatedProducts)

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
