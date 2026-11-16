import proxyBackendStream from '../lib/backend-stream.js';

export default function handler(req, res) {
  const platform = req.query.platform;
  if (platform !== 'facebook' && platform !== 'whatsapp') {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ detail: 'A supported platform is required.' }));
    return;
  }

  return proxyBackendStream(req, res, {
    envNames: [
      'VITE_VISA_SSE_BASE',
      'VITE_VISA_API_URL',
      'FACEBOOK_API_URL',
      'VITE_FACEBOOK_API_URL',
    ],
    path: 'dashboard/stream',
    query: { platform },
  });
}
