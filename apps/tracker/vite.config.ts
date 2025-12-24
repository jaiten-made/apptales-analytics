import { resolve } from "path";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    define: {
      // Use the loaded env variable or a fallback
      __API_BASE_URL__: JSON.stringify(
        env.VITE_API_BASE_URL || "https://api.apptal.es"
      ),
    },
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
          drop_console: false,
        },
        format: {
          comments: false,
        },
      },
    },
    server: {
      port: 3002,
      open: "/test/index.html",
    },
  };
});
