import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir:'./e2e', testMatch:'pwa.spec.ts',
  use:{baseURL:'http://127.0.0.1:4173/test/', headless:true, launchOptions:{executablePath:'/usr/bin/chromium',args:['--no-sandbox']}},
  webServer:{command:'npx vite preview --host 127.0.0.1 --port 4173 --base /test/', url:'http://127.0.0.1:4173/test/', reuseExistingServer:true},
});
