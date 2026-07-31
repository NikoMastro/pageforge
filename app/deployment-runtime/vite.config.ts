import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import process from 'node:process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function reassembleChunks(prefix: string): any | null {
  const total = process.env[`_${prefix}_TOTAL`];
  if (!total) return null;

  const numChunks = parseInt(total, 10);
  let json = '';

  for (let i = 1; i <= numChunks; i++) {
    const chunk = process.env[`_${prefix}_${i}`];
    if (!chunk) throw new Error(`Missing ${prefix} chunk ${i}`);
    json += chunk;
  }

  return JSON.parse(json);
}

function injectPageData(): Plugin {
  return {
    name: 'inject-page-data',
    transformIndexHtml() {
      const rawData = reassembleChunks('JSON_CONFIG');

      if (!rawData) {
        throw new Error('No configuration found. Set _JSON_CONFIG_* environment variables.');
      }

      const type = process.env._CONTENT_TYPE;

      if (!type || type === '') {
        throw new Error('No content type specified. Set _CONTENT_TYPE environment variable.');
      }

      const data = type === 'lp' && rawData.landingPageData
        ? rawData.landingPageData
        : rawData;

      const pageData = {
        type,
        data,
        meta: {
          title: type === 'lp'
            ? (rawData.page_name || data.metadata?.title || data.settings?.title || 'Landing Page')
            : (data.meta?.title || 'LinkBio Page'),
          description: type === 'lp'
            ? (data.metadata?.description || data.settings?.description || '')
            : (data.meta?.description || ''),
        },
      };

      const escapedJson = JSON.stringify(pageData)
        .replace(/</g, '\\u003c')
        .replace(/>/g, '\\u003e')
        .replace(/&/g, '\\u0026');

      return [
        {
          tag: 'script',
          injectTo: 'head',
          children: `window.__PAGE_DATA__=${escapedJson};`,
        },
      ];
    },
  };
}

export default defineConfig({
  plugins: [react(), injectPageData()],
  base: './',
  define: {
    'import.meta.env.VITE_CONTENT_TYPE': JSON.stringify(process.env._CONTENT_TYPE || ''),
  },
  resolve: {
    alias: {
      '@pageforge/static-websites': path.resolve(__dirname, '../static-websites/components'),
    },
    dedupe: ['react', 'react-dom'],
    preserveSymlinks: true,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@emotion/react', '@emotion/styled'],
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
});
