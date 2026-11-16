import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const visaUrl      = env.VITE_VISA_API_URL        || 'http://localhost:8000'
  const realEstateUrl = env.VITE_REAL_ESTATE_API_URL || 'http://localhost:8010'

  return {
    plugins: [react()],
    server: {
      port: 5180,
      strictPort: true,
      host: '0.0.0.0',
      proxy: {
        '/facebook-api': {
          target: visaUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/facebook-api/, ''),
        },
        '/whatsapp-api': {
          target: visaUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/whatsapp-api/, ''),
        },
        '/visa-api': {
          target: visaUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/visa-api/, ''),
        },
        '/real-estate-api': {
          target: realEstateUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/real-estate-api/, ''),
        },
        '/youtube-api': {
          target: 'https://8qgnw9pl-8005.inc1.devtunnels.ms',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/youtube-api/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('X-Tunnel-Skip-AntiPhishing-Page', 'true');
            });
          },
        },
      },
    },
  }
})
