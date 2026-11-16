import proxyBackend from '../lib/backend-proxy.js';

export default function handler(req, res) {
  return proxyBackend(req, res, {
    envName: 'YOUTUBE_API_URL',
    fallbackEnvName: 'VITE_YOUTUBE_API_URL',
    endpoints: new Set(['analytics/pinned']),
  });
}
