const PLATFORM_ENDPOINTS = new Set(['stats', 'leads', 'engagement', 'page-info']);

function sendJson(res, status, message) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify({ detail: message }));
}

function appendQueryParams(url, query) {
  for (const [key, value] of Object.entries(query)) {
    if (key === 'endpoint' || value === undefined) continue;
    for (const item of Array.isArray(value) ? value : [value]) {
      url.searchParams.append(key, String(item));
    }
  }
}

export default async function proxyBackend(req, res, { envName, prefix = '', endpoints }) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return sendJson(res, 405, 'Only GET requests are supported.');
  }

  const endpoint = req.query.endpoint;
  if (typeof endpoint !== 'string' || !endpoints.has(endpoint)) {
    return sendJson(res, 404, 'Unknown backend API endpoint.');
  }

  const backendBaseUrl = process.env[envName];
  if (!backendBaseUrl) {
    return sendJson(res, 500, `Vercel environment variable ${envName} is not configured.`);
  }

  let upstreamUrl;
  try {
    const baseUrl = new URL(backendBaseUrl);
    if (baseUrl.protocol !== 'https:') {
      return sendJson(res, 500, `${envName} must use HTTPS.`);
    }
    upstreamUrl = new URL(`${baseUrl.toString().replace(/\/+$/, '')}/${prefix}${endpoint}`);
    appendQueryParams(upstreamUrl, req.query);
  } catch (error) {
    console.error(`Invalid backend URL in ${envName}`, error);
    return sendJson(res, 500, `Vercel environment variable ${envName} is not a valid URL.`);
  }

  let upstreamResponse;
  try {
    upstreamResponse = await fetch(upstreamUrl, {
      headers: {
        Accept: 'application/json',
        'X-Tunnel-Skip-AntiPhishing-Page': 'true',
      },
      signal: AbortSignal.timeout(25000),
    });
  } catch (error) {
    console.error(`Backend request failed for ${envName}`, error);
    const timedOut = error.name === 'TimeoutError';
    return sendJson(
      res,
      timedOut ? 504 : 502,
      timedOut ? 'The backend request timed out.' : 'Could not reach the configured backend.',
    );
  }

  const body = Buffer.from(await upstreamResponse.arrayBuffer());
  res.statusCode = upstreamResponse.status;
  res.setHeader(
    'Content-Type',
    upstreamResponse.headers.get('content-type') || 'application/json',
  );
  res.setHeader('Cache-Control', 'no-store');
  return res.end(body);
}

export { PLATFORM_ENDPOINTS };
