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
  },
  server: {
    port: 3002,
    open: "/test/index.html",
  },
});
