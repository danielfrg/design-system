<script lang="ts">
  import ChevronLeftIcon from "@lucide/svelte/icons/chevron-left";
  import { Button } from "@ui-sdk/svelte/button";
  import { Field, FieldDescription, FieldLabel } from "@ui-sdk/svelte/field";
  import { Input } from "@ui-sdk/svelte/input";
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@ui-sdk/svelte/select";
  import { Switch, SwitchThumb } from "@ui-sdk/svelte/switch";

  const categories = [
    { id: "preferences", label: "Preferences", group: "Account" },
    { id: "profile", label: "Profile", group: "Account" },
    { id: "notifications", label: "Notifications", group: "Account" },
    { id: "security", label: "Security & access", group: "Account" },
    { id: "workspace", label: "General", group: "Administration" },
    { id: "members", label: "Members", group: "Administration" },
    { id: "billing", label: "Billing", group: "Administration" },
  ];

  let active = $state("preferences");
  let query = $state("");
  const visible = $derived.by(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => `${c.label} ${c.group}`.toLowerCase().includes(q));
  });
  const groups = $derived([...new Set(visible.map((c) => c.group))]);

  let selects = $state<Record<string, string | null>>({
    homeView: "inbox",
    displayNames: "full",
    weekStart: "sunday",
    sendOn: "mod-enter",
    fontSize: "default",
    theme: "system",
  });
  let switches = $state<Record<string, boolean>>({
    emoji: true,
    pointer: false,
    underline: false,
    staticImages: false,
    openDesktop: true,
    autoAssign: false,
    assignOnStart: true,
  });

  interface Option {
    value: string;
    label: string;
  }

  type Row =
    | { kind: "select"; key: string; title: string; description: string; options: Option[] }
    | { kind: "switch"; key: string; title: string; description: string }
    | { kind: "button"; key: string; title: string; description: string; action: string };

  const sections: { id: string; title: string; rows: Row[] }[] = [
    {
      id: "general",
      title: "General",
      rows: [
        {
          kind: "select",
          key: "homeView",
          title: "Default home view",
          description: "Select which view to display when launching the app",
          options: [
            { value: "inbox", label: "Inbox" },
            { value: "my-issues", label: "My issues" },
            { value: "projects", label: "Projects" },
          ],
        },
        {
          kind: "select",
          key: "displayNames",
          title: "Display names",
          description: "Select how names are displayed in the interface",
          options: [
            { value: "full", label: "Full name" },
            { value: "username", label: "Username" },
          ],
        },
        {
          kind: "select",
          key: "weekStart",
          title: "First day of the week",
          description: "Used for date pickers",
          options: [
            { value: "sunday", label: "Sunday" },
            { value: "monday", label: "Monday" },
          ],
        },
        {
          kind: "switch",
          key: "emoji",
          title: "Convert text emoticons into emojis",
          description: "Strings like :) will be converted to 🙂",
        },
        {
          kind: "select",
          key: "sendOn",
          title: "Send comments on…",
          description: "Choose which key press is used to submit comments",
          options: [
            { value: "mod-enter", label: "⌘+Enter" },
            { value: "enter", label: "Enter" },
          ],
        },
      ],
    },
    {
      id: "interface",
      title: "Interface and theme",
      rows: [
        {
          kind: "button",
          key: "sidebar",
          title: "App sidebar",
          description: "Customize sidebar item visibility, ordering, and badge style",
          action: "Customize",
        },
        {
          kind: "select",
          key: "fontSize",
          title: "Font size",
          description: "Adjust the size of text across the app",
          options: [
            { value: "small", label: "Small" },
            { value: "default", label: "Default" },
            { value: "large", label: "Large" },
          ],
        },
        {
          kind: "switch",
          key: "pointer",
          title: "Use pointer cursors",
          description: "Change the cursor to a pointer when hovering over any interactive elements",
        },
        {
          kind: "switch",
          key: "underline",
          title: "Underline links",
          description: "Always underline links in text content",
        },
        {
          kind: "switch",
          key: "staticImages",
          title: "Disable animated images & emoji",
          description: "GIFs and animated emojis stay static and animate only on hover",
        },
        {
          kind: "select",
          key: "theme",
          title: "Interface theme",
          description: "Select or customize your interface color scheme",
          options: [
            { value: "system", label: "System preference" },
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
          ],
        },
      ],
    },
    {
      id: "desktop",
      title: "Desktop application",
      rows: [
        {
          kind: "switch",
          key: "openDesktop",
          title: "Open in desktop app",
          description: "Automatically open links in the desktop app when possible",
        },
      ],
    },
    {
      id: "automations",
      title: "Automations and workflows",
      rows: [
        {
          kind: "switch",
          key: "autoAssign",
          title: "Auto-assign to self",
          description: "When creating new issues, always assign them to yourself by default",
        },
        {
          kind: "switch",
          key: "assignOnStart",
          title: "On move to started status, assign to yourself",
          description: "When you move an unassigned issue to started, it is assigned to you",
        },
      ],
    },
  ];

  function select(event: MouseEvent, id: string) {
    event.preventDefault();
    active = id;
  }
</script>

<div class="shell">
  <aside class="sidebar">
    <div class="back">
      <Button><ChevronLeftIcon size={16} aria-hidden="true" /> Back to app</Button>
    </div>
    <Input type="search" bind:value={query} placeholder="Search…" aria-label="Search settings" />
    <nav aria-label="Settings">
      {#each groups as group (group)}
        <span class="group">{group}</span>
        {#each visible.filter((c) => c.group === group) as category (category.id)}
          <a
            href="#{category.id}"
            aria-current={active === category.id ? "page" : undefined}
            onclick={(event) => select(event, category.id)}>{category.label}</a
          >
        {/each}
      {:else}
        <p class="empty">No settings match “{query}”.</p>
      {/each}
    </nav>
  </aside>

  <main class="content">
    {#if active === "preferences"}
      <h1>Preferences</h1>
      {#each sections as section (section.id)}
        <section aria-labelledby="pref-{section.id}">
          <h2 id="pref-{section.id}">{section.title}</h2>
          <div class="card">
            {#each section.rows as row (row.key)}
              {#if row.kind === "button"}
                <div class="row">
                  <div class="row__text">
                    <span class="row__title">{row.title}</span>
                    <span class="row__description">{row.description}</span>
                  </div>
                  <Button>{row.action}</Button>
                </div>
              {:else}
                <div class="row">
                  <Field>
                    <div class="row__text">
                      <FieldLabel>{row.title}</FieldLabel>
                      <FieldDescription>{row.description}</FieldDescription>
                    </div>
                    {#if row.kind === "select"}
                      <Select items={row.options} bind:value={selects[row.key]}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent align="end">
                          {#each row.options as option (option.value)}
                            <SelectItem value={option.value}>{option.label}</SelectItem>
                          {/each}
                        </SelectContent>
                      </Select>
                    {:else}
                      <Switch bind:checked={switches[row.key]}><SwitchThumb /></Switch>
                    {/if}
                  </Field>
                </div>
              {/if}
            {/each}
          </div>
        </section>
      {/each}
    {:else}
      <p class="empty">This example only implements Preferences.</p>
    {/if}
  </main>
</div>

<style>
  .shell {
    display: grid;
    grid-template-columns: 15rem minmax(0, 1fr);
    height: 100%;
    background: var(--ui-background);
  }

  .sidebar {
    display: flex;
    flex-direction: column;
    gap: calc(var(--ui-spacing) * 3);
    min-height: 0;
    padding: calc(var(--ui-spacing) * 4) calc(var(--ui-spacing) * 3);
    overflow-y: auto;
    border-right: 1px solid var(--ui-border);
    background: color-mix(in oklab, var(--ui-muted) 50%, var(--ui-background));
  }

  .back {
    display: flex;
  }

  nav {
    display: grid;
    gap: calc(var(--ui-spacing) * 0.5);
  }

  .group {
    padding: calc(var(--ui-spacing) * 3) calc(var(--ui-spacing) * 2) calc(var(--ui-spacing) * 1);
    color: var(--ui-muted-foreground);
    font-size: 0.75rem;
    font-weight: 500;
  }

  nav a {
    padding: calc(var(--ui-spacing) * 1.5) calc(var(--ui-spacing) * 2);
    border-radius: var(--ui-radius);
    color: var(--ui-foreground);
    font-weight: 500;
    text-decoration: none;
  }

  nav a:hover,
  nav a[aria-current="page"] {
    background: var(--ui-muted);
  }

  .empty {
    margin: 0;
    padding-inline: calc(var(--ui-spacing) * 2);
    color: var(--ui-muted-foreground);
  }

  .content {
    display: grid;
    align-content: start;
    gap: calc(var(--ui-spacing) * 8);
    min-height: 0;
    padding: calc(var(--ui-spacing) * 10) calc(var(--ui-spacing) * 8);
    overflow-y: auto;
  }

  .content > * {
    width: 100%;
    max-width: 44rem;
    margin-inline: auto;
  }

  h1 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 500;
  }

  h2 {
    margin: 0 0 calc(var(--ui-spacing) * 3);
    font-size: 0.9375rem;
    font-weight: 600;
  }

  .card {
    border: 1px solid var(--ui-border);
    border-radius: calc(var(--ui-radius) * 2);
  }

  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: calc(var(--ui-spacing) * 3);
    padding: calc(var(--ui-spacing) * 3.5) calc(var(--ui-spacing) * 4);
  }

  .row + .row {
    border-top: 1px solid var(--ui-border);
  }

  .row__text {
    display: grid;
    gap: calc(var(--ui-spacing) * 0.75);
    min-width: 0;
  }

  .row__title,
  .row__description {
    font-size: calc(var(--ui-font-size) - 0.0625rem);
  }

  .row__title {
    font-weight: 500;
  }

  .row__description {
    color: var(--ui-muted-foreground);
  }

  @container (max-width: 640px) {
    .shell {
      grid-template-columns: 1fr;
      grid-template-rows: auto minmax(0, 1fr);
    }

    .sidebar {
      max-height: 14rem;
      border-right: 0;
      border-bottom: 1px solid var(--ui-border);
    }

    .content {
      padding: calc(var(--ui-spacing) * 6) calc(var(--ui-spacing) * 4);
    }
  }
</style>
