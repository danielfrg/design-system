<script lang="ts">
  import { Button } from "@ui-sdk/svelte/button";
  import {
    BellIcon,
    CheckIcon,
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

<div class="settings">
  <aside class="sidebar">
    <Button>
      <ChevronLeftIcon aria-hidden="true" /> Back to app
    </Button>
    <Input type="search" aria-label="Search settings" placeholder="Search…" bind:value={query} />
    <nav aria-label="Settings">
      {#each navGroups as group (group.group)}
        <span class="nav__group">{group.group}</span>
        {#each group.items as item (item.id)}
          <Button
            aria-current={active === item.id ? "page" : undefined}
            onclick={() => (active = item.id)}
          
    data-variant={active === item.id ? "solid" : undefined}>
            {item.label}
          </Button>
        {/each}
      {:else}
        <p class="muted">No settings match.</p>
      {/each}
    </nav>
  </aside>

  <main class="panel">
    {#if active === "notifications"}
      <h1>Notifications</h1>

      <section aria-labelledby="channels-title">
        <h2 id="channels-title">Notification channels</h2>
        <div class="card">
          {#each channels as channel (channel.id)}
            <Field disabled={channel.id === "inbox"}>
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
        <div class="card">
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
          <Field>
            {@render text("Digest", "A summary of unread notifications")}
            <Select bind:value={digest} items={digestOptions}>
              {@render choose(digestOptions)}
            </Select>
          </Field>
          <Field>
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
          <Field>
            {@render text("Show updates in sidebar", "Highlight new features in the app sidebar")}
            <Switch bind:checked={sidebarUpdates}><SwitchThumb /></Switch>
          </Field>
          <Field>
            {@render text("Changelog newsletter", "An email about what shipped, every two weeks")}
            <Switch bind:checked={changelog}><SwitchThumb /></Switch>
          </Field>
          <Field>
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
  .settings {
    display: flex;
    height: 100%;
    background: var(--ui-background);
    color: var(--ui-foreground);
  }

  .sidebar {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    gap: calc(var(--ui-spacing) * 3);
    width: 232px;
    padding: calc(var(--ui-spacing) * 3);
    overflow-y: auto;
    border-inline-end: 1px solid var(--ui-border);
    background: var(--ui-muted);
  }

  nav {
    display: grid;
    gap: 1px;
  }

  .nav__group {
    margin-top: calc(var(--ui-spacing) * 2);
    padding: 0 calc(var(--ui-spacing) * 2) 4px;
    color: var(--ui-muted-foreground);
    font-size: 0.75rem;
    font-weight: 500;
  }

  .panel {
    flex: 1;
    min-width: 0;
    padding: calc(var(--ui-spacing) * 10) calc(var(--ui-spacing) * 6);
    overflow-y: auto;
  }

  .panel > :global(*) {
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
    display: grid;
    border: 1px solid var(--ui-border);
    border-radius: calc(var(--ui-radius) * 2);
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
    height: calc(var(--ui-spacing) * 10);
    padding: 0 calc(var(--ui-spacing) * 4);
    text-align: start;
  }

  thead th {
    border-bottom: 1px solid var(--ui-border);
    color: var(--ui-muted-foreground);
    font-size: 0.75rem;
    font-weight: 500;
  }

  tbody th {
    font-weight: 500;
  }

  .channel {
    width: 72px;
    padding: 0;
    text-align: center;
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

  @container (max-width: 700px) {
    .sidebar {
      display: none;
    }
  }
</style>
