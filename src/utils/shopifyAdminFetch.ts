const SHOPIFY_ADMIN_GRAPHQL_API = 'shopify:admin/api/2024-07/graphql.json'

type Options = {
  query: string
  signal?: AbortSignal | null
  variables?: { id?: string }
}

export default async <T>({ query, signal = null, variables = {} }: Options): Promise<T> => {
  const response = await fetch(SHOPIFY_ADMIN_GRAPHQL_API, {
    method: 'POST',
    signal,
    body: JSON.stringify({
      query,
      variables
    })
  })

  if (!response.ok) {
    return Promise.reject(response.statusText)
  }

  const { data } = await response.json()

  return data as T
}
