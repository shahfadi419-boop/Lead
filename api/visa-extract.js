/**
 * POST /api/visa-extract
 * Triggers an on-demand lead extraction run on the visa backend.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ detail: 'Only POST requests are supported.' }));
    return;
  }

  const backendBaseUrl =
    process.env.VITE_VISA_API_URL ||
    process.env.FACEBOOK_API_URL ||
    process.env.VITE_FACEBOOK_API_URL;

  if (!backendBaseUrl) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ detail: 'Visa backend URL is not configured.' }));
    return;
  }

  const upstreamUrl = `${backendBaseUrl.replace(/\/+$/, '')}/extract`;

  let upstreamResponse;
  try {
    upstreamResponse = await fetch(upstreamUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'X-Tunnel-Skip-AntiPhishing-Page': 'true',
        'ngrok-skip-browser-warning': 'true',
      },
      signal: AbortSignal.timeout(10000),
    });
  } catch (error) {
    const timedOut = error.name === 'TimeoutError';
    res.statusCode = timedOut ? 504 : 502;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({
      detail: timedOut ? 'The backend request timed out.' : 'Could not reach the visa backend.',
    }));
    return;
  }

  const body = Buffer.from(await upstreamResponse.arrayBuffer());
  res.statusCode = upstreamResponse.status;
  res.setHeader('Content-Type', upstreamResponse.headers.get('content-type') || 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.end(body);
}
