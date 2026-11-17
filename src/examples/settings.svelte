<script lang="ts">
  import { onDestroy } from "svelte";
  import { Button } from "@ui-sdk/svelte/button";
  import { Field, FieldLabel } from "@ui-sdk/svelte/field";
  import { Input } from "@ui-sdk/svelte/input";
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

<div class="app">
  <aside class="sidebar">
    <div class="sidebar__top">
      <h1 class="workspace">Settings</h1>
    </div>
    <Input type="search" bind:value={query} placeholder="Search settings…" aria-label="Search settings" />
    <nav class="nav" aria-label="Settings">
      {#each groups as group (group)}
        <span class="nav__section">{group}</span>
        {#each visible.filter((c) => c.group === group) as category (category.id)}
          <Button
            class="nav__item"
            data-variant="ghost"
            title={category.summary}
            aria-current={active === category.id ? "page" : undefined}
            onclick={() => (active = category.id)}
          >
            {category.label}
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
        <section class="card">
          <header>
            <h2>Profile</h2>
            <p>This is how others see you on the site.</p>
          </header>
          <Field name="name">
            <FieldLabel>Name</FieldLabel>
            <Input bind:value={name} autocomplete="name" />
          </Field>
          <Field name="email">
            <FieldLabel>Email</FieldLabel>
            <Input type="email" bind:value={email} autocomplete="email" />
          </Field>
          <Field name="bio">
            <FieldLabel>Bio</FieldLabel>
            <Textarea bind:value={bio} rows={3} />
          </Field>
        </section>
      {:else if active === "notifications"}
        <section class="card">
          <header>
            <h2>Email</h2>
            <p>Choose what lands in your inbox.</p>
          </header>
          <label class="toggle-row">
            Mentions and replies
            <Switch bind:checked={mentions}><SwitchThumb /></Switch>
          </label>
          <label class="toggle-row">
            Weekly digest
            <Switch bind:checked={digest}><SwitchThumb /></Switch>
          </label>
          <label class="toggle-row">
            Product news and offers
            <Switch bind:checked={marketing}><SwitchThumb /></Switch>
          </label>
        </section>
      {:else if active === "appearance"}
        <section class="card">
          <header>
            <h2 id="theme-title">Theme</h2>
            <p>Follow your system or pick one.</p>
          </header>
          <SegmentedControl bind:value={theme} aria-labelledby="theme-title">
            <SegmentedControlIndicator />
            <SegmentedControlItem value="light">Light</SegmentedControlItem>
            <SegmentedControlItem value="dark">Dark</SegmentedControlItem>
            <SegmentedControlItem value="system">System</SegmentedControlItem>
          </SegmentedControl>
        </section>
        <section class="card">
          <header>
            <h2 id="density-title">Density</h2>
            <p>How much space lists take up.</p>
          </header>
          <SegmentedControl bind:value={density} aria-labelledby="density-title">
            <SegmentedControlIndicator />
            <SegmentedControlItem value="compact">Compact</SegmentedControlItem>
            <SegmentedControlItem value="comfortable">Comfortable</SegmentedControlItem>
          </SegmentedControl>
        </section>
      {:else if active === "security"}
        <section class="card">
          <header>
            <h2>Sign-in</h2>
            <p>Protect your account.</p>
          </header>
          <label class="toggle-row">
            Two-factor authentication
            <Switch bind:checked={twoFactor}><SwitchThumb /></Switch>
          </label>
          <div>
            <Button>Change password</Button>
          </div>
        </section>
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
    justify-content: flex-start;
    width: 100%;
    height: var(--size-sm);
    padding-inline: var(--space-2);
    font-weight: 500;
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
    display: grid;
    align-content: start;
    gap: calc(var(--ui-spacing) * 4);
    flex: 1;
    min-height: 0;
    padding: calc(var(--ui-spacing) * 6);
    overflow-y: auto;
  }

  .card {
    display: grid;
    gap: calc(var(--ui-spacing) * 4);
    max-width: 36rem;
    padding: calc(var(--ui-spacing) * 5);
    border: 1px solid var(--ui-border);
    border-radius: calc(var(--ui-radius) * 2);
  }

  .card header {
    display: grid;
    gap: calc(var(--ui-spacing) * 1);
  }

  h2 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
  }

  .card header p {
    margin: 0;
    color: var(--ui-muted-foreground);
  }

  .toggle-row {
    display: flex;
    justify-content: space-between;
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
