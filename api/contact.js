function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

function getString(value) {
  return typeof value === 'string' ? value : '';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { detail: 'Only POST requests are supported.' });
  }

  const backendBaseUrl = process.env.YOUTUBE_API_URL || process.env.VITE_YOUTUBE_API_URL;
  if (!backendBaseUrl) {
    return sendJson(res, 500, {
      detail: 'The YouTube backend URL is not configured.',
    });
  }

  const request = typeof req.body === 'string'
    ? (() => {
      try {
        return JSON.parse(req.body);
      } catch {
        return null;
      }
    })()
    : req.body;

  if (!request || typeof request !== 'object' || Array.isArray(request)) {
    return sendJson(res, 400, { detail: 'A valid JSON request body is required.' });
  }

  const payload = {
    name: getString(request.name),
    email: getString(request.email),
    company: getString(request.company),
    channels: getString(request.channels),
    volume: getString(request.volume),
    message: getString(request.message),
    recaptcha_token: getString(request.recaptcha_token),
  };
  if (!payload.name.trim() || !payload.email.trim() || !payload.recaptcha_token.trim()) {
    return sendJson(res, 400, {
      detail: 'Name, email, and a completed reCAPTCHA are required.',
    });
  }

  let upstreamUrl;
  try {
    const baseUrl = new URL(backendBaseUrl);
    if (baseUrl.protocol !== 'https:') {
      return sendJson(res, 500, { detail: 'The YouTube backend URL must use HTTPS.' });
    }
    upstreamUrl = new URL(`${baseUrl.toString().replace(/\/+$/, '')}/api/contact.php`);
  } catch (error) {
    console.error('Invalid YouTube backend URL', error);
    return sendJson(res, 500, { detail: 'The YouTube backend URL is invalid.' });
  }

  let upstreamResponse;
  try {
    upstreamResponse = await fetch(upstreamUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Tunnel-Skip-AntiPhishing-Page': 'true',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(20000),
    });
  } catch (error) {
    console.error('Book demo request could not reach the YouTube backend', error);
    const timedOut = error.name === 'TimeoutError';
    return sendJson(res, timedOut ? 504 : 502, {
      detail: timedOut
        ? 'The demo request timed out. Please try again.'
        : 'Could not reach the demo request service. Please try again.',
    });
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
