import type { Component } from "svelte";
import dashboard from "./dashboard.svelte";
import dashboardSource from "./dashboard.svelte?raw";
import login from "./login.svelte";
import loginSource from "./login.svelte?raw";
import settings from "./settings.svelte";
import settingsSource from "./settings.svelte?raw";
import signup from "./signup.svelte";
import signupSource from "./signup.svelte?raw";
import tasks from "./tasks.svelte";
import tasksSource from "./tasks.svelte?raw";

export interface Example {
  id: string;
  label: string;
  description: string;
  filename: string;
  component: Component;
  /** The file's own text, imported with ?raw, so the Code tab shows what renders. */
  source: string;
}

export const examples: Example[] = [
  {
    id: "example-dashboard",
    label: "Dashboard",
    description:
      "App shell with a sidebar, metric cards, an area chart that follows the range control, and a sortable table.",
    filename: "dashboard.svelte",
    component: dashboard,
    source: dashboardSource,
  },
  {
    id: "example-tasks",
    label: "Tasks",
    description:
      "Data table with search, multi-select filters, sorting, row selection, a row menu and pagination.",
    filename: "tasks.svelte",
    component: tasks,
    source: tasksSource,
  },
  {
    id: "example-login",
    label: "Login",
    description: "Centered login card with validation and a provider button.",
    filename: "login.svelte",
    component: login,
    source: loginSource,
  },
  {
    id: "example-signup",
    label: "Sign up",
    description: "Split-screen sign-up page: brand panel on the left, form on the right.",
    filename: "signup.svelte",
    component: signup,
    source: signupSource,
  },
  {
    id: "example-settings",
    label: "Settings",
    description: "Categorized settings with search, toggles and a pinned save bar.",
    filename: "settings.svelte",
    component: settings,
    source: settingsSource,
  },
];
