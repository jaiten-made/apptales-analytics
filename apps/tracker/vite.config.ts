import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "AppTalesTracker",
      formats: ["es", "umd", "iife"],
      fileName: (format) => {
        if (format === "iife") return "tracker.min.js";
        return `tracker.${format}.js`;
      },
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
