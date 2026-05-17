/// <reference types="vitest/config" />
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit(),
    SvelteKitPWA({
      strategies: 'generateSW',
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg', 'icon-leaf.svg'],
      manifest: {
        name: 'Plant Schedule',
        short_name: 'Plant Schedule',
        description:
          'A garden planting timeline tailored to your hardiness zone and 14-day forecast.',
        theme_color: '#7A9471',
        background_color: '#FAF6EF',
        display: 'standalone',
        start_url: '.',
        scope: '.',
        icons: [
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml' },
          {
            src: 'icon-leaf.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['client/**/*.{js,css,html,svg,ico,png,webp,woff2}'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.hostname === 'api.open-meteo.com' ||
              url.hostname === 'geocoding-api.open-meteo.com',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'open-meteo',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 6
              }
            }
          },
          {
            urlPattern: /\.json$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'plant-data',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          }
        ]
      },
      kit: {
        includeVersionFile: true
      }
    })
  ],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      include: ['src/lib/**/*.{ts,js}'],
      exclude: ['src/lib/**/*.test.{ts,js}', 'src/lib/**/*.svelte.ts'],
      reporter: ['text', 'json', 'json-summary', 'html']
    }
  }
});
