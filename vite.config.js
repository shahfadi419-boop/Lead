import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const visaUrl       = env.VITE_VISA_API_URL        || 'http://localhost:8000'
  const facebookUrl   = env.VITE_FACEBOOK_API_URL    || visaUrl
  const whatsappUrl   = env.VITE_WHATSAPP_API_URL    || visaUrl
  const realEstateUrl = env.VITE_REAL_ESTATE_API_URL || 'http://localhost:8010'
  const youtubeUrl    = env.VITE_YOUTUBE_API_URL     || 'http://localhost:8005'
  const configureTunnelProxy = (proxy) => {
    proxy.on('proxyReq', (proxyReq) => {
      proxyReq.setHeader('X-Tunnel-Skip-AntiPhishing-Page', 'true')
    })
  }

  return {
    plugins: [react()],
    server: {
      port: 5180,
      strictPort: true,
      host: '0.0.0.0',
      proxy: {
        '/facebook-api': {
          target: facebookUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/facebook-api/, ''),
          configure: configureTunnelProxy,
        },
        '/whatsapp-api': {
          target: whatsappUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/whatsapp-api/, ''),
          configure: configureTunnelProxy,
        },
        '/visa-api': {
          target: visaUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/visa-api/, ''),
          configure: configureTunnelProxy,
        },
        '/real-estate-api': {
          target: realEstateUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/real-estate-api/, ''),
        },
        '/youtube-api': {
          target: youtubeUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/youtube-api/, ''),
          configure: configureTunnelProxy,
        },
      },
    },
  }
})
