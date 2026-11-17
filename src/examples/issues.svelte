<script lang="ts">
  import {
    BellIcon,
    ChevronRightIcon,
    CircleCheckIcon,
    CircleDashedIcon,
    CircleDotIcon,
    CircleIcon,
    CircleUserRoundIcon,
    CircleXIcon,
    FolderIcon,
    InboxIcon,
    LayersIcon,
    ListFilterIcon,
    PlusIcon,
    SearchIcon,
    SlidersHorizontalIcon,
    SquarePenIcon,
    TargetIcon,
  } from "@lucide/svelte";
  import { Avatar, AvatarFallback } from "@ui-sdk/svelte/avatar";
  import { Button } from "@ui-sdk/svelte/button";
  import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from "@ui-sdk/svelte/collapsible";
  import {
    SegmentedControl,
    SegmentedControlIndicator,
    SegmentedControlItem,
  } from "@ui-sdk/svelte/segmented-control";
  import { Toast, ToastRegion, ToastTitle, createToaster } from "@ui-sdk/svelte/toast";
  import { Tooltip, TooltipContent, TooltipTrigger } from "@ui-sdk/svelte/tooltip";
  import { onDestroy } from "svelte";

  type Status = "Backlog" | "Todo" | "In Progress" | "Done" | "Canceled";
  interface Issue {
    id: string;
    title: string;
    status: Status;
    assignee: string | null;
    created: string;
  }

  const STATUS_ORDER: Status[] = ["In Progress", "Todo", "Backlog", "Done", "Canceled"];
  const STATUS_ICON = {
    Backlog: CircleDashedIcon,
    Todo: CircleIcon,
    "In Progress": CircleDotIcon,
    Done: CircleCheckIcon,
    Canceled: CircleXIcon,
  };

  const issues: Issue[] = [
    {
      id: "ACM-12",
      title: "Retry failed webhook deliveries",
      status: "In Progress",
      assignee: "AL",
      created: "Nov 3",
    },
    {
      id: "ACM-11",
      title: "Add keyboard shortcuts to the command bar",
      status: "In Progress",
      assignee: "GH",
      created: "Nov 2",
    },
    { id: "ACM-9", title: "Import your data", status: "Todo", assignee: null, created: "Oct 28" },
    {
      id: "ACM-8",
      title: "Dark mode for the marketing site",
      status: "Todo",
      assignee: "AT",
      created: "Oct 27",
    },
    {
      id: "ACM-7",
      title: "Audit log export",
      status: "Backlog",
      assignee: null,
      created: "Oct 20",
    },
    {
      id: "ACM-6",
      title: "SAML single sign-on",
      status: "Backlog",
      assignee: null,
      created: "Oct 18",
    },
    { id: "ACM-5", title: "Implement stuff", status: "Done", assignee: "AL", created: "Oct 11" },
    { id: "ACM-4", title: "Connect your tools", status: "Done", assignee: "GH", created: "Oct 9" },
    {
      id: "ACM-3",
      title: "Get familiar with the app",
      status: "Canceled",
      assignee: null,
      created: "Oct 2",
    },
    {
      id: "ACM-2",
      title: "Set up your teams",
      status: "Canceled",
      assignee: null,
      created: "Oct 2",
    },
  ];

  const VIEWS: Record<string, Status[]> = {
    active: ["In Progress", "Todo"],
    backlog: ["Backlog"],
    all: STATUS_ORDER,
  };

  let view = $state("all");
  let open = $state<Record<Status, boolean>>({
    "In Progress": true,
    Todo: true,
    Backlog: true,
    Done: true,
    Canceled: true,
  });
  let activeNav = $state("issues");

  const toast = createToaster();
  onDestroy(() => toast.dismiss());

  const groups = $derived(
    (VIEWS[view] ?? STATUS_ORDER)
      .map((status) => ({ status, rows: issues.filter((issue) => issue.status === status) }))
      .filter((group) => group.rows.length > 0),
  );

  const workspaceNav = [
    { id: "inbox", label: "Inbox", icon: InboxIcon },
    { id: "my-issues", label: "My issues", icon: TargetIcon },
  ];
  const teamNav = [
    { id: "issues", label: "Issues", icon: LayersIcon },
    { id: "projects", label: "Projects", icon: FolderIcon },
  ];
</script>

{#snippet navItem(item: (typeof workspaceNav)[number])}
  <Button
    class="nav__item"
    data-variant="ghost"
    aria-current={activeNav === item.id ? "page" : undefined}
    onclick={() => (activeNav = item.id)}
  >
    <item.icon aria-hidden="true" />
    {item.label}
  </Button>
{/snippet}

<div class="app">
  <aside class="sidebar">
    <div class="sidebar__top">
      <span class="workspace">
        <span class="workspace__mark" aria-hidden="true">AC</span>
        Acme
      </span>
      <Button data-variant="ghost" aria-label="Search" onclick={() => toast("Search")}>
        <SearchIcon aria-hidden="true" />
      </Button>
      <Button data-variant="ghost" aria-label="New issue" onclick={() => toast("New issue")}>
        <SquarePenIcon aria-hidden="true" />
      </Button>
    </div>

    <nav class="nav" aria-label="Workspace">
      {#each workspaceNav as item (item.id)}
        {@render navItem(item)}
      {/each}
      <span class="nav__section">Your teams</span>
      <span class="nav__team">Acme</span>
      {#each teamNav as item (item.id)}
        {@render navItem(item)}
      {/each}
    </nav>
  </aside>

  <main class="main">
    <header class="header">
      <span class="crumbs">
        Acme <ChevronRightIcon aria-hidden="true" /> <strong>Issues</strong>
      </span>
      <Button data-variant="ghost" aria-label="Notifications" onclick={() => toast("No new notifications")}>
        <BellIcon aria-hidden="true" />
      </Button>
    </header>

    <div class="toolbar">
      <SegmentedControl aria-label="Issue view" bind:value={view}>
        <SegmentedControlIndicator />
        <SegmentedControlItem value="active">Active</SegmentedControlItem>
        <SegmentedControlItem value="backlog">Backlog</SegmentedControlItem>
        <SegmentedControlItem value="all">All issues</SegmentedControlItem>
      </SegmentedControl>
      <span class="toolbar__actions">
        <Tooltip type="label">
          <TooltipTrigger data-variant="ghost" aria-label="Filter">
            <ListFilterIcon aria-hidden="true" />
          </TooltipTrigger>
          <TooltipContent>Filter</TooltipContent>
        </Tooltip>
        <Tooltip type="label">
          <TooltipTrigger data-variant="ghost" aria-label="Display options">
            <SlidersHorizontalIcon aria-hidden="true" />
          </TooltipTrigger>
          <TooltipContent>Display options</TooltipContent>
        </Tooltip>
      </span>
    </div>

    <ul class="list">
      {#each groups as group (group.status)}
        {const Icon = $derived(STATUS_ICON[group.status])}
        <li>
          <Collapsible bind:open={open[group.status]}>
            <div class="group__head">
              <CollapsibleTrigger class="group__toggle" data-variant="ghost">
                <ChevronRightIcon aria-hidden="true" class="group__chevron" />
                <span class="status" data-status={group.status}><Icon aria-hidden="true" /></span>
                {group.status}
                <span class="group__count">{group.rows.length}</span>
              </CollapsibleTrigger>
              <Button
                data-variant="ghost"
                aria-label="Add issue to {group.status}"
                onclick={() => toast(`New ${group.status} issue`)}
              >
                <PlusIcon aria-hidden="true" />
              </Button>
            </div>
            <CollapsiblePanel>
              <ul class="rows">
                {#each group.rows as issue (issue.id)}
                  <li>
                    <Button class="issue" data-variant="ghost" onclick={() => toast(`Open ${issue.id}`)}>
                      <span class="issue__id">{issue.id}</span>
                      <span class="status" data-status={issue.status}
                        ><Icon aria-hidden="true" /></span
                      >
                      <span class="issue__title">{issue.title}</span>
                      <span class="issue__meta">
                        {#if issue.assignee}
                          <Avatar class="assignee">
                            <AvatarFallback>
                              <span aria-hidden="true">{issue.assignee}</span>
                              <span class="sr-only">Assignee {issue.assignee}</span>
                            </AvatarFallback>
                          </Avatar>
                        {:else}
                          <span class="unassigned">
                            <CircleUserRoundIcon aria-hidden="true" />
                            <span class="sr-only">Unassigned</span>
                          </span>
                        {/if}
                        <span class="issue__date">{issue.created}</span>
                      </span>
                    </Button>
                  </li>
                {/each}
              </ul>
            </CollapsiblePanel>
          </Collapsible>
        </li>
      {/each}
    </ul>
  </main>

  <ToastRegion toaster={toast}>
    <Toast>
      <ToastTitle />
    </Toast>
  </ToastRegion>
</div>

<style>
  .app {
    display: flex;
    align-items: stretch;
    align-self: stretch;
    width: 100%;
    height: 100%;
    background: var(--tint);
    color: var(--ink);
    font-size: var(--text-sm);
  }

  /* Sidebar */
  .sidebar {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    width: 220px;
    flex-shrink: 0;
    padding: var(--space-3) var(--space-2);
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
    font-weight: 600;
  }

  .workspace__mark {
    display: grid;
    place-items: center;
    width: 20px;
    height: 20px;
    background: var(--ink);
    color: var(--paper);
    font-size: 9px;
    font-weight: 700;
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

  .nav :global(.nav__item svg) {
    width: 15px;
    height: 15px;
  }

  .nav__section {
    margin-top: var(--space-4);
    padding: 0 var(--space-2) var(--space-1);
    color: var(--muted);
    font-size: var(--text-xs);
    font-weight: 500;
  }

  .nav__team {
    padding: var(--space-1) var(--space-2);
    font-weight: 500;
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

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 44px;
    padding: 0 var(--space-2) 0 var(--space-4);
    border-bottom: 1px solid var(--line-faint);
  }

  .crumbs {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    color: var(--muted);
  }

  .crumbs strong {
    color: var(--ink);
    font-weight: 500;
  }

  .crumbs :global(svg) {
    width: 14px;
    height: 14px;
  }

  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    padding: var(--space-2) var(--space-2) var(--space-2) var(--space-4);
    border-bottom: 1px solid var(--line-faint);
  }

  .toolbar__actions {
    display: flex;
    gap: 2px;
  }

  /* Grouped list. The docs styles size a collapsible for a demo; here it fills the panel. */
  .list :global([data-slot="collapsible"]) {
    width: 100%;
    max-width: none;
    gap: 0;
  }

  .list,
  .rows {
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .group__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 2px var(--space-2) 2px var(--space-3);
    border-bottom: 1px solid var(--line-faint);
    background: var(--tint);
  }

  .group__head :global(.group__toggle) {
    align-self: auto;
    gap: var(--space-2);
    height: 32px;
    padding-inline: var(--space-1);
    font-weight: 500;
  }

  .group__head :global(.group__chevron) {
    width: 14px;
    height: 14px;
    color: var(--muted);
  }

  .group__count {
    color: var(--muted);
    font-weight: 400;
  }

  .rows :global(.issue) {
    display: grid;
    grid-template-columns: 4.5rem 18px minmax(0, 1fr) auto;
    align-items: center;
    gap: var(--space-3);
    width: 100%;
    height: 40px;
    padding-inline: var(--space-4) var(--space-4);
    border-bottom: 1px solid var(--line-faint);
    font-weight: 400;
    text-align: start;
  }

  .rows :global(.issue:hover) {
    background: var(--tint);
  }

  .issue__id {
    color: var(--muted);
    font-family: var(--mono);
    font-size: var(--text-xs);
  }

  .issue__title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .issue__meta {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    color: var(--muted);
  }

  .issue__date {
    width: 3.5rem;
    font-size: var(--text-xs);
    text-align: end;
  }

  .issue__meta :global(.assignee) {
    width: 22px;
    height: 22px;
    font-size: 9px;
  }

  .unassigned {
    display: grid;
    place-items: center;
    width: 22px;
    height: 22px;
  }

  .unassigned :global(svg) {
    width: 16px;
    height: 16px;
  }

  /* Status glyphs */
  .status {
    display: inline-grid;
    place-items: center;
  }

  .status :global(svg) {
    width: 15px;
    height: 15px;
  }

  .status[data-status="Backlog"] {
    color: var(--muted);
  }

  .status[data-status="Todo"] {
    color: var(--ink);
  }

  .status[data-status="In Progress"] {
    color: light-dark(#b45309, #f5b454);
  }

  .status[data-status="Done"] {
    color: light-dark(#4b5ec9, #8f9dff);
  }

  .status[data-status="Canceled"] {
    color: var(--muted);
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

    .rows :global(.issue) {
      grid-template-columns: 18px minmax(0, 1fr) auto;
    }

    .issue__id {
      display: none;
    }
  }
</style>
