import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, import.meta.dirname, '')
  const proxyTarget = env.VITE_PROXY_TARGET || 'http://localhost:8080'

  return {
    plugins: [react()],
    resolve: {
      // Standardizing the alias for cleaner imports across your refined UI
      alias: {
        '@': resolve(import.meta.dirname, 'src'),
        '@ui': resolve(import.meta.dirname, 'src/components/ui'),
      },
    },
    server: {
      port: 3000,
      strictPort: true, // Prevents jumping to a random port if 3000 is busy
      host: true,       // Helpful for testing the UI on mobile devices in your network
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      sourcemap: true, // Easier debugging for your logic while refining UI
      rollupOptions: {
        output: {
          // Manual chunks help with caching your UI library separately from logic
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
          },
        },
      },
      // Modern browsers support better compression and faster JS execution
      target: 'esnext',
    },
  }
})
