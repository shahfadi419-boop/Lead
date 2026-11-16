function sendJson(res, status, message) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify({ detail: message }));
}

export default async function proxyBackendStream(
  req,
  res,
  { envNames, path, query = {} },
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return sendJson(res, 405, 'Only GET requests are supported.');
  }

  const configuredEnvName = envNames.find((name) => process.env[name]);
  const backendBaseUrl = configuredEnvName ? process.env[configuredEnvName] : null;
  if (!backendBaseUrl) {
    return sendJson(
      res,
      500,
      `Vercel environment variable ${envNames.join(' or ')} is not configured.`,
    );
  }

  let upstreamUrl;
  try {
    const baseUrl = new URL(backendBaseUrl);
    if (baseUrl.protocol !== 'https:') {
      return sendJson(res, 500, `${configuredEnvName} must use HTTPS.`);
    }
    upstreamUrl = new URL(`${baseUrl.toString().replace(/\/+$/, '')}/${path}`);
    for (const [key, value] of Object.entries(query)) {
      upstreamUrl.searchParams.set(key, value);
    }
  } catch (error) {
    console.error(`Invalid backend URL in ${configuredEnvName}`, error);
    return sendJson(res, 500, `Vercel environment variable ${configuredEnvName} is not a valid URL.`);
  }

  const controller = new AbortController();
  const abortOnDisconnect = () => controller.abort();
  res.on('close', abortOnDisconnect);

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      headers: {
        Accept: 'text/event-stream',
        'X-Tunnel-Skip-AntiPhishing-Page': 'true',
      },
      signal: controller.signal,
    });

    if (!upstreamResponse.ok || !upstreamResponse.body) {
      console.error(`Backend stream returned HTTP ${upstreamResponse.status} for ${path}`);
      return sendJson(res, 502, 'The backend live-update stream is unavailable.');
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    for await (const chunk of upstreamResponse.body) {
      if (controller.signal.aborted || res.destroyed) break;
      res.write(Buffer.from(chunk));
    }

    if (!res.destroyed) res.end();
  } catch (error) {
    if (!controller.signal.aborted) {
      console.error(`Backend stream request failed for ${path}`, error);
      if (!res.headersSent) {
        return sendJson(res, 502, 'Could not reach the backend live-update stream.');
      }
      if (!res.destroyed) res.end();
    }
  } finally {
    res.off('close', abortOnDisconnect);
  }
}
