import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "AppTalesTracker",
      formats: ["iife"],
      fileName: () => "tracker.js",
    },
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
    rollupOptions: {
      output: {
        globals: {},
      },
    },
  },
  server: {
    port: 3000,
    open: "/test.html",
  },
});
