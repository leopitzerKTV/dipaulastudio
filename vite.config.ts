import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    port: 8080,
    strictPort: true,
  },
  build: {
    sourcemap: true,
    outDir: ".output/public",
  },
  resolve: {
    alias: {
      "@": "/src",
    },
    tsconfigPaths: true,
  },
});
