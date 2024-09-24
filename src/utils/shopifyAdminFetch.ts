const SHOPIFY_ADMIN_GRAPHQL_API = 'shopify:admin/api/graphql.json'

export default async ({
  query,
  signal = null,
  variables = {}
}: {
  query: string
  signal?: AbortSignal | null
  variables?: { id?: string }
}) => {
  try {
    const response = await fetch(SHOPIFY_ADMIN_GRAPHQL_API, {
      method: 'POST',
      signal,
      body: JSON.stringify({
        query,
        variables
      })
    })

    if (!response.ok) throw new Error(response.statusText)

    return await response.json()
  } catch (error) {
    console.error(error)
    throw new Error('Something went wrong!')
  }
}
