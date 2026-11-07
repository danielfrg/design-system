<script lang="ts">
  import {
    Button,
    IconButton,
    Modal,
    SearchInput,
    SettingsLayout,
    SettingsSection,
    TextInput,
    showFlash,
    type SettingsCategory,
  } from "@kenn-io/kit-ui";
  import ChevronLeftIcon from "@lucide/svelte/icons/chevron-left";
  import PencilIcon from "@lucide/svelte/icons/pencil";

  const categories: SettingsCategory[] = [
    { id: "preferences", label: "Preferences", group: "Account" },
    { id: "profile", label: "Profile", group: "Account" },
    { id: "notifications", label: "Notifications", group: "Account" },
    { id: "security", label: "Security & access", group: "Account" },
    { id: "workspace", label: "General", group: "Administration" },
    { id: "members", label: "Members", group: "Administration" },
    { id: "billing", label: "Billing", group: "Administration" },
  ];

  let active = $state("profile");
  let query = $state("");
  const visible = $derived.by(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => `${c.label} ${c.group}`.toLowerCase().includes(q));
  });

  let email = $state("ada@example.com");
  let fullName = $state("Ada Lovelace");
  let jobTitle = $state("");
  let username = $state("ada");
  let leaving = $state(false);

  const initials = $derived(
    fullName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]!.toUpperCase())
      .join(""),
  );

  function leave() {
    leaving = false;
    showFlash("You left the workspace");
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
      {#if id === "profile"}
        <h1 class="title">Profile</h1>

        <SettingsSection title="Your details">
          <div class="row">
            <span class="row__title">Profile picture</span>
            <span class="avatar" aria-label="Avatar for {fullName}">{initials}</span>
          </div>
          <div class="row">
            <span class="row__title">Email</span>
            <span class="row__value">
              {email}
              <IconButton ariaLabel="Change email" size="sm" class="edit">
                <PencilIcon size={12} aria-hidden="true" />
              </IconButton>
            </span>
          </div>
          <label class="row">
            <span class="row__title">Full name</span>
            <TextInput bind:value={fullName} class="field" />
          </label>
          <label class="row">
            <span class="row__text">
              <span class="row__title">Title</span>
              <span class="row__description">Your job title or role</span>
            </span>
            <TextInput bind:value={jobTitle} placeholder="Software engineer" class="field" />
          </label>
          <label class="row">
            <span class="row__text">
              <span class="row__title">Username</span>
              <span class="row__description">One word, like a nickname or first name</span>
            </span>
            <TextInput bind:value={username} class="field" />
          </label>
        </SettingsSection>

        <SettingsSection title="Workspace access">
          <div class="row">
            <span class="row__description">Remove yourself from the workspace</span>
            <Button label="Leave workspace" tone="danger" onclick={() => (leaving = true)} />
          </div>
        </SettingsSection>
      {:else}
        <p class="placeholder">This example only implements Profile.</p>
      {/if}
    {/snippet}
  </SettingsLayout>
</div>

{#if leaving}
  <Modal title="Leave workspace?" tone="danger" onclose={() => (leaving = false)}>
    You will lose access to every team and issue in this workspace until an admin invites you back.
    {#snippet footer()}
      <Button label="Cancel" onclick={() => (leaving = false)} />
      <Button label="Leave workspace" tone="danger" surface="solid" onclick={leave} />
    {/snippet}
  </Modal>
{/if}

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
    min-height: 34px;
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

  .row__value {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: var(--font-size-sm);
  }

  /* Linear's round, filled edit button. */
  .row__value :global(.edit) {
    border-radius: 9999px;
    background: var(--bg-control);
  }

  .row__value :global(.edit:hover) {
    background: var(--bg-control-hover);
  }

  .row :global(.field) {
    width: 200px;
  }

  .avatar {
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    border-radius: 9999px;
    background: var(--accent-green);
    color: #fff;
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-semibold);
  }

  .placeholder {
    padding: 0 16px;
    color: var(--text-muted);
    font-size: var(--font-size-sm);
  }
</style>
