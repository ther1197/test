import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [react(), VitePWA({
    registerType: 'prompt',
    injectRegister: null,
    includeAssets: ['icon.svg', 'icon-180.png', 'icon-192.png', 'icon-512.png'],
    manifest: {
      id: './', name: '잠깐 집중', short_name: '잠깐 집중',
      description: '나에게 돌아오는 20분. 집중 타이머와 빠른 메모.',
      lang: 'ko', start_url: './', scope: './', display: 'standalone',
      background_color: '#f7f7ef', theme_color: '#526e3e',
      icons: [
        { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
      ],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,webmanifest}'],
      navigateFallback: 'index.html', cleanupOutdatedCaches: true, clientsClaim: true,
    },
  })],
  test: { include: ['src/**/*.test.ts'] },
});
