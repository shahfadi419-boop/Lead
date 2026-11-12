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
        target: 'https://8qgnw9pl-8014.inc1.devtunnels.ms',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/facebook-api/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('X-Tunnel-Skip-AntiPhishing-Page', 'true');
          });
        },
      },
      '/whatsapp-api': {
        target: 'https://8qgnw9pl-8014.inc1.devtunnels.ms',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/whatsapp-api/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('X-Tunnel-Skip-AntiPhishing-Page', 'true');
          });
        },
      },
      '/real-estate-api': {
        target: 'https://8qgnw9pl-8010.inc1.devtunnels.ms',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/real-estate-api/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('X-Tunnel-Skip-AntiPhishing-Page', 'true');
          });
        },
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
  }
})
