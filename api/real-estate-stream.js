import proxyBackendStream from '../lib/backend-stream.js';

export default function handler(req, res) {
  return proxyBackendStream(req, res, {
    envNames: [
      'VITE_REAL_ESTATE_SSE_BASE',
      'VITE_REAL_ESTATE_API_URL',
      'REAL_ESTATE_API_URL',
    ],
    path: 'estate/dashboard/stream',
  });
}
