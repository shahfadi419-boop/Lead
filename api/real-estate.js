import proxyBackend, { PLATFORM_ENDPOINTS } from '../lib/backend-proxy.js';

export default function handler(req, res) {
  return proxyBackend(req, res, {
    envName: 'REAL_ESTATE_API_URL',
    fallbackEnvName: 'VITE_REAL_ESTATE_API_URL',
    prefix: 'estate/',
    endpoints: PLATFORM_ENDPOINTS,
  });
}
