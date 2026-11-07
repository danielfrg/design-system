<script lang="ts">
  import {
    Checkbox,
    SearchInput,
    SelectDropdown,
    SettingsLayout,
    SettingsSection,
    Toggle,
    type SettingsCategory,
  } from "@kenn-io/kit-ui";
  import BellIcon from "@lucide/svelte/icons/bell";
  import ChevronLeftIcon from "@lucide/svelte/icons/chevron-left";
  import MailIcon from "@lucide/svelte/icons/mail";
  import MonitorIcon from "@lucide/svelte/icons/monitor";
  import SmartphoneIcon from "@lucide/svelte/icons/smartphone";

  const categories: SettingsCategory[] = [
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
  const visible = $derived.by(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => `${c.label} ${c.group}`.toLowerCase().includes(q));
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
  let changelog = $state(true);
  let sidebarUpdates = $state(true);
  let marketing = $state(false);

  function summary(id: Channel): string {
    if (!enabled[id]) return "Disabled";
    const count = events.filter((e) => matrix[e.id]![id]).length;
    return count === events.length
      ? "Enabled for all notifications"
      : `${count} of ${events.length} notification types`;
  }
</script>

<div class="host">
  <SettingsLayout categories={visible} bind:active title="">
    {#snippet sidebarHeader()}
      <button class="back kit-control-states" type="button">
        <ChevronLeftIcon size={14} aria-hidden="true" /> Back to app
      </button>
      <SearchInput bind:value={query} size="sm" block placeholder="Search…" />
    {/snippet}

    {#snippet panel(id)}
      {#if id === "notifications"}
        <h1 class="title">Notifications</h1>

        <SettingsSection title="Notification channels">
          {#each channels as channel (channel.id)}
            <div class="row">
              <span class="row__lead">
                <span class="icon"><channel.icon size={14} aria-hidden="true" /></span>
                <span class="row__text">
                  <span class="row__title">{channel.label}</span>
                  <span class="row__description">{summary(channel.id)}</span>
                </span>
              </span>
              <Toggle
                bind:checked={enabled[channel.id]}
                ariaLabel="{channel.label} notifications"
                disabled={channel.id === "inbox"}
              />
            </div>
          {/each}
        </SettingsSection>

        <SettingsSection title="Notify me about">
          <div class="grid" role="table" aria-label="Notification types by channel">
            <div class="grid__head" role="row">
              <span role="columnheader">Event</span>
              {#each channels as channel (channel.id)}
                <span role="columnheader" class="grid__channel">{channel.label}</span>
              {/each}
            </div>
            {#each events as event (event.id)}
              <div class="grid__row" role="row">
                <span role="cell" class="row__title">{event.label}</span>
                {#each channels as channel (channel.id)}
                  <span role="cell" class="grid__channel">
                    <Checkbox
                      bind:checked={matrix[event.id]![channel.id]}
                      disabled={!enabled[channel.id] || channel.id === "inbox"}
                      ariaLabel="{event.label} by {channel.label}"
                    />
                  </span>
                {/each}
              </div>
            {/each}
          </div>
        </SettingsSection>

        <SettingsSection title="Email">
          <div class="row">
            <span class="row__text">
              <span class="row__title">Digest</span>
              <span class="row__description">A summary of unread notifications</span>
            </span>
            <SelectDropdown
              value={digest}
              onchange={(v) => (digest = v)}
              align="end"
              options={[
                { value: "off", label: "Off" },
                { value: "daily", label: "Daily" },
                { value: "weekly", label: "Weekly" },
              ]}
            />
          </div>
          <div class="row">
            <span class="row__text">
              <span class="row__title">Delay</span>
              <span class="row__description">
                Wait before emailing, so notifications you already read are skipped
              </span>
            </span>
            <SelectDropdown
              value={delay}
              onchange={(v) => (delay = v)}
              align="end"
              options={[
                { value: "0", label: "Immediately" },
                { value: "15m", label: "15 minutes" },
                { value: "1h", label: "1 hour" },
                { value: "3h", label: "3 hours" },
              ]}
            />
          </div>
        </SettingsSection>

        <SettingsSection title="Updates from us">
          <div class="row">
            <span class="row__text">
              <span class="row__title">Show updates in sidebar</span>
              <span class="row__description">Highlight new features in the app sidebar</span>
            </span>
            <Toggle bind:checked={sidebarUpdates} ariaLabel="Show updates in sidebar" />
          </div>
          <div class="row">
            <span class="row__text">
              <span class="row__title">Changelog newsletter</span>
              <span class="row__description">An email about what shipped, every two weeks</span>
            </span>
            <Toggle bind:checked={changelog} ariaLabel="Changelog newsletter" />
          </div>
          <div class="row">
            <span class="row__text">
              <span class="row__title">Marketing and onboarding</span>
              <span class="row__description">Tips, events and product announcements</span>
            </span>
            <Toggle bind:checked={marketing} ariaLabel="Marketing and onboarding" />
          </div>
        </SettingsSection>
      {:else}
        <p class="placeholder">This example only implements Notifications.</p>
      {/if}
    {/snippet}
  </SettingsLayout>
</div>

<style>
  .host {
    display: flex;
    height: 100%;
  }

  .back {
    display: flex;
    align-items: center;
    gap: 6px;
    min-height: 28px;
    padding: 0 8px;
    border: 0;
    border-radius: 8px;
    background: transparent;
    color: var(--text-secondary);
    font: inherit;
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    cursor: pointer;
  }

  .back:hover {
    background: var(--bg-surface-hover);
    color: var(--text-primary);
  }

  .title {
    margin: 0 0 -8px;
    padding: 0 16px;
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-medium);
  }

  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .row__lead {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }

  .icon {
    display: grid;
    place-items: center;
    width: 28px;
    height: 28px;
    flex-shrink: 0;
    border-radius: 8px;
    background: var(--bg-control);
    color: var(--text-secondary);
  }

  .row__text {
    display: grid;
    gap: 3px;
    min-width: 0;
    line-height: 1.25;
  }

  .row__title {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
  }

  .row__description {
    color: var(--text-muted);
    font-size: var(--font-size-xs);
  }

  /* One row of the settings card holding a small event-by-channel grid. */
  .grid {
    display: grid;
    gap: 2px;
  }

  .grid__head,
  .grid__row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) repeat(4, 64px);
    align-items: center;
    min-height: 32px;
  }

  .grid__head {
    color: var(--text-muted);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-medium);
  }

  .grid__channel {
    display: flex;
    justify-content: center;
  }

  .placeholder {
    padding: 0 16px;
    color: var(--text-muted);
    font-size: var(--font-size-sm);
  }
</style>
