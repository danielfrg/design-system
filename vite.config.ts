import { readFileSync } from "node:fs";
import { preferencesScript } from "@ui-sdk/core";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";
import { colorScheme } from "./src/gallery/color-scheme";

export default defineConfig({
  // Pages live in src/ (index.html and plain/index.html). public/ and dist/ stay
  // at the project root, next to package.json.
  root: "src",
  publicDir: "../public",
  plugins: [
    svelte(),
    {
      // Applies the saved color scheme before the app loads, so dark never flashes light.
      name: "preferences-script",
      transformIndexHtml: () => [
        { tag: "script", children: preferencesScript([colorScheme]), injectTo: "head-prepend" },
      ],
    },
    {
      // The no-Svelte gallery (src/plain/index.html) ships byte for byte. Vite would
      // run its inline <style type="text/tailwindcss"> blocks through the CSS
      // minifier, which warns about @theme/@apply and rewrites them.
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
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    chunkSizeWarningLimit: 2500,
  },
  server: { host: "127.0.0.1", port: 5180, strictPort: true },
});
