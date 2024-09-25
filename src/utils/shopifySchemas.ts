import { ProductType } from 'src/types'

const productsGql = `
  cursor
  node {
    title
    handle
    id
    images(first: 1) {
      edges {
        node {
          src
        }
      }
    }
    metafields(namespace: "instagram_id", first: 1) {
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

export const queryProductsByInstagramOrigin = () => `
query {
  products(first: 50, query: "metafield:product_origin.type:instagram") {
    pageInfo {
      hasNextPage
    }
    edges {
      ${productsGql}
    }
  }
}`

export const createProduct = (product: ProductType) => `
mutation {
  productCreate(input: {
    title: "${product.title || 'Product 1'}"
    bodyHtml: "${product.description || 'Product 1 description'}"
    productType: "${product.type}"
    vendor: "${product.metaTitle || 'Product 1 vendor'}"
  }, media: {
    originalSource: "${product.images[0]}"
    alt: "${product.title || 'Product 1'}"
    mediaContentType: IMAGE
  }) {
    product {
      id
    }
    userErrors {
      field
      message
    }
  }
}`

export const metafieldMutation = (productId: string, instagramId: string) => `
mutation {
  metafieldsSet(metafields: [
    {
      ownerId: "${productId}",
      namespace: "product_origin",
      key: "type",
      type: "single_line_text_field",
      value: "instagram"
    },
    {
      ownerId: "${productId}",
      namespace: "product_origin",
      key: "instagram_id",
      type: "single_line_text_field",
      value: "${instagramId}"
    }
  ]) {
    metafields {
      key
      value
    }
    userErrors {
      field
      message
    }
  }
}`

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
