<script lang="ts">
  import {
    Button,
    SearchInput,
    SelectDropdown,
    SettingsLayout,
    SettingsSection,
    Toggle,
    type SettingsCategory,
  } from "@kenn-io/kit-ui";
  import ChevronLeftIcon from "@lucide/svelte/icons/chevron-left";

  const categories: SettingsCategory[] = [
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

  let homeView = $state("inbox");
  let displayNames = $state("full");
  let weekStart = $state("sunday");
  let emoji = $state(true);
  let sendOn = $state("mod-enter");
  let fontSize = $state("default");
  let pointer = $state(false);
  let underline = $state(false);
  let staticImages = $state(false);
  let theme = $state("system");
  let openDesktop = $state(true);
  let autoAssign = $state(false);
  let assignOnStart = $state(true);
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
      {#if id === "preferences"}
        <h1 class="title">Preferences</h1>

        <SettingsSection title="General">
          <div class="row">
            <div class="row__text">
              <span class="row__title">Default home view</span>
              <span class="row__description"
                >Select which view to display when launching the app</span
              >
            </div>
            <SelectDropdown
              value={homeView}
              onchange={(v) => (homeView = v)}
              align="end"
              options={[
                { value: "inbox", label: "Inbox" },
                { value: "my-issues", label: "My issues" },
                { value: "projects", label: "Projects" },
              ]}
            />
          </div>
          <div class="row">
            <div class="row__text">
              <span class="row__title">Display names</span>
              <span class="row__description">Select how names are displayed in the interface</span>
            </div>
            <SelectDropdown
              value={displayNames}
              onchange={(v) => (displayNames = v)}
              align="end"
              options={[
                { value: "full", label: "Full name" },
                { value: "username", label: "Username" },
              ]}
            />
          </div>
          <div class="row">
            <div class="row__text">
              <span class="row__title">First day of the week</span>
              <span class="row__description">Used for date pickers</span>
            </div>
            <SelectDropdown
              value={weekStart}
              onchange={(v) => (weekStart = v)}
              align="end"
              options={[
                { value: "sunday", label: "Sunday" },
                { value: "monday", label: "Monday" },
              ]}
            />
          </div>
          <div class="row">
            <div class="row__text">
              <span class="row__title">Convert text emoticons into emojis</span>
              <span class="row__description">Strings like :) will be converted to 🙂</span>
            </div>
            <Toggle bind:checked={emoji} ariaLabel="Convert text emoticons into emojis" />
          </div>
          <div class="row">
            <div class="row__text">
              <span class="row__title">Send comments on…</span>
              <span class="row__description">Choose which key press is used to submit comments</span
              >
            </div>
            <SelectDropdown
              value={sendOn}
              onchange={(v) => (sendOn = v)}
              align="end"
              options={[
                { value: "mod-enter", label: "⌘+Enter" },
                { value: "enter", label: "Enter" },
              ]}
            />
          </div>
        </SettingsSection>

        <SettingsSection title="Interface and theme">
          <div class="row">
            <div class="row__text">
              <span class="row__title">App sidebar</span>
              <span class="row__description">
                Customize sidebar item visibility, ordering, and badge style
              </span>
            </div>
            <Button label="Customize" />
          </div>
          <div class="row">
            <div class="row__text">
              <span class="row__title">Font size</span>
              <span class="row__description">Adjust the size of text across the app</span>
            </div>
            <SelectDropdown
              value={fontSize}
              onchange={(v) => (fontSize = v)}
              align="end"
              options={[
                { value: "small", label: "Small" },
                { value: "default", label: "Default" },
                { value: "large", label: "Large" },
              ]}
            />
          </div>
          <div class="row">
            <div class="row__text">
              <span class="row__title">Use pointer cursors</span>
              <span class="row__description">
                Change the cursor to a pointer when hovering over any interactive elements
              </span>
            </div>
            <Toggle bind:checked={pointer} ariaLabel="Use pointer cursors" />
          </div>
          <div class="row">
            <div class="row__text">
              <span class="row__title">Underline links</span>
              <span class="row__description">Always underline links in text content</span>
            </div>
            <Toggle bind:checked={underline} ariaLabel="Underline links" />
          </div>
          <div class="row">
            <div class="row__text">
              <span class="row__title">Disable animated images & emoji</span>
              <span class="row__description">
                GIFs and animated emojis stay static and animate only on hover
              </span>
            </div>
            <Toggle bind:checked={staticImages} ariaLabel="Disable animated images and emoji" />
          </div>
          <div class="row">
            <div class="row__text">
              <span class="row__title">Interface theme</span>
              <span class="row__description">Select or customize your interface color scheme</span>
            </div>
            <SelectDropdown
              value={theme}
              onchange={(v) => (theme = v)}
              align="end"
              options={[
                { value: "system", label: "System preference" },
                { value: "light", label: "Light" },
                { value: "dark", label: "Dark" },
              ]}
            />
          </div>
        </SettingsSection>

        <SettingsSection title="Desktop application">
          <div class="row">
            <div class="row__text">
              <span class="row__title">Open in desktop app</span>
              <span class="row__description">
                Automatically open links in the desktop app when possible
              </span>
            </div>
            <Toggle bind:checked={openDesktop} ariaLabel="Open in desktop app" />
          </div>
        </SettingsSection>

        <SettingsSection title="Automations and workflows">
          <div class="row">
            <div class="row__text">
              <span class="row__title">Auto-assign to self</span>
              <span class="row__description">
                When creating new issues, always assign them to yourself by default
              </span>
            </div>
            <Toggle bind:checked={autoAssign} ariaLabel="Auto-assign to self" />
          </div>
          <div class="row">
            <div class="row__text">
              <span class="row__title">On move to started status, assign to yourself</span>
              <span class="row__description">
                When you move an unassigned issue to started, it is assigned to you
              </span>
            </div>
            <Toggle bind:checked={assignOnStart} ariaLabel="Assign to yourself when started" />
          </div>
        </SettingsSection>
      {:else}
        <p class="placeholder">This example only implements Preferences.</p>
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

  .placeholder {
    padding: 0 16px;
    color: var(--text-muted);
    font-size: var(--font-size-sm);
  }
</style>
