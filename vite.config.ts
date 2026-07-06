import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves this app from /woori/, but Vercel (and local dev)
  // serve it from the domain root — only apply the /woori/ base when the
  // GitHub Actions workflow explicitly asks for it.
  base: process.env.GITHUB_PAGES === 'true' ? '/woori/' : '/',
  plugins: [react()],
})
