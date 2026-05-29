import { resolve } from "node:path";
import { build } from "vite";

const root = process.cwd();

await build({
  configFile: resolve(root, "vite.config.mjs"),
});

await build({
  configFile: false,
  publicDir: false,
  build: {
    emptyOutDir: false,
    lib: {
      entry: resolve(root, "src/extension/content.ts"),
      name: "SweetBonanzaContent",
      formats: ["iife"],
      fileName: () => "content.js",
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});

await build({
  configFile: false,
  publicDir: false,
  build: {
    emptyOutDir: false,
    lib: {
      entry: resolve(root, "src/extension/background.ts"),
      name: "SweetBonanzaBackground",
      formats: ["iife"],
      fileName: () => "background.js",
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
