import type { Component } from "svelte";

export interface Example {
  id: string;
  label: string;
  description: string;
  filename: string;
  component: Component;
  /** The file's own text, imported with ?raw, so the Code tab shows what renders. */
  source: string;
}

const modules = import.meta.glob<Component>("./*.svelte", { eager: true, import: "default" });
const sources = import.meta.glob<string>("./*.svelte", { eager: true, query: "?raw", import: "default" });

const meta: Omit<Example, "component" | "source">[] = [
  {
    id: "example-dashboard",
    label: "Dashboard",
    description:
      "App shell with a sidebar, metric cards, an area chart that follows the range control, and a sortable table.",
    filename: "dashboard.svelte",
  },
  {
    id: "example-tasks",
    label: "Tasks",
    description:
      "Data table with search, multi-select filters, sorting, row selection, a row menu and pagination.",
    filename: "tasks.svelte",
  },
  {
    id: "example-issues",
    label: "Issues",
    description:
      "App shell with an inset content panel, pill tabs for views, and a grouped, collapsible list.",
    filename: "issues.svelte",
  },
  {
    id: "example-login",
    label: "Login",
    description: "Centered login card with validation and a provider button.",
    filename: "login.svelte",
  },
  {
    id: "example-signup",
    label: "Sign up",
    description: "Split-screen sign-up page: brand panel on the left, form on the right.",
    filename: "signup.svelte",
  },
  {
    id: "example-settings",
    label: "Settings",
    description: "Categorized settings with search, toggles and a pinned save bar.",
    filename: "settings.svelte",
  },
  {
    id: "example-preferences",
    label: "Preferences",
    description:
      "Settings shell with a back link and search, and grouped cards of rows with selects and toggles.",
    filename: "preferences.svelte",
  },
  {
    id: "example-profile",
    label: "Profile",
    description: "Settings rows with inline text fields, an avatar, and a confirm-to-leave dialog.",
    filename: "profile.svelte",
  },
  {
    id: "example-notifications",
    label: "Notifications",
    description:
      "Channel toggles with live summaries, an event-by-channel checkbox grid, and email options.",
    filename: "notifications.svelte",
  },
  {
    id: "example-members",
    label: "Members",
    description:
      "Full-width settings page: search and role filter, grouped sortable table, and row menus.",
    filename: "members.svelte",
  },
];

export const examples: Example[] = meta.flatMap((m) => {
  const path = `./${m.filename}`;
  if (!(path in modules)) return [];
  return [{ ...m, component: modules[path]!, source: sources[path] ?? "" }];
});
