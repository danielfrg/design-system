import type { Component } from "svelte";
import type { Demo } from "./demos";

export interface CustomPage {
  id: string;
  label: string;
  description: string;
  // Where the component lives, for the page's copy instructions.
  folder: string;
  demos: Demo[];
}

// Components ui-sdk doesn't ship, built for these apps. Each is a folder in
// public/v1/custom that an app copies as is.
export const customPages: CustomPage[] = [
  {
    id: "custom-table",
    label: "Table",
    description:
      "A styled native table with a caption, footer, aligned columns and optional sortable headers.",
    folder: "public/v1/custom/table",
    demos: [
      {
        file: "demo",
        heading: "Overview",
        intro: "",
        caption:
          "A caption under the table, a footer for totals, and an end-aligned amount column.",
      },
      {
        file: "sortable",
        heading: "Sortable Columns",
        intro:
          "Give a header a `sortKey` to make it sortable, bind `sort` on the Table, and sort your rows with `sortRows()`. A press cycles the first direction, the other one, then off. Headers without a `sortKey`, like an actions column, stay plain.",
        caption:
          'Press a header, then press it again. Amount starts descending with `firstDirection="desc"`.',
      },
      {
        file: "footer",
        heading: "Footer",
        intro: "Use `TableFooter` for totals. `colspan` stretches a cell across columns.",
        caption: "",
      },
      {
        file: "actions",
        heading: "Actions",
        intro:
          "Put a ui-sdk Menu in the last cell for row actions. Name the column for screen readers.",
        caption: "Open a row's menu and choose an action.",
      },
      {
        file: "empty",
        heading: "Empty State",
        intro: "When nothing matches, render one row whose cell spans every column.",
        caption: "Clear the filter to see the invoices again.",
      },
      {
        file: "rtl",
        heading: "Right to Left",
        intro:
          'Alignment and the sort arrows follow the page direction. Set `dir="rtl"` on a container.',
        caption: "",
      },
    ],
  },
  {
    id: "custom-theme-toggle",
    label: "Theme Toggle",
    description:
      "An icon-only button that cycles light, dark and system. The choice is saved under one shared localStorage key, so every app agrees.",
    folder: "public/v1/custom/theme-toggle",
    demos: [
      {
        file: "demo",
        heading: "Overview",
        intro:
          'Wrap the app in `Preferences` with the shared `colorScheme`, and add the `preferencesScript` Vite plugin so the saved choice applies before first paint (see ui-sdk\'s Add Dark Mode guide). Pass your own scheme to `ThemeToggle` to change the default, for example `createAppColorScheme({ defaultValue: "dark" })`.',
        caption:
          "Press it to cycle light, dark and system. This gallery's own switch shares the same scheme.",
      },
    ],
  },
  {
    id: "custom-status-badge",
    label: "Status Badge",
    description:
      "The theme's badge with a tone (success, warning, danger, info) and an optional leading dot, for states like Healthy or Degraded.",
    folder: "public/v1/custom/status-badge",
    demos: [
      {
        file: "demo",
        heading: "Overview",
        intro:
          "The theme has no success, warning or info colors, so the badge defines `--status-success`, `--status-warning` and `--status-info`. Override them to change a tone.",
        caption: "One badge per tone, and one without the dot.",
      },
    ],
  },
];

const modules = import.meta.glob<Component>("./custom/*/*.svelte", { import: "default" });
const sources = import.meta.glob<string>("./custom/*/*.svelte", {
  query: "?raw",
  import: "default",
});

export function loadCustomDemo(page: string, file: string) {
  const path = `./custom/${page}/${file}.svelte`;
  return { component: modules[path]!(), source: sources[path]!() };
}
