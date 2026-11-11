import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5180,
    strictPort: true,
    host: '0.0.0.0',
    proxy: {
      '/facebook-api': {
        target: 'https://interbrachial-nonebulliently-toni.ngrok-free.dev',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/facebook-api/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('ngrok-skip-browser-warning', 'true');
          });
        },
      },
      '/whatsapp-api': {
        target: 'https://interbrachial-nonebulliently-toni.ngrok-free.dev',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/whatsapp-api/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('ngrok-skip-browser-warning', 'true');
          });
        },
      },
      '/real-estate-api': {
        target: 'https://g9v5djqw-8010.inc1.devtunnels.ms',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/real-estate-api/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('X-Tunnel-Skip-AntiPhishing-Page', 'true');
          });
        },
      },
    },
  }
})
