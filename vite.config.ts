/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import Unocss from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import type { UserConfigExport } from 'vite'
import { defineConfig } from 'vite'
import Pages from 'vite-plugin-pages'
import type { VitePWAOptions } from 'vite-plugin-pwa'
import { VitePWA } from 'vite-plugin-pwa'

const pwaOptions: Partial<VitePWAOptions> = {
  registerType: 'autoUpdate',
  includeAssets: ['favicon.svg', 'safari-pinned-tab.svg'],
  manifest: {
    name: '表了个情',
    short_name: '表了个情',
    theme_color: '#ffffff',
    display: 'standalone',
    icons: [
      {
        src: 'pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: 'pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  },
  devOptions: {
    enabled: false,
  },
}

export default defineConfig(({ mode }) => {
  const options: UserConfigExport = {
    resolve: {
      alias: {
        '~/': `${path.resolve(__dirname, 'src')}/`,
      },
    },
    plugins: [
      Unocss({}),
      react(),
      Pages(),
      AutoImport({
        imports: [
          'react',
          'react-router-dom',
          'ahooks',
          'react-i18next',
        ],
        dts: true,
        dirs: [
          './src/hooks',
        ],
      }),
      VitePWA(pwaOptions),
      legacy({
        targets: ['ie >= 11'],
      }),
      visualizer({
        open: false,
      }),
    ],
    test: {
      environment: 'jsdom',
    },
  }

  if (mode === 'production') {
    options.esbuild = {
      drop: ['console', 'debugger'],
    }
    options.build = {
      minify: 'esbuild',
      target: 'es2015',
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'lodash': ['lodash-es'],
          },
        },
      },
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
      polyfillModulePreload: true,
      cssTarget: 'chrome61',
    }
  }

  return options
})
