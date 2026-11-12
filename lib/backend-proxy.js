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

export default async function proxyBackend(
  req,
  res,
  { envName, fallbackEnvName, prefix = '', endpoints },
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return sendJson(res, 405, 'Only GET requests are supported.');
  }

  const endpoint = req.query.endpoint;
  if (typeof endpoint !== 'string' || !endpoints.has(endpoint)) {
    return sendJson(res, 404, 'Unknown backend API endpoint.');
  }

  const configuredEnvName = process.env[envName]
    ? envName
    : fallbackEnvName && process.env[fallbackEnvName]
      ? fallbackEnvName
      : null;
  const backendBaseUrl = configuredEnvName ? process.env[configuredEnvName] : null;
  if (!backendBaseUrl) {
    const acceptedNames = [envName, fallbackEnvName].filter(Boolean).join(' or ');
    return sendJson(res, 500, `Vercel environment variable ${acceptedNames} is not configured.`);
  }

  let upstreamUrl;
  try {
    const baseUrl = new URL(backendBaseUrl);
    if (baseUrl.protocol !== 'https:') {
      return sendJson(res, 500, `${configuredEnvName} must use HTTPS.`);
    }
    upstreamUrl = new URL(`${baseUrl.toString().replace(/\/+$/, '')}/${prefix}${endpoint}`);
    appendQueryParams(upstreamUrl, req.query);
  } catch (error) {
    console.error(`Invalid backend URL in ${configuredEnvName}`, error);
    return sendJson(res, 500, `Vercel environment variable ${configuredEnvName} is not a valid URL.`);
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
