import type { Component } from "svelte";
import dashboard from "./dashboard.svelte";
import dashboardSource from "./dashboard.svelte?raw";
import issues from "./issues.svelte";
import issuesSource from "./issues.svelte?raw";
import login from "./login.svelte";
import loginSource from "./login.svelte?raw";
import members from "./members.svelte";
import membersSource from "./members.svelte?raw";
import notifications from "./notifications.svelte";
import notificationsSource from "./notifications.svelte?raw";
import preferences from "./preferences.svelte";
import preferencesSource from "./preferences.svelte?raw";
import profile from "./profile.svelte";
import profileSource from "./profile.svelte?raw";
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
    id: "example-issues",
    label: "Issues",
    description:
      "App shell with an inset content panel, pill tabs for views, and a grouped, collapsible list.",
    filename: "issues.svelte",
    component: issues,
    source: issuesSource,
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
  {
    id: "example-preferences",
    label: "Preferences",
    description:
      "Settings shell with a back link and search, and grouped cards of rows with selects and toggles.",
    filename: "preferences.svelte",
    component: preferences,
    source: preferencesSource,
  },
  {
    id: "example-profile",
    label: "Profile",
    description: "Settings rows with inline text fields, an avatar, and a confirm-to-leave dialog.",
    filename: "profile.svelte",
    component: profile,
    source: profileSource,
  },
  {
    id: "example-notifications",
    label: "Notifications",
    description:
      "Channel toggles with live summaries, an event-by-channel checkbox grid, and email options.",
    filename: "notifications.svelte",
    component: notifications,
    source: notificationsSource,
  },
  {
    id: "example-members",
    label: "Members",
    description:
      "Full-width settings page: search and role filter, grouped sortable table, and row menus.",
    filename: "members.svelte",
    component: members,
    source: membersSource,
  },
];
