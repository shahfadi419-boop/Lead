const ALLOWED_ENDPOINTS = new Set(['stats', 'leads', 'engagement', 'page-info'])

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    return response.status(405).json({ detail: 'Method not allowed.' })
  }

  const backendUrl = process.env.FACEBOOK_BACKEND_URL?.trim()
  if (!backendUrl) {
    return response.status(500).json({ detail: 'FACEBOOK_BACKEND_URL is not configured.' })
  }

  let baseUrl
  try {
    baseUrl = new URL(backendUrl)
    if (baseUrl.protocol !== 'http:' && baseUrl.protocol !== 'https:') {
      throw new Error('Invalid protocol')
    }
  } catch {
    return response.status(500).json({ detail: 'FACEBOOK_BACKEND_URL must be a valid HTTP or HTTPS URL.' })
  }

  const incomingUrl = new URL(request.url, 'http://localhost')
  const endpoint = incomingUrl.searchParams.get('endpoint')
  if (!ALLOWED_ENDPOINTS.has(endpoint)) {
    return response.status(404).json({ detail: 'Facebook API endpoint not found.' })
  }

  const targetUrl = new URL(`/${endpoint}`, baseUrl)
  incomingUrl.searchParams.forEach((value, key) => {
    if (key !== 'endpoint') targetUrl.searchParams.append(key, value)
  })

  try {
    const backendResponse = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'X-Tunnel-Skip-AntiPhishing-Page': 'true',
        'ngrok-skip-browser-warning': 'true',
      },
    })
    response.statusCode = backendResponse.status
    response.setHeader(
      'Content-Type',
      backendResponse.headers.get('content-type') || 'application/json',
    )
    response.setHeader('Cache-Control', 'no-store')
    return response.send(Buffer.from(await backendResponse.arrayBuffer()))
  } catch (error) {
    console.error('[Facebook API proxy] Backend request failed', error)
    return response.status(502).json({ detail: 'Could not reach the Facebook backend.' })
  }
}
