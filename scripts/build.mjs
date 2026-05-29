import { copyFile, mkdir, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { build } from "vite";

const root = process.cwd();

async function copyTesseractAssets() {
  const workerSource = resolve(root, "node_modules/tesseract.js/dist/worker.min.js");
  const workerTargetDirectory = resolve(root, "dist/tesseract");
  const workerTarget = resolve(workerTargetDirectory, "worker.min.js");
  const coreSourceDirectory = resolve(root, "node_modules/tesseract.js-core");
  const coreTargetDirectory = resolve(root, "dist/tesseract-core");
  const coreFiles = await readdir(coreSourceDirectory);

  await mkdir(workerTargetDirectory, { recursive: true });
  await mkdir(coreTargetDirectory, { recursive: true });
  await copyFile(workerSource, workerTarget);
  await Promise.all(
    coreFiles
      .filter((file) => file.startsWith("tesseract-core"))
      .map((file) => copyFile(join(coreSourceDirectory, file), join(coreTargetDirectory, file)))
  );
}

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

await copyTesseractAssets();

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
