import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.svg'],
      manifest: {
        name: 'Wedding Devis Pro',
        short_name: 'Devis InstantMariage.fr',
        description: 'Créez et gérez vos devis de mariage facilement',
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait-primary',
        background_color: '#fdf9ec',
        theme_color: '#d4981a',
        lang: 'fr',
        categories: ['business', 'lifestyle'],
        icons: [
          {
            src: '/icons/pwa-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: '/icons/pwa-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
        shortcuts: [
          {
            name: 'Nouveau devis',
            short_name: 'Nouveau',
            description: 'Créer un nouveau devis de mariage',
            url: '/',
            icons: [{ src: '/icons/pwa-192.svg', sizes: '192x192' }],
          },
        ],
      },
      workbox: {
        // Cache toutes les pages et assets de l'app
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2}'],
        // Stratégie : réseau d'abord, cache en fallback
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
})
