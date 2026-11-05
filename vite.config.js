import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import path from 'node:path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, import.meta.dirname, '')
  const backendUrl = env.BACKEND_URL?.trim()
  if (!backendUrl) {
    throw new Error('BACKEND_URL must be set in the project .env file.')
  }
  const facebookBackendUrl = env.FACEBOOK_BACKEND_URL?.trim()
  if (!facebookBackendUrl) {
    throw new Error('FACEBOOK_BACKEND_URL must be set in the project .env file.')
  }

  for (const [name, value] of [
    ['BACKEND_URL', backendUrl],
    ['FACEBOOK_BACKEND_URL', facebookBackendUrl],
  ]) {
    try {
      const protocol = new URL(value).protocol
      if (protocol !== 'http:' && protocol !== 'https:') {
        throw new Error()
      }
    } catch {
      throw new Error(`${name} must be a valid HTTP or HTTPS URL.`)
    }
  }

  const createBackendProxy = (target) => ({
    target,
    changeOrigin: true,
    secure: true,
    headers: {
      'X-Tunnel-Skip-AntiPhishing-Page': 'true',
      'ngrok-skip-browser-warning': 'true',
    },
  })
  const backendProxy = createBackendProxy(backendUrl)
  const facebookBackendProxy = {
    ...createBackendProxy(facebookBackendUrl),
    rewrite: (requestPath) => requestPath.replace(/^\/facebook-api/, ''),
  }

  return {
    plugins: [react(), tailwindcss()],
    envPrefix: [ 'VITE_RECAPTCHA_SITE_KEY' ],

    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },

    server: {
      proxy: {
        '/api/facebook': {
          ...facebookBackendProxy,
          rewrite: (requestPath) => requestPath.replace(/^\/api\/facebook/, ''),
        },
        '/api': backendProxy,
        '/auth': backendProxy,
        '/business-profile': backendProxy,
        '/selection-videos': backendProxy,
        '/comments': backendProxy,
        '/ai': backendProxy,
        '/analytics': backendProxy,
        '/demo': backendProxy,
      },
    },
  }
})
