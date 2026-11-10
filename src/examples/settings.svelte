<script lang="ts">
  import {
    Button,
    SearchInput,
    SegmentedControl,
    SettingsLayout,
    SettingsSection,
    TextInput,
    Toggle,
    showFlash,
    type SettingsCategory,
  } from "@kenn-io/kit-ui";

  const categories: SettingsCategory[] = [
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

  let name = $state("Ada Lovelace");
  let email = $state("ada@example.com");
  let bio = $state("Building the analytical engine.");
  let mentions = $state(true);
  let digest = $state(true);
  let marketing = $state(false);
  let theme = $state("system");
  let density = $state("comfortable");
  let twoFactor = $state(false);

  function save() {
    showFlash("Settings saved");
  }
</script>

<div class="host">
  <SettingsLayout categories={visible} bind:active title="Settings">
    {#snippet sidebarHeader()}
      <SearchInput bind:value={query} size="sm" block placeholder="Search settings…" />
    {/snippet}

    {#snippet panel(id)}
      {#if id === "profile"}
        <SettingsSection title="Profile" description="This is how others see you on the site.">
          <label class="row">
            <span>Name</span>
            <TextInput bind:value={name} block />
          </label>
          <label class="row">
            <span>Email</span>
            <TextInput bind:value={email} type="email" block />
          </label>
          <label class="row">
            <span>Bio</span>
            <TextInput bind:value={bio} block />
          </label>
        </SettingsSection>
      {:else if id === "notifications"}
        <SettingsSection title="Email" description="Choose what lands in your inbox.">
          <Toggle bind:checked={mentions} label="Mentions and replies" />
          <Toggle bind:checked={digest} label="Weekly digest" />
          <Toggle bind:checked={marketing} label="Product news and offers" />
        </SettingsSection>
      {:else if id === "appearance"}
        <SettingsSection title="Theme" description="Follow your system or pick one.">
          <!-- Each direct child of a section is a padded row, so the control sits in one. -->
          <div>
            <SegmentedControl
              value={theme}
              onchange={(v) => (theme = v)}
              options={[
                { value: "light", label: "Light" },
                { value: "dark", label: "Dark" },
                { value: "system", label: "System" },
              ]}
            />
          </div>
        </SettingsSection>
        <SettingsSection title="Density" description="How much space lists take up.">
          <div>
            <SegmentedControl
              value={density}
              onchange={(v) => (density = v)}
              options={[
                { value: "compact", label: "Compact" },
                { value: "comfortable", label: "Comfortable" },
              ]}
            />
          </div>
        </SettingsSection>
      {:else if id === "security"}
        <SettingsSection title="Sign-in" description="Protect your account.">
          <Toggle bind:checked={twoFactor} label="Two-factor authentication" />
          <div>
            <Button label="Change password" />
          </div>
        </SettingsSection>
      {/if}
    {/snippet}

    {#snippet footer()}
      <Button label="Save changes" tone="info" surface="solid" onclick={save} />
    {/snippet}
  </SettingsLayout>
</div>

<style>
  .host {
    height: 100%;
    background: var(--bg-primary);
  }

  /* Let the layout fill the page instead of sizing to its content. */
  .host :global(.kit-settings) {
    height: 100%;
  }

  .row {
    display: grid;
    grid-template-columns: 120px minmax(0, 360px);
    align-items: center;
    gap: 12px;
    font-size: var(--font-size-sm);
  }

  .row > span {
    color: var(--text-secondary);
  }
</style>
