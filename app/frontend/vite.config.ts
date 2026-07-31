import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  css: {
    transformer: "postcss",
    postcss: path.resolve(__dirname, "./postcss.config.cjs"),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@services": path.resolve(__dirname, "./src/services"),
      "@types": path.resolve(__dirname, "./src/types"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@contexts": path.resolve(__dirname, "./src/contexts"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@static-websites": path.resolve(__dirname, "../static-websites/components"),
      "@builders/landingPages": path.resolve(__dirname, "./src/builders/landingPages"),
      "@builders/linkbio": path.resolve(__dirname, "./src/builders/linkbio"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3002",
        changeOrigin: true,
      },
      "/data/render": {
        target: "http://localhost:3002",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/data\/render/, "/data/render"),
      },
      "/data/urls": {
        target: "http://localhost:3002",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/data\/urls/, "/data/urls"),
      },
    },
  },
  build: {
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Disable manual chunks to avoid initialization order issues
        // Let Vite handle chunking automatically
        manualChunks: undefined,
      },
      // Force Rollup to use JS implementation instead of native binaries
      external: (id) => {
        // Don't externalize rollup native modules, let them fall back to JS
        if (id.includes('@rollup/rollup-linux')) return false;
        return false;
      },
    },
    // Output to frontend/dist so Docker can serve it directly
    outDir: path.resolve(__dirname, "./dist"),
  },
});
