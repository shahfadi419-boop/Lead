import proxyBackend, { PLATFORM_ENDPOINTS } from '../lib/backend-proxy.js';

export default function handler(req, res) {
  return proxyBackend(req, res, {
    envName: 'FACEBOOK_API_URL',
    endpoints: PLATFORM_ENDPOINTS,
  });
}
