import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import { VitePWA } from 'vite-plugin-pwa'

function normalizeBase(basePath: string): string {
  const withLeadingSlash = basePath.startsWith('/') ? basePath : `/${basePath}`
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`
}

function resolveAppBase(): string {
  const explicitBase = process.env.VITE_APP_BASE?.trim()
  if (explicitBase) {
    return normalizeBase(explicitBase)
  }
  return '/'
}

const appBase = resolveAppBase()

export default defineConfig({
  base: appBase,
  plugins: [
    preact(),
    VitePWA({
      base: appBase,
      scope: appBase,
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['kata-favicon.svg'],
      manifest: {
        id: appBase,
        name: 'Kata',
        short_name: 'Kata',
        description:
          'Local-first structured text parsing, visualization, and export built for large files.',
        start_url: appBase,
        scope: appBase,
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
            url: `${appBase}?mode=manual`,
          },
          {
            name: 'Workspace Mode',
            short_name: 'Workspace',
            description: 'Open a local folder and navigate supported files.',
            url: `${appBase}?mode=workspace`,
          },
        ],
      },
      workbox: {
        navigateFallback: `${appBase}index.html`,
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
