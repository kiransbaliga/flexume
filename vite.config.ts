import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The Ollama server runs on http://localhost:11434.
// We proxy /ollama/* -> http://localhost:11434/* so the browser never makes a
// cross-origin request (avoids any CORS configuration on the Ollama side).
//
// `base` is '/flexume/' for production builds (GitHub Pages serves the project
// site under that path) and '/' during local dev.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/flexume/' : '/',
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/ollama': {
        target: 'http://localhost:11434',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ollama/, ''),
      },
    },
  },
}))
