import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/server.ts"],
  format: ["esm"],
  dts: false,
  clean: true,
  outDir: "dist",
  outExtension() {
    return {
      js: ".js",
    };
  },
  shims: true,
});
