import { fileURLToPath } from "node:url";
import { preferencesScript } from "@ui-sdk/core";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";
import { colorScheme } from "./src/gallery/color-scheme";

export default defineConfig({
  // The page lives in src/. public/ and dist/ stay
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
  ],
  // Relative asset URLs, so the build works from any GitHub Pages sub-path.
  base: "./",
  // Custom components live in public/v1/custom so apps can copy them; demos import them
  // the way an app would import its copy.
  resolve: {
    alias: { "@custom": fileURLToPath(new URL("./public/v1/custom", import.meta.url)) },
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    chunkSizeWarningLimit: 2500,
  },
  server: { host: "127.0.0.1", port: 5180, strictPort: true },
});
