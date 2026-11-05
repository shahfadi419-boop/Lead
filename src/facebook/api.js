async function facebookRequest(path, { signal } = {}) {
  let response
  let data

  try {
    response = await fetch(`/api/facebook${path}`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
      signal,
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
    if (signal?.aborted) throw error
    throw new Error(`Could not reach the Facebook backend for ${path}.`, { cause: error })
  }

  if (!response.ok) {
    const detail = data && typeof data === 'object' && typeof data.detail === 'string'
      ? `: ${data.detail}`
      : ''
    throw new Error(`Facebook backend request failed (${response.status})${detail}`)
  }

  if (!data || typeof data !== 'object') {
    throw new Error(`Facebook backend returned an invalid response for ${path}.`)
  }

  return data
}

export function getFacebookStats(options) {
  return facebookRequest('/stats', options)
}

export function getFacebookLeads(options) {
  return facebookRequest('/leads?limit=200', options)
}

export function getFacebookEngagement(options) {
  return facebookRequest('/engagement', options)
}

export function getFacebookPageInfo(options) {
  return facebookRequest('/page-info', options)
}
