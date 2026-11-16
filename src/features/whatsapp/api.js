async function whatsappRequest(endpoint, query = {}) {
  let response
  let data

  try {
    const params = new URLSearchParams({ endpoint, ...query })
    response = await fetch(`/api/whatsapp?${params}`, {
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
    throw new Error(`Could not reach the WhatsApp backend for ${endpoint}.`, { cause: error })
  }

  if (!response.ok) {
    const detail = data && typeof data === 'object' && typeof data.detail === 'string'
      ? `: ${data.detail}`
      : ''
    throw new Error(`WhatsApp backend request failed (${response.status})${detail}`)
  }

  if (!data || typeof data !== 'object') {
    throw new Error(`WhatsApp backend returned an invalid response for ${endpoint}.`)
  }

  return data
}

export function getWhatsAppStats() {
  return whatsappRequest('stats')
}

export function getWhatsAppLeads() {
  return whatsappRequest('leads', { limit: '200' })
}

export function getWhatsAppEngagement() {
  return whatsappRequest('engagement')
}

export function getWhatsAppPageInfo() {
  return whatsappRequest('page-info')
}
