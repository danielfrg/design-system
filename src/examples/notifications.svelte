<script lang="ts">
  import { Button } from "@ui-sdk/svelte/button";
  import {
    BellIcon,
    CheckIcon,
    ChevronDownIcon,
    ChevronLeftIcon,
    MailIcon,
    MonitorIcon,
    SmartphoneIcon,
  } from "@lucide/svelte";
  import { Checkbox, CheckboxIndicator } from "@ui-sdk/svelte/checkbox";
  import { Field, FieldDescription, FieldLabel } from "@ui-sdk/svelte/field";
  import { Input } from "@ui-sdk/svelte/input";
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectItemIndicator,
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

  let active = $state("notifications");
  let query = $state("");
  const navGroups = $derived.by(() => {
    const q = query.trim().toLowerCase();
    const shown = categories.filter((c) => !q || `${c.label} ${c.group}`.toLowerCase().includes(q));
    return [...new Set(shown.map((c) => c.group))].map((group) => ({
      group,
      items: shown.filter((c) => c.group === group),
    }));
  });

  const channels = [
    { id: "inbox", label: "Inbox", icon: BellIcon },
    { id: "desktop", label: "Desktop", icon: MonitorIcon },
    { id: "mobile", label: "Mobile", icon: SmartphoneIcon },
    { id: "email", label: "Email", icon: MailIcon },
  ] as const;
  type Channel = (typeof channels)[number]["id"];

  let enabled = $state<Record<Channel, boolean>>({
    inbox: true,
    desktop: true,
    mobile: false,
    email: true,
  });

  // Which events reach which channel. Inbox always gets everything.
  const events = [
    { id: "assigned", label: "Assigned to me" },
    { id: "mentions", label: "Mentions" },
    { id: "comments", label: "Comments and replies" },
    { id: "status", label: "Status changes on my issues" },
    { id: "due", label: "Approaching due date" },
  ];
  let matrix = $state<Record<string, Record<Channel, boolean>>>(
    Object.fromEntries(
      events.map((e, i) => [e.id, { inbox: true, desktop: i < 3, mobile: i < 2, email: i < 2 }]),
    ),
  );

  let digest = $state("daily");
  let delay = $state("1h");
  let sidebarUpdates = $state(true);
  let changelog = $state(true);
  let marketing = $state(false);

  const digestOptions = [
    { value: "off", label: "Off" },
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
  ];
  const delayOptions = [
    { value: "0", label: "Immediately" },
    { value: "15m", label: "15 minutes" },
    { value: "1h", label: "1 hour" },
    { value: "3h", label: "3 hours" },
  ];

  function summary(id: Channel): string {
    if (!enabled[id]) return "Disabled";
    const count = events.filter((e) => matrix[e.id]![id]).length;
    return count === events.length
      ? "Enabled for all notifications"
      : `${count} of ${events.length} notification types`;
  }
</script>

{#snippet text(title: string, description: string)}
  <div class="row__text">
    <FieldLabel>{title}</FieldLabel>
    <FieldDescription>{description}</FieldDescription>
  </div>
{/snippet}

{#snippet choose(options: { value: string; label: string }[])}
  <SelectTrigger>
    <SelectValue />
    <ChevronDownIcon aria-hidden="true" />
  </SelectTrigger>
  <SelectContent align="end">
    {#each options as option (option.value)}
      <SelectItem value={option.value}>
        {option.label}
        <SelectItemIndicator>
          <CheckIcon aria-hidden="true" />
        </SelectItemIndicator>
      </SelectItem>
    {/each}
  </SelectContent>
{/snippet}

<div class="app">
  <aside class="sidebar">
    <div class="sidebar__top">
      <Button class="back" data-variant="ghost">
        <ChevronLeftIcon aria-hidden="true" /> Back to app
      </Button>
    </div>
    <Input type="search" aria-label="Search settings" placeholder="Search…" bind:value={query} />
    <nav class="nav" aria-label="Settings">
      {#each navGroups as group (group.group)}
        <span class="nav__section">{group.group}</span>
        {#each group.items as item (item.id)}
          <Button
            class="nav__item"
            data-variant="ghost"
            aria-current={active === item.id ? "page" : undefined}
            onclick={() => (active = item.id)}
          >
            {item.label}
          </Button>
        {/each}
      {:else}
        <p class="muted">No settings match.</p>
      {/each}
    </nav>
  </aside>

  <main class="main">
    {#if active === "notifications"}
      <h1>Notifications</h1>

      <section aria-labelledby="channels-title">
        <h2 id="channels-title">Notification channels</h2>
        <div class="card">
          {#each channels as channel (channel.id)}
            <Field class="setting" disabled={channel.id === "inbox"}>
              <span class="icon"><channel.icon aria-hidden="true" /></span>
              {@render text(channel.label, summary(channel.id))}
              <Switch bind:checked={enabled[channel.id]}>
                <SwitchThumb />
              </Switch>
            </Field>
          {/each}
        </div>
      </section>

      <section aria-labelledby="events-title">
        <h2 id="events-title">Notify me about</h2>
        <div class="card card--table">
          <table>
            <caption class="sr-only">Notification types by channel</caption>
            <thead>
              <tr>
                <th scope="col">Event</th>
                {#each channels as channel (channel.id)}
                  <th scope="col" class="channel">{channel.label}</th>
                {/each}
              </tr>
            </thead>
            <tbody>
              {#each events as event (event.id)}
                <tr>
                  <th scope="row">{event.label}</th>
                  {#each channels as channel (channel.id)}
                    <td class="channel">
                      <Checkbox
                        bind:checked={matrix[event.id]![channel.id]}
                        disabled={!enabled[channel.id] || channel.id === "inbox"}
                        aria-label="{event.label} by {channel.label}"
                      >
                        <CheckboxIndicator>
                          <CheckIcon aria-hidden="true" />
                        </CheckboxIndicator>
                      </Checkbox>
                    </td>
                  {/each}
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="email-title">
        <h2 id="email-title">Email</h2>
        <div class="card">
          <Field class="setting">
            {@render text("Digest", "A summary of unread notifications")}
            <Select bind:value={digest} items={digestOptions}>
              {@render choose(digestOptions)}
            </Select>
          </Field>
          <Field class="setting">
            {@render text(
              "Delay",
              "Wait before emailing, so notifications you already read are skipped",
            )}
            <Select bind:value={delay} items={delayOptions}>
              {@render choose(delayOptions)}
            </Select>
          </Field>
        </div>
      </section>

      <section aria-labelledby="updates-title">
        <h2 id="updates-title">Updates from us</h2>
        <div class="card">
          <Field class="setting">
            {@render text("Show updates in sidebar", "Highlight new features in the app sidebar")}
            <Switch bind:checked={sidebarUpdates}><SwitchThumb /></Switch>
          </Field>
          <Field class="setting">
            {@render text("Changelog newsletter", "An email about what shipped, every two weeks")}
            <Switch bind:checked={changelog}><SwitchThumb /></Switch>
          </Field>
          <Field class="setting">
            {@render text("Marketing and onboarding", "Tips, events and product announcements")}
            <Switch bind:checked={marketing}><SwitchThumb /></Switch>
          </Field>
        </div>
      </section>
    {:else}
      <p class="muted">This example only implements Notifications.</p>
    {/if}
  </main>
</div>

<style>
  .app {
    display: flex;
    align-items: stretch;
    align-self: stretch;
    width: 100%;
    height: 100%;
    /* Light: a gray sidebar. Dark: a sidebar a step darker than the page. */
    background: light-dark(var(--tint), color-mix(in oklab, var(--paper) 78%, black));
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
  }

  .sidebar__top :global(.back) {
    justify-content: flex-start;
    height: var(--size-sm);
    padding-inline: var(--space-2);
    color: var(--muted);
    font-weight: 500;
  }

  .sidebar__top :global(.back svg) {
    width: 15px;
    height: 15px;
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

  /* Main panel: flat, beside the sidebar */
  .main {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    padding: calc(var(--ui-spacing) * 10) calc(var(--ui-spacing) * 6);
    overflow: auto;
    border-inline-start: 1px solid var(--line-faint);
    background: var(--paper);
  }

  .main > :global(*) {
    width: 100%;
    max-width: 640px;
    margin-inline: auto;
  }

  h1 {
    margin: 0 auto calc(var(--ui-spacing) * 6);
    font-size: 1.5rem;
    font-weight: 500;
  }

  section {
    margin-bottom: calc(var(--ui-spacing) * 8);
  }

  h2 {
    margin: 0 0 calc(var(--ui-spacing) * 3);
    font-size: 0.875rem;
    font-weight: 600;
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

  .card--table {
    padding: var(--space-2) var(--space-4);
  }

  /* Settings rows: label and description on the left, the control at the end. */
  .card :global(.setting) {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: var(--space-3);
    width: 100%;
    max-width: none;
    padding-block: var(--space-4);
  }

  .card :global(.setting + .setting) {
    border-top: 1px solid var(--line-faint);
  }

  .row__text {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .card :global(.setting [data-slot="field-description"]) {
    margin: 0;
  }

  .card :global(.setting [data-slot="select-trigger"]) {
    width: auto;
    min-width: 7.5rem;
  }

  .icon {
    display: grid;
    place-items: center;
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    border-radius: var(--ui-radius);
    background: var(--ui-muted);
    color: var(--ui-muted-foreground);
  }

  .icon :global(svg) {
    width: 14px;
    height: 14px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
  }

  th,
  td {
    height: 44px;
    padding: 0;
    border: 0;
    text-align: start;
  }

  thead th {
    color: var(--muted);
    font-size: var(--text-sm);
    font-weight: 400;
  }

  tbody th {
    color: var(--ink);
    font-weight: 400;
  }

  th.channel,
  td.channel {
    width: 84px;
    text-align: center;
  }

  td.channel :global([data-slot="checkbox"]) {
    margin-inline: auto;
  }

  .muted {
    color: var(--ui-muted-foreground);
    font-size: 0.875rem;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
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
