import type { Component } from "svelte";
import index from "./demos.json";

export interface Demo {
  file: string;
  heading: string;
  intro: string;
  caption: string;
}

const root = "./vendor/ui-sdk-examples/examples/components";
const modules = import.meta.glob<Component>(
  "./vendor/ui-sdk-examples/examples/components/*/svelte/*.svelte",
  {
    import: "default",
  },
);
const sources = import.meta.glob<string>(
  "./vendor/ui-sdk-examples/examples/components/*/svelte/*.svelte",
  {
    query: "?raw",
    import: "default",
  },
);

export const demos = index as Record<string, { dir: string; demos: Demo[] }>;

export function loadDemo(dir: string, file: string) {
  const path = `${root}/${dir}/svelte/${file}.svelte`;
  return { component: modules[path]!(), source: sources[path]!() };
}
