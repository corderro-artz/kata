import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    preact(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['kata-favicon.svg'],
      manifest: {
        id: '/',
        name: 'Kata',
        short_name: 'Kata',
        description:
          'Local-first structured text parsing, visualization, and export built for large files.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait-primary',
        background_color: '#07080b',
        theme_color: '#07080b',
        categories: ['developer', 'productivity', 'utilities'],
        icons: [
          {
            src: 'kata-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
          },
          {
            src: 'kata-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
        shortcuts: [
          {
            name: 'Manual File Mode',
            short_name: 'Manual',
            description: 'Open a file directly from disk for parsing.',
            url: '/?mode=manual',
          },
          {
            name: 'Workspace Mode',
            short_name: 'Workspace',
            description: 'Open a local folder and navigate supported files.',
            url: '/?mode=workspace',
          },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,svg,webmanifest,png,ico}'],
        cleanupOutdatedCaches: true,
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  worker: {
    format: 'es',
  },
})
