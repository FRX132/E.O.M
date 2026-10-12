import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  resolve: {
    alias: {
      '@vercel/analytics/next': '@vercel/analytics/react',
    }
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'icons.svg', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: 'E.O.M - Life Planner & OS',
        short_name: 'E.O.M',
        description: 'Evolution of Mind - Productivity, Health, Trading & Intelligence OS',
        theme_color: '#111111',
        background_color: '#111111',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './',
        scope: './',
        icons: [
          {
            src: './pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: './pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: './pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff,woff2}'],
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024 // 8 MB to accommodate Transformers / ONNX bundle
      }
    })
  ],
  base: './',
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('three') || id.includes('globe.gl') || id.includes('react-globe.gl')) {
              return 'vendor-3d-globe';
            }
            if (id.includes('@xenova/transformers') || id.includes('onnxruntime-web')) {
              return 'vendor-ai';
            }
            if (id.includes('@xyflow') || id.includes('dagre')) {
              return 'vendor-flow';
            }
            if (id.includes('recharts') || id.includes('d3-')) {
              return 'vendor-charts';
            }
            if (id.includes('react-bootstrap') || id.includes('bootstrap')) {
              return 'vendor-bootstrap';
            }
          }
        }
      }
    }
  },
  server: {
    watch: {
      ignored: ['**/release/**', '**/dist/**', '**/build/**']
    }
  }
});
