// The original site talked to a Laravel/Lighthouse GraphQL API through Apollo.
// The static build has no backend; mutations (newsletter, contact, sign-up...) are sent to
// PUBLIC_GRAPHQL_URL when it is configured, otherwise they fail gracefully.
import { toast } from './toast.js'

const ENDPOINT = import.meta.env.PUBLIC_GRAPHQL_URL

export async function gqlRequest(query, variables = {}) {
  if (!ENDPOINT) throw new Error('This form is not available on the static site yet.')
  const res = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' }, body: JSON.stringify({ query, variables }) })
  const json = await res.json()
  if (json.errors) { const e = new Error(json.errors[0].message); e.graphQLErrors = json.errors; throw e }
  return json.data
}

export const apollo = {
  queries: new Proxy({}, { get: () => ({ loading: false }) }),
  mutate({ mutation, variables }) {
    return gqlRequest(mutation, variables).then(data => ({ data })).catch((e) => { toast.error(e.message); throw e })
  },
  query({ query, variables }) { return gqlRequest(query, variables).then(data => ({ data })) },
}
