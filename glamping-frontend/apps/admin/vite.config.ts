import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'
import path from 'path'

function adminRedirect() {
  return {
    name: 'admin-redirect',
    configureServer(server: any) {
      server.middlewares.use((req: any, _res: any, next: any) => {
        if (req.url === '/' || req.url === '') {
          req.url = '/admin/'
        }
        next()
      })
    },
  }
}

export default defineConfig({
  base: '/admin/',
  plugins: [
    react(),
    legacy({
      targets: ['Chrome >= 51'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
    }),
    adminRedirect(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2015',
  },
  server: {
    port: 5174,
    host: true,
    proxy: {
      '/api': 'http://localhost:3000',
      '/socket.io': { target: 'http://localhost:3000', ws: true },
    },
  },
})
