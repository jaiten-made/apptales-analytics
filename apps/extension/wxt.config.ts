import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  dev: {
    server: {
      port: 3003,
    },
  },
  manifest: {
    permissions: ["cookies", "storage"],
    host_permissions: ["http://localhost:3000/*", "http://localhost:3001/*"],
  },
});
