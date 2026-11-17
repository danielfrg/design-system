<script lang="ts">
  import { SearchIcon } from "@lucide/svelte";
  import { onDestroy } from "svelte";
  import { Button } from "@ui-sdk/svelte/button";
  import { Field, FieldLabel } from "@ui-sdk/svelte/field";
  import { Input, InputGroup } from "@ui-sdk/svelte/input";
  import {
    SegmentedControl,
    SegmentedControlIndicator,
    SegmentedControlItem,
  } from "@ui-sdk/svelte/segmented-control";
  import { Switch, SwitchThumb } from "@ui-sdk/svelte/switch";
  import { Textarea } from "@ui-sdk/svelte/textarea";
  import { Toast, ToastRegion, ToastTitle, createToaster } from "@ui-sdk/svelte/toast";

  interface Category {
    id: string;
    label: string;
    group: string;
    summary: string;
  }

  const categories: Category[] = [
    { id: "profile", label: "Profile", group: "Account", summary: "Name, email and avatar" },
    { id: "notifications", label: "Notifications", group: "Account", summary: "What we email you" },
    { id: "appearance", label: "Appearance", group: "Workspace", summary: "Theme and density" },
    { id: "security", label: "Security", group: "Workspace", summary: "Password and sessions" },
  ];

  let active = $state("profile");
  let query = $state("");
  const visible = $derived.by(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => `${c.label} ${c.group} ${c.summary}`.toLowerCase().includes(q));
  });
  const groups = $derived([...new Set(visible.map((c) => c.group))]);

  let name = $state("Ada Lovelace");
  let email = $state("ada@example.com");
  let bio = $state("Building the analytical engine.");
  let mentions = $state(true);
  let digest = $state(true);
  let marketing = $state(false);
  let theme = $state<string | null>("system");
  let density = $state<string | null>("comfortable");
  let twoFactor = $state(false);

  const toast = createToaster();
  onDestroy(() => toast.dismiss());
</script>

{#snippet heading(title: string, description: string)}
  <header class="heading">
    <h2>{title}</h2>
    <p>{description}</p>
  </header>
{/snippet}

<div class="app">
  <aside class="sidebar">
    <div class="sidebar__top">
      <h1 class="workspace">Settings</h1>
    </div>
    <InputGroup class="search">
      <SearchIcon aria-hidden="true" />
      <Input type="search" bind:value={query} placeholder="Search settings…" aria-label="Search settings" />
    </InputGroup>
    <nav class="nav" aria-label="Settings">
      {#each groups as group (group)}
        <span class="nav__section">{group}</span>
        {#each visible.filter((c) => c.group === group) as category (category.id)}
          <Button
            class="nav__item"
            data-variant="ghost"
            aria-current={active === category.id ? "page" : undefined}
            onclick={() => (active = category.id)}
          >
            <span class="nav__label">{category.label}</span>
            <span class="nav__summary">{category.summary}</span>
          </Button>
        {/each}
      {:else}
        <p class="empty">No settings match “{query}”.</p>
      {/each}
    </nav>
  </aside>

  <div class="main">
    <div class="content">
      {#if active === "profile"}
        {@render heading("Profile", "This is how others see you on the site.")}
        <div class="card">
          <Field name="name" class="row">
            <FieldLabel>Name</FieldLabel>
            <Input bind:value={name} autocomplete="name" />
          </Field>
          <Field name="email" class="row">
            <FieldLabel>Email</FieldLabel>
            <Input type="email" bind:value={email} autocomplete="email" />
          </Field>
          <Field name="bio" class="row">
            <FieldLabel>Bio</FieldLabel>
            <Textarea bind:value={bio} rows={1} />
          </Field>
        </div>
      {:else if active === "notifications"}
        {@render heading("Email", "Choose what lands in your inbox.")}
        <div class="card">
          <Field class="row">
            <FieldLabel>Mentions and replies</FieldLabel>
            <Switch bind:checked={mentions}><SwitchThumb /></Switch>
          </Field>
          <Field class="row">
            <FieldLabel>Weekly digest</FieldLabel>
            <Switch bind:checked={digest}><SwitchThumb /></Switch>
          </Field>
          <Field class="row">
            <FieldLabel>Product news and offers</FieldLabel>
            <Switch bind:checked={marketing}><SwitchThumb /></Switch>
          </Field>
        </div>
      {:else if active === "appearance"}
        {@render heading("Appearance", "Follow your system or pick a theme, and choose how dense lists are.")}
        <div class="card">
          <div class="row">
            <span id="theme-title" class="row__label">Theme</span>
            <SegmentedControl bind:value={theme} aria-labelledby="theme-title">
              <SegmentedControlIndicator />
              <SegmentedControlItem value="light">Light</SegmentedControlItem>
              <SegmentedControlItem value="dark">Dark</SegmentedControlItem>
              <SegmentedControlItem value="system">System</SegmentedControlItem>
            </SegmentedControl>
          </div>
          <div class="row">
            <span id="density-title" class="row__label">Density</span>
            <SegmentedControl bind:value={density} aria-labelledby="density-title">
              <SegmentedControlIndicator />
              <SegmentedControlItem value="compact">Compact</SegmentedControlItem>
              <SegmentedControlItem value="comfortable">Comfortable</SegmentedControlItem>
            </SegmentedControl>
          </div>
        </div>
      {:else if active === "security"}
        {@render heading("Sign-in", "Protect your account.")}
        <div class="card">
          <Field class="row">
            <FieldLabel>Two-factor authentication</FieldLabel>
            <Switch bind:checked={twoFactor}><SwitchThumb /></Switch>
          </Field>
          <div class="row">
            <span class="row__label">Password</span>
            <div><Button>Change password</Button></div>
          </div>
        </div>
      {/if}
    </div>

    <footer class="save-bar">
      <Button data-variant="solid" onclick={() => toast.success("Settings saved")}>Save changes</Button>
    </footer>
  </div>
</div>

<ToastRegion toaster={toast}>
  <Toast>
    <ToastTitle />
  </Toast>
</ToastRegion>

<style>
  .app {
    display: flex;
    align-items: stretch;
    align-self: stretch;
    width: 100%;
    height: 100%;
    background: var(--tint);
    color: var(--ink);
  }

  /* Sidebar */
  .sidebar {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    width: 220px;
    flex-shrink: 0;
    padding: var(--space-3) var(--space-2);
    font-size: var(--text-sm);
  }

  .sidebar__top {
    display: flex;
    align-items: center;
    gap: 2px;
    padding-inline: var(--space-1);
  }

  .workspace {
    display: flex;
    flex: 1;
    align-items: center;
    gap: var(--space-2);
    margin: 0;
    font-size: var(--text-md);
    font-weight: 600;
  }

  .nav {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .nav :global(.nav__item) {
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 1px;
    width: 100%;
    height: auto;
    padding: var(--space-1) var(--space-2);
    font-weight: 500;
    text-align: start;
  }

  .nav__summary {
    color: var(--muted);
    font-size: var(--text-xs);
    font-weight: 400;
  }

  .nav :global(.nav__item:not([aria-current])) {
    color: var(--muted);
  }

  .nav :global(.nav__item[aria-current]) {
    background: var(--line-faint);
  }

  .nav__section {
    margin-top: var(--space-4);
    padding: 0 var(--space-2) var(--space-1);
    color: var(--muted);
    font-size: var(--text-xs);
    font-weight: 500;
  }

  .nav__section:first-child {
    margin-top: var(--space-1);
  }

  .empty {
    margin: 0;
    padding-inline: var(--space-2);
    color: var(--muted);
    font-size: var(--text-xs);
  }

  /* Main panel: flat, beside the sidebar */
  .main {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    overflow: auto;
    border-inline-start: 1px solid var(--line-faint);
    background: var(--paper);
  }

  .content {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: var(--space-3);
    width: 100%;
    max-width: 46rem;
    min-height: 0;
    margin-inline: auto;
    padding: calc(var(--space-8) * 2) var(--space-6) var(--space-6);
    overflow-y: auto;
  }

  .heading {
    display: grid;
    gap: 2px;
    padding-inline: var(--space-4);
  }

  h2 {
    margin: 0;
    font-size: var(--text-lg);
    font-weight: 500;
  }

  .heading p {
    margin: 0;
    color: var(--muted);
  }

  .card {
    display: flex;
    flex-direction: column;
    padding-inline: var(--space-4);
    border: 1px solid var(--line-faint);
    border-radius: var(--radius-surface);
    background: var(--surface-1);
    box-shadow: var(--shadow-drop);
  }

  /* A label column and a control column, one setting per row. */
  .card :global(.row),
  .row {
    display: grid;
    grid-template-columns: 11rem minmax(0, 1fr);
    align-items: center;
    gap: var(--space-4);
    width: 100%;
    max-width: none;
    padding-block: var(--space-3);
  }

  .card :global(.row + .row) {
    border-top: 1px solid var(--line-faint);
  }

  .card :global(.row [data-slot="field-label"]),
  .row__label {
    color: var(--muted);
    font-weight: 400;
  }

  .card :global(.row :is([data-slot="input"], [data-slot="textarea"])) {
    width: 100%;
    max-width: 32rem;
  }

  .card :global(.row [data-slot="textarea"]) {
    min-height: 0;
    resize: vertical;
  }

  .card :global(.row :is([data-slot="switch"], [data-slot="segmented-control"])) {
    justify-self: start;
  }

  .save-bar {
    display: flex;
    justify-content: flex-end;
    padding: calc(var(--ui-spacing) * 3) calc(var(--ui-spacing) * 6);
    border-top: 1px solid var(--ui-border);
    background: var(--ui-background);
  }

  @container (max-width: 640px) {
    .sidebar {
      display: none;
    }

    .main {
      border-inline-start: 0;
    }
  }
</style>
