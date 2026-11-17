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

{#snippet navItem(item: (typeof workspaceNav)[number], nested = false)}
  <Button
    aria-current={activeNav === item.id ? "page" : undefined}
    onclick={() => (activeNav = item.id)}
  
    data-variant={activeNav === item.id ? "solid" : undefined}>
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
      <Button aria-label="Search" onclick={() => toast("Search")}>
        <SearchIcon aria-hidden="true" />
      </Button>
      <Button aria-label="New issue" onclick={() => toast("New issue")}>
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
        {@render navItem(item, true)}
      {/each}
    </nav>
  </aside>

  <main class="main">
    <header class="header">
      <span class="crumbs">
        Acme <ChevronRightIcon aria-hidden="true" /> <strong>Issues</strong>
      </span>
      <Button aria-label="Notifications" onclick={() => toast("No new notifications")}>
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
          <TooltipTrigger aria-label="Filter">
            <ListFilterIcon aria-hidden="true" />
          </TooltipTrigger>
          <TooltipContent>Filter</TooltipContent>
        </Tooltip>
        <Tooltip type="label">
          <TooltipTrigger aria-label="Display options">
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
              <CollapsibleTrigger>
                <span class="status" data-status={group.status}><Icon aria-hidden="true" /></span>
                {group.status}
                <span class="group__count">{group.rows.length}</span>
              </CollapsibleTrigger>
              <Button
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
                    <Button onclick={() => toast(`Open ${issue.id}`)}>
                      <span class="issue__id">{issue.id}</span>
                      <span class="status" data-status={issue.status}
                        ><Icon aria-hidden="true" /></span
                      >
                      <span class="issue__title">{issue.title}</span>
                      <span class="issue__meta">
                        {#if issue.assignee}
                          <Avatar>
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
    height: 100%;
    background: var(--ui-muted);
    color: var(--ui-foreground);
  }

  .sidebar {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    gap: calc(var(--ui-spacing) * 3);
    width: 232px;
    padding: calc(var(--ui-spacing) * 2.5) calc(var(--ui-spacing) * 2) calc(var(--ui-spacing) * 2.5)
      calc(var(--ui-spacing) * 3);
  }

  .sidebar__top {
    display: flex;
    align-items: center;
    gap: calc(var(--ui-spacing) * 1);
  }

  .workspace {
    display: flex;
    flex: 1;
    align-items: center;
    gap: calc(var(--ui-spacing) * 2);
    padding: 0 6px;
    font-size: 0.875rem;
    font-weight: 600;
  }

  .workspace__mark {
    display: grid;
    place-items: center;
    width: 20px;
    height: 20px;
    border-radius: 6px;
    background: var(--ui-primary);
    color: var(--ui-primary-foreground);
    font-size: 9px;
  }

  .nav {
    display: grid;
    gap: 1px;
  }

  .nav__section {
    margin-top: calc(var(--ui-spacing) * 4);
    padding: 0 10px 4px;
    color: var(--ui-muted-foreground);
    font-size: 0.75rem;
    font-weight: 500;
  }

  .nav__team {
    padding: 4px 10px;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .main {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    margin: calc(var(--ui-spacing) * 2) calc(var(--ui-spacing) * 2) calc(var(--ui-spacing) * 2) 0;
    overflow: hidden;
    border: 1px solid var(--ui-border);
    border-radius: calc(var(--ui-radius) * 2);
    background: var(--ui-background);
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 44px;
    padding: 0 calc(var(--ui-spacing) * 2) 0 calc(var(--ui-spacing) * 4);
    border-bottom: 1px solid var(--ui-border);
  }

  .crumbs {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--ui-muted-foreground);
    font-size: 0.875rem;
  }

  .crumbs strong {
    color: var(--ui-foreground);
    font-weight: 500;
  }

  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: calc(var(--ui-spacing) * 2);
  }

  .toolbar__actions {
    display: flex;
    gap: calc(var(--ui-spacing) * 1);
  }

  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .list {
    flex: 1;
    overflow-y: auto;
    padding: 0 calc(var(--ui-spacing) * 2) calc(var(--ui-spacing) * 4);
  }

  .group__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 2px;
    padding: 0 calc(var(--ui-spacing) * 1) 0 calc(var(--ui-spacing) * 2);
    border-radius: var(--ui-radius);
    background: var(--ui-muted);
  }

  .group__count {
    color: var(--ui-muted-foreground);
  }

  .issue__id {
    width: 52px;
    color: var(--ui-muted-foreground);
    font-size: 0.75rem;
    font-variant-numeric: tabular-nums;
  }

  .issue__title {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    font-weight: 500;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .issue__meta {
    display: flex;
    align-items: center;
    gap: calc(var(--ui-spacing) * 3);
  }

  .issue__date {
    width: 48px;
    color: var(--ui-muted-foreground);
    font-size: 0.75rem;
    text-align: end;
  }

  .status {
    display: inline-flex;
    flex-shrink: 0;
    color: var(--ui-muted-foreground);
  }

  .status[data-status="Todo"] {
    color: var(--ui-foreground);
  }

  .status[data-status="In Progress"],
  .status[data-status="Done"] {
    color: var(--ui-primary);
  }

  .unassigned {
    display: inline-flex;
    color: var(--ui-muted-foreground);
  }

  .unassigned :global(svg) {
    width: 18px;
    height: 18px;
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

    .main {
      margin-left: calc(var(--ui-spacing) * 2);
    }
  }
</style>
