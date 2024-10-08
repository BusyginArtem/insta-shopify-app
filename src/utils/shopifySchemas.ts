import { ExtendedProductTypeByShopifyFields, ProductType } from 'src/types'
import { v4 } from 'uuid'

const productsGql = `
  cursor
  node {
    id
    onlineStorePreviewUrl
    metafields(namespace: "product_origin", first: 1) {
      edges {
        node {
          namespace
          key
          value
        }
      }
    }
  }
`
// products(first: 50, query: "metafields.namespace:product_origin AND metafields.key:type AND metafields.value:instagram") {
//   products(first: 50, query: "metafields.namespace:product_origin AND metafields.key:instagram_id") {
// products(first: 50, query: "metafields:product_origin.type:instagram") {
//
export const queryProductsByInstagramOrigin = () => `
query {
  products(first: 250) {
    pageInfo {
      hasNextPage
    }
    edges {
      ${productsGql}
    }
  }
}`

export const fetchCollections = ({ cursor }: { cursor: string | null }) => `
query {
  collections(first: 250, query: "collection_type:custom", after: ${cursor ? '"' + cursor + '"' : cursor}) {
    pageInfo {
      hasNextPage
    }
    edges {
      node {
        id
        title
      }
    }
  }
}`

export const fetchProductCategoriesTopLevel = () => `
query {
  taxonomy {
    categories(first: 250) {
      pageInfo {
        hasNextPage
      }
      edges {
        node {
          id
          fullName
          name
          level
          isLeaf
        }
      }
    }
  }
}`

export const fetchProductCategoriesNestedLevel = ({ categoryId }: { categoryId: string }) => `
query {
  taxonomy {
    categories(first: 250, descendantsOf: "${categoryId}") {
      pageInfo {
        hasNextPage
      }
      edges {
        cursor
        node {
          id
          fullName
          name
          level
          isLeaf
        }
      }
    }
  }
}`

// export const fetchProductCategoriesNestedLevelNext = ({
//   categoryId,
//   cursor
// }: {
//   categoryId: string
//   cursor: string
// }) => `
// query {
//   taxonomy {
//     categories(first: 250, descendantsOf: "${categoryId}", after: ${cursor ? '"' + cursor + '"' : cursor}) {
//       pageInfo {
//         hasNextPage
//       }
//       edges {
//         cursor
//         node {
//           id
//           fullName
//           name
//           level
//           isLeaf
//         }
//       }
//     }
//   }
// }`

// category: "${product.category || ''}"
// collectionsToJoin: "${product.collection! || ''}"
export const createProduct = (product: ExtendedProductTypeByShopifyFields) => `
mutation {
  productCreate(input: {
    title: "${product.title || 'Product'}"
    handle: "${product.title || 'product_' + v4()}"
    ${product.metaDescription ? 'bodyHtml: ' + '"' + product.metaDescription + '"' : ''}
    ${product.category ? 'category: ' + '"' + product.category + '"' : ''}
    ${product.collectionsToJoin ? 'collectionsToJoin: ' + '"' + product.collectionsToJoin + '"' : ''}
    metafields: [
      {
        namespace: "product_origin",
        key: "instagram_id",
        type: "single_line_text_field",
        value: "${product.instagramId}"
      }
    ]
  }, media: {
    originalSource: "${product.images[0]}"
    alt: "${product.title || 'Product image'}"
    mediaContentType: IMAGE
  }) {
    product {
      id
      onlineStorePreviewUrl
    }
    userErrors {
      field
      message
    }
  }
}`

// export const createProduct = (product: ProductType) => `
// mutation {
//   productCreate(input: {
//     title: "${product.title}"
//     bodyHtml: "${product.metaDescription}"
//     productType: "${product.category}"
//     handle: "${product.title || 'product_' + v4()}"
//     metafields: [
//       {
//         namespace: "product_origin",
//         key: "type",
//         type: "single_line_text_field",
//         value: "instagram"
//       },
//       {
//         namespace: "product_origin",
//         key: "instagram_id",
//         type: "single_line_text_field",
//         value: "${product.instagramId}"
//       }
//     ]
//   }, media: {
//     originalSource: "${product.images[0]}"
//     alt: "${product.title}"
//     mediaContentType: IMAGE
//   }) {
//     product {
//       id
//     }
//     userErrors {
//       field
//       message
//     }
//   }
// }`

// export const metafieldMutation = (productId: string, instagramId: string) => `
// mutation {
//   metafieldsSet(metafields: [
//     {
//       ownerId: "${productId}",
//       namespace: "product_origin",
//       key: "type",
//       type: "single_line_text_field",
//       value: "instagram"
//     },
//     {
//       ownerId: "${productId}",
//       namespace: "product_origin",
//       key: "instagram_id",
//       type: "single_line_text_field",
//       value: "${instagramId}"
//     }
//   ]) {
//     metafields {
//       key
//       value
//     }
//     userErrors {
//       field
//       message
//     }
//   }
// }`

// export const findProductsByTag = ({ query }) => `
//   {
//     products(first: 50, query: "tag:'${query}'") {
//       pageInfo {
//         hasNextPage
//       }
//       edges {
//         ${productsGql}
//       }
//     }
//   }
// `;

// export const findProductsByVendor = ({ query }) => `
//   {
//     products(first: 50, query: "vendor:'${query}'") {
//       pageInfo {
//         hasNextPage
//       }
//       edges {
//         ${productsGql}
//       }
//     }
//   }
// `;

// export const findCollectionByTitle = ({ query }) => `
//   {
//     collections(first: 50, query: "title:*${query}*") {
//       pageInfo {
//         hasNextPage
//       }
//       edges {
//         node {
//           id
//           title
//           handle
//           image {
//             src
//           }
//         }
//       }
//     }
//   }
// `;

// export const findProductByTitleOrSkuNextPage = ({ query, cursor }) => `
//   {
//     products(first: 50, query: "title:*${query}* OR sku:*${query}*", after: ${cursor ? '"' + cursor + '"' : cursor}) {
//       pageInfo {
//         hasNextPage
//       }
//       edges {
//         ${productsGql}
//       }
//     }
//   }
// `;

// export const findProductsByTagNextPage = ({ query, cursor }) => `
//   {
//     products(first: 50, query: "tag:'${query}'", after: ${cursor ? '"' + cursor + '"' : cursor}) {
//       pageInfo {
//         hasNextPage
//       }
//       edges {
//         ${productsGql}
//       }
//     }
//   }
// `;

// export const findProductsByVendorNextPage = ({ query, cursor }) => `
//   {
//     products(first: 50, query: "vendor:'${query}'", after: ${cursor ? '"' + cursor + '"' : cursor}) {
//       pageInfo {
//         hasNextPage
//       }
//       edges {
//         ${productsGql}
//       }
//     }
//   }
// `;
