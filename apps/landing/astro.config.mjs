// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

import node from "@astrojs/node";

import partytown from "@astrojs/partytown";

// https://astro.build/config
export default defineConfig({
  integrations: [react(), partytown()],
  vite: {
    plugins: [tailwindcss()],
  },
  output: "server",
  adapter: node({ mode: "standalone" }),
});
