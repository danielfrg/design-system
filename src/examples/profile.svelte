<script lang="ts">
  import { onDestroy } from "svelte";
  import ChevronLeftIcon from "@lucide/svelte/icons/chevron-left";
  import PencilIcon from "@lucide/svelte/icons/pencil";
  import {
    AlertDialog,
    AlertDialogBackdrop,
    AlertDialogClose,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@ui-sdk/svelte/alert-dialog";
  import { Avatar, AvatarFallback } from "@ui-sdk/svelte/avatar";
  import { Button } from "@ui-sdk/svelte/button";
  import { Field, FieldDescription, FieldLabel } from "@ui-sdk/svelte/field";
  import { Input } from "@ui-sdk/svelte/input";
  import { Toast, ToastRegion, ToastTitle, createToaster } from "@ui-sdk/svelte/toast";

  const categories = [
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
  const groups = $derived([...new Set(visible.map((c) => c.group))]);

  let email = $state("ada@example.com");
  let fullName = $state("Ada Lovelace");
  let jobTitle = $state("");
  let username = $state("ada");

  const initials = $derived(
    fullName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]!.toUpperCase())
      .join(""),
  );

  const toast = createToaster();
  onDestroy(() => toast.dismiss());
</script>

<div class="app">
  <aside class="sidebar">
    <div class="sidebar__top">
      <Button class="back" data-variant="ghost">
        <ChevronLeftIcon aria-hidden="true" /> Back to app
      </Button>
    </div>
    <Input type="search" bind:value={query} placeholder="Search…" aria-label="Search settings" />
    <nav class="nav" aria-label="Settings">
      {#each groups as group (group)}
        <span class="nav__section">{group}</span>
        {#each visible.filter((c) => c.group === group) as item (item.id)}
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
        <p class="empty">No settings match “{query}”.</p>
      {/each}
    </nav>
  </aside>

  <main class="main">
    {#if active === "profile"}
      <h1>Profile</h1>

      <section aria-labelledby="profile-details">
        <h2 id="profile-details">Your details</h2>
        <div class="card">
          <div class="row">
            <span class="row__title">Profile picture</span>
            <Avatar>
              <AvatarFallback>
                <span aria-hidden="true">{initials}</span>
                <span data-slot="visually-hidden">{fullName}</span>
              </AvatarFallback>
            </Avatar>
          </div>
          <div class="row">
            <span class="row__title">Email</span>
            <span class="row__value">
              {email}
              <Button aria-label="Change email"><PencilIcon aria-hidden="true" /></Button>
            </span>
          </div>
          <div class="row">
            <Field name="full-name">
              <FieldLabel>Full name</FieldLabel>
              <Input bind:value={fullName} autocomplete="name" />
            </Field>
          </div>
          <div class="row">
            <Field name="title">
              <div class="row__text">
                <FieldLabel>Title</FieldLabel>
                <FieldDescription>Your job title or role</FieldDescription>
              </div>
              <Input bind:value={jobTitle} placeholder="Software engineer" autocomplete="organization-title" />
            </Field>
          </div>
          <div class="row">
            <Field name="username">
              <div class="row__text">
                <FieldLabel>Username</FieldLabel>
                <FieldDescription>One word, like a nickname or first name</FieldDescription>
              </div>
              <Input bind:value={username} autocomplete="username" />
            </Field>
          </div>
        </div>
      </section>

      <section aria-labelledby="profile-access">
        <h2 id="profile-access">Workspace access</h2>
        <div class="card">
          <div class="row">
            <span class="row__description">Remove yourself from the workspace</span>
            <AlertDialog
              onOpenChange={(open, details) => {
                if (!open && details.returnValue === "confirm") toast("You left the workspace");
              }}
            >
              <AlertDialogTrigger data-variant="destructive">Leave workspace</AlertDialogTrigger>
              <AlertDialogBackdrop />
              <AlertDialogContent>
                <div class="dialog__text">
                  <AlertDialogTitle>Leave workspace?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You will lose access to every team and issue in this workspace until an admin
                    invites you back.
                  </AlertDialogDescription>
                </div>
                <div class="dialog__actions">
                  <AlertDialogClose>Cancel</AlertDialogClose>
                  <AlertDialogClose data-variant="destructive" value="confirm">
                    Leave workspace
                  </AlertDialogClose>
                </div>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </section>
    {:else}
      <p class="empty">This example only implements Profile.</p>
    {/if}
  </main>
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

  .empty {
    margin: 0;
    padding-inline: calc(var(--ui-spacing) * 2);
    color: var(--ui-muted-foreground);
  }

  /* Main panel: flat, beside the sidebar */
  .main {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: calc(var(--ui-spacing) * 8);
    min-width: 0;
    padding: calc(var(--ui-spacing) * 10) calc(var(--ui-spacing) * 8);
    overflow: auto;
    border-inline-start: 1px solid var(--line-faint);
    background: var(--paper);
  }

  .main > * {
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
    min-height: calc(var(--ui-spacing) * 9);
    padding: calc(var(--ui-spacing) * 3) calc(var(--ui-spacing) * 4);
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
  .row__description,
  .row__value {
    font-size: calc(var(--ui-font-size) - 0.0625rem);
  }

  .row__title {
    font-weight: 500;
  }

  .row__description {
    color: var(--ui-muted-foreground);
  }

  .row__value {
    display: flex;
    align-items: center;
    gap: calc(var(--ui-spacing) * 2);
  }

  .dialog__text {
    display: grid;
    gap: calc(var(--ui-spacing) * 2);
  }

  .dialog__actions {
    display: flex;
    justify-content: flex-end;
    gap: calc(var(--ui-spacing) * 2);
  }

  @container (max-width: 640px) {
    .sidebar {
      display: none;
    }

    .main {
      border-inline-start: 0;
      padding: calc(var(--ui-spacing) * 6) calc(var(--ui-spacing) * 4);
    }
  }
</style>
