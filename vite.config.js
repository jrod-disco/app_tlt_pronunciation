import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  // `public/assets` → repo `assets/` (symlink) keeps URLs like `assets/audio/...`
  publicDir: "public",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: "index.html",
    },
  },
  server: {
    port: 3030,
    strictPort: false,
    open: true,
    host: "127.0.0.1",
  },
  preview: {
    port: 3030,
    strictPort: false,
    host: "127.0.0.1",
  },
});
