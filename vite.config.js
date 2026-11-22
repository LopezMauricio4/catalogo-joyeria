import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const homePreload = /\s*<link\b[^>]*\bdata-home-preload\b[^>]*>/

const storefrontHtml = {
  name: 'alpez-storefront-html',
  transformIndexHtml(html, { server, originalUrl }) {
    const pathname = originalUrl?.split('?')[0];
    return server && pathname && pathname !== '/' ? html.replace(homePreload, '') : html;
  },
  generateBundle: {
    order: 'post',
    handler(_options, bundle) {
      const index = bundle['index.html'];
      if (index?.type !== 'asset' || typeof index.source !== 'string') this.error('No se pudo generar el HTML base de Alpez.');
      this.emitFile({ type: 'asset', fileName: 'app.html', source: index.source.replace(homePreload, '') });
    },
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), storefrontHtml],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
