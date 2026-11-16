async function realEstateRequest(endpoint, query = {}) {
  let response
  let data

  try {
    const params = new URLSearchParams({ endpoint, ...query })
    response = await fetch(`/api/real-estate?${params}`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(20_000),
    })
    const text = await response.text()
    if (text) {
      try {
        data = JSON.parse(text)
      } catch {
        data = text
      }
    }
  } catch (error) {
    throw new Error(`Could not reach the Real Estate backend for ${endpoint}.`, { cause: error })
  }

  if (!response.ok) {
    const detail = data && typeof data === 'object' && typeof data.detail === 'string'
      ? `: ${data.detail}`
      : ''
    throw new Error(`Real Estate backend request failed (${response.status})${detail}`)
  }

  if (!data || typeof data !== 'object') {
    throw new Error(`Real Estate backend returned an invalid response for ${endpoint}.`)
  }

  return data
}

export function getRealEstateStats() {
  return realEstateRequest('stats')
}

export function getRealEstateLeads() {
  return realEstateRequest('leads', { limit: '200' })
}

export function getRealEstateEngagement() {
  return realEstateRequest('engagement')
}

export function getRealEstatePageInfo() {
  return realEstateRequest('page-info')
}
