import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/main.ts",
      formats: ["iife"],
      name: "Zetonic",
      fileName: () => "script.js",
    },
    outDir: "dist",
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) =>
          assetInfo.name === "style.css" ? "style.css" : "[name][extname]",
      },
    },
    sourcemap: true,
    target: "es2020",
  },
});
