import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * SPA fallback plugin for static hosting environments (Render, GitHub Pages, etc.)
 * Generates 404.html and route-specific index.html copies so direct navigation
 * and browser refreshes work seamlessly even before or without server rewrites.
 */
function spaFallbackPlugin() {
  return {
    name: 'spa-fallback-plugin',
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist')
      const indexHtmlPath = path.join(distDir, 'index.html')
      if (fs.existsSync(indexHtmlPath)) {
        const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8')

        // 1. Universal 404 fallback for static web servers
        fs.writeFileSync(path.join(distDir, '404.html'), indexHtml)

        // 2. Pre-create exact directories with index.html for known routes
        const routes = ['admin', 'admin/login', 'admin/products/new']
        for (const route of routes) {
          const routeDir = path.join(distDir, route)
          fs.mkdirSync(routeDir, { recursive: true })
          fs.writeFileSync(path.join(routeDir, 'index.html'), indexHtml)
        }
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), spaFallbackPlugin()],
})
