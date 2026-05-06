import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// В dev фронт ходит к бэку через /api → http://localhost:8080.
// /uploads/* — статические картинки товаров с бэка.
// В prod nginx сам проксирует /api/* и /uploads/* на backend-контейнер.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:8080';

  return {
    plugins: [react()],
    server: {
      port: 3000,
      open: true,
      proxy: {
        '/api':     { target: apiTarget, changeOrigin: true, secure: false },
        '/uploads': { target: apiTarget, changeOrigin: true, secure: false },
      },
    },
  };
});
