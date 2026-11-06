import { readFileSync, realpathSync } from "node:fs";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";

// The vendored kit-ui demo (src/kit-demo) imports the library as ../lib/...
// Point those at the installed package. The real path matters: the demo and
// `@kenn-io/kit-ui` must resolve to the same files or kit-ui's stores split in two.
const kitLib = `${realpathSync("node_modules/@kenn-io/kit-ui")}/src/lib/`;

export default defineConfig({
  // Pages live in src/ (index.html and plain/index.html). public/ and dist/ stay
  // at the project root, next to package.json.
  root: "src",
  publicDir: "../public",
  plugins: [
    svelte(),
    {
      // The no-Svelte gallery (src/plain/index.html) ships byte for byte. Vite would
      // run its inline <style type="text/tailwindcss"> blocks through the CSS
      // minifier, which warns about @theme/@apply and rewrites them. The dev
      // server can still serve it normally.
      name: "plain-gallery-verbatim",
      apply: "build",
      generateBundle() {
        this.emitFile({
          type: "asset",
          fileName: "plain/index.html",
          source: readFileSync("src/plain/index.html"),
        });
      },
    },
  ],
  // Relative asset URLs, so the build works from any GitHub Pages sub-path.
  base: "./",
  // Compile kit-ui's Svelte/TypeScript sources through the normal pipeline.
  optimizeDeps: { exclude: ["@kenn-io/kit-ui"] },
  resolve: { alias: [{ find: /^(?:\.\.\/)+lib\//, replacement: kitLib }] },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    // The gallery bundles every component plus Shiki and Mermaid.
    chunkSizeWarningLimit: 2500,
  },
  server: { host: "127.0.0.1", port: 5180, strictPort: true },
});
