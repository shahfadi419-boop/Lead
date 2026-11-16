import proxyBackend, { PLATFORM_ENDPOINTS } from '../lib/backend-proxy.js';

export default function handler(req, res) {
  return proxyBackend(req, res, {
    envName: 'WHATSAPP_API_URL',
    fallbackEnvName: 'VITE_WHATSAPP_API_URL',
    endpoints: PLATFORM_ENDPOINTS,
  });
}
