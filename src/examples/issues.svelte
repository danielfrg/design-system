<script lang="ts">
  import { IconButton, SegmentedControl, Tooltip, showFlash } from "@kenn-io/kit-ui";
  import BellIcon from "@lucide/svelte/icons/bell";
  import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
  import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
  import CircleIcon from "@lucide/svelte/icons/circle";
  import CircleCheckIcon from "@lucide/svelte/icons/circle-check";
  import CircleDashedIcon from "@lucide/svelte/icons/circle-dashed";
  import CircleDotIcon from "@lucide/svelte/icons/circle-dot";
  import CircleXIcon from "@lucide/svelte/icons/circle-x";
  import FolderIcon from "@lucide/svelte/icons/folder";
  import InboxIcon from "@lucide/svelte/icons/inbox";
  import LayersIcon from "@lucide/svelte/icons/layers";
  import ListFilterIcon from "@lucide/svelte/icons/list-filter";
  import PlusIcon from "@lucide/svelte/icons/plus";
  import SearchIcon from "@lucide/svelte/icons/search";
  import SlidersHorizontalIcon from "@lucide/svelte/icons/sliders-horizontal";
  import SquarePenIcon from "@lucide/svelte/icons/square-pen";
  import TargetIcon from "@lucide/svelte/icons/target";
  import UserCircleIcon from "@lucide/svelte/icons/circle-user-round";

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
  const STATUS_CLASS: Record<Status, string> = {
    Backlog: "s-backlog",
    Todo: "s-todo",
    "In Progress": "s-progress",
    Done: "s-done",
    Canceled: "s-canceled",
  };

  const issues: Issue[] = [
    {
      id: "INM-12",
      title: "Retry failed webhook deliveries",
      status: "In Progress",
      assignee: "AL",
      created: "Nov 3",
    },
    {
      id: "INM-11",
      title: "Add keyboard shortcuts to the command bar",
      status: "In Progress",
      assignee: "GH",
      created: "Nov 2",
    },
    { id: "INM-9", title: "Import your data", status: "Todo", assignee: null, created: "Oct 28" },
    {
      id: "INM-8",
      title: "Dark mode for the marketing site",
      status: "Todo",
      assignee: "AT",
      created: "Oct 27",
    },
    {
      id: "INM-7",
      title: "Audit log export",
      status: "Backlog",
      assignee: null,
      created: "Oct 20",
    },
    {
      id: "INM-6",
      title: "SAML single sign-on",
      status: "Backlog",
      assignee: null,
      created: "Oct 18",
    },
    { id: "INM-5", title: "Implement stuff", status: "Done", assignee: "AL", created: "Oct 11" },
    { id: "INM-4", title: "Connect your tools", status: "Done", assignee: "GH", created: "Oct 9" },
    {
      id: "INM-3",
      title: "Get familiar with the app",
      status: "Canceled",
      assignee: null,
      created: "Oct 2",
    },
    {
      id: "INM-2",
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
  let collapsed = $state(new Set<Status>());
  let activeNav = $state("issues");

  const groups = $derived(
    VIEWS[view]!.map((status) => ({
      status,
      rows: issues.filter((issue) => issue.status === status),
    })).filter((group) => group.rows.length > 0),
  );

  function toggleGroup(status: Status) {
    const next = new Set(collapsed);
    if (next.has(status)) next.delete(status);
    else next.add(status);
    collapsed = next;
  }

  const workspaceNav = [
    { id: "inbox", label: "Inbox", icon: InboxIcon },
    { id: "my-issues", label: "My issues", icon: TargetIcon },
  ];
  const teamNav = [
    { id: "issues", label: "Issues", icon: LayersIcon },
    { id: "projects", label: "Projects", icon: FolderIcon },
  ];
</script>

<div class="app">
  <aside class="sidebar">
    <div class="sidebar__top">
      <span class="workspace">
        <span class="workspace__mark" aria-hidden="true">IN</span>
        inmatura
      </span>
      <IconButton ariaLabel="Search" size="sm"
        ><SearchIcon size={14} aria-hidden="true" /></IconButton
      >
      <IconButton ariaLabel="New issue" size="sm">
        <SquarePenIcon size={14} aria-hidden="true" />
      </IconButton>
    </div>

    <nav class="nav" aria-label="Workspace">
      {#each workspaceNav as item (item.id)}
        <button
          type="button"
          class="nav__item kit-control-states"
          class:active={activeNav === item.id}
          aria-current={activeNav === item.id ? "page" : undefined}
          onclick={() => (activeNav = item.id)}
        >
          <item.icon size={14} aria-hidden="true" />
          {item.label}
        </button>
      {/each}

      <span class="nav__section">Your teams</span>
      <span class="nav__team">Inmatura</span>
      {#each teamNav as item (item.id)}
        <button
          type="button"
          class="nav__item nav__item--nested kit-control-states"
          class:active={activeNav === item.id}
          aria-current={activeNav === item.id ? "page" : undefined}
          onclick={() => (activeNav = item.id)}
        >
          <item.icon size={14} aria-hidden="true" />
          {item.label}
        </button>
      {/each}
    </nav>
  </aside>

  <main class="main">
    <header class="header">
      <span class="crumbs">
        Inmatura <ChevronRightIcon size={12} aria-hidden="true" /> <strong>Issues</strong>
      </span>
      <span class="header__actions">
        <IconButton ariaLabel="Notifications" size="sm">
          <BellIcon size={14} aria-hidden="true" />
        </IconButton>
      </span>
    </header>

    <div class="toolbar">
      <SegmentedControl
        variant="borderless"
        ariaLabel="Issue view"
        value={view}
        onchange={(v) => (view = v)}
        options={[
          { value: "active", label: "Active" },
          { value: "backlog", label: "Backlog" },
          { value: "all", label: "All issues" },
        ]}
      />
      <span class="toolbar__actions">
        <Tooltip text="Filter">
          <IconButton ariaLabel="Filter"><ListFilterIcon size={14} aria-hidden="true" /></IconButton
          >
        </Tooltip>
        <Tooltip text="Display options">
          <IconButton ariaLabel="Display options">
            <SlidersHorizontalIcon size={14} aria-hidden="true" />
          </IconButton>
        </Tooltip>
      </span>
    </div>

    <div class="list" role="list">
      {#each groups as group (group.status)}
        {@const Icon = STATUS_ICON[group.status]}
        {@const open = !collapsed.has(group.status)}
        <div class="group" role="listitem">
          <div class="group__head">
            <button
              type="button"
              class="group__toggle kit-control-states"
              aria-expanded={open}
              onclick={() => toggleGroup(group.status)}
            >
              <span class="chevron" class:chevron--closed={!open}>
                <ChevronDownIcon size={12} aria-hidden="true" />
              </span>
              <span class="status {STATUS_CLASS[group.status]}">
                <Icon size={14} aria-hidden="true" />
              </span>
              {group.status}
              <span class="group__count">{group.rows.length}</span>
            </button>
            <IconButton
              ariaLabel="Add issue to {group.status}"
              size="sm"
              onclick={() => showFlash(`New ${group.status} issue`)}
            >
              <PlusIcon size={14} aria-hidden="true" />
            </IconButton>
          </div>

          {#if open}
            {#each group.rows as issue (issue.id)}
              <button
                type="button"
                class="issue kit-control-states"
                onclick={() => showFlash(`Open ${issue.id}`)}
              >
                <span class="issue__id">{issue.id}</span>
                <span class="status {STATUS_CLASS[issue.status]}">
                  <Icon size={14} aria-hidden="true" />
                </span>
                <span class="issue__title">{issue.title}</span>
                <span class="issue__meta">
                  {#if issue.assignee}
                    <span class="avatar" aria-label="Assignee {issue.assignee}"
                      >{issue.assignee}</span
                    >
                  {:else}
                    <span class="unassigned" aria-label="Unassigned">
                      <UserCircleIcon size={16} aria-hidden="true" />
                    </span>
                  {/if}
                  <span class="issue__date">{issue.created}</span>
                </span>
              </button>
            {/each}
          {/if}
        </div>
      {/each}
    </div>
  </main>
</div>

<style>
  /* The sidebar is the app background; the main panel is inset on it. */
  .app {
    display: flex;
    height: 100%;
    background: var(--bg-sidebar);
  }

  .sidebar {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 232px;
    flex-shrink: 0;
    padding: 10px 8px 10px 12px;
  }

  .sidebar__top {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .workspace {
    display: flex;
    flex: 1;
    align-items: center;
    gap: 8px;
    padding: 0 6px;
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
  }

  .workspace__mark {
    display: grid;
    place-items: center;
    width: 20px;
    height: 20px;
    border-radius: 6px;
    background: var(--brand-accent);
    color: var(--brand-accent-foreground);
    font-size: 9px;
  }

  .nav {
    display: grid;
    gap: 1px;
  }

  .nav__section {
    margin-top: 16px;
    padding: 0 10px 4px;
    color: var(--text-muted);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-medium);
  }

  .nav__team {
    padding: 4px 10px;
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
  }

  .nav__item {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 28px;
    padding: 0 10px;
    border: 0;
    border-radius: 8px;
    background: transparent;
    color: var(--text-muted);
    font: inherit;
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    text-align: left;
    cursor: pointer;
  }

  .nav__item--nested {
    margin-left: 18px;
  }

  .nav__item:hover {
    background: var(--bg-surface-hover);
    color: var(--text-primary);
  }

  .nav__item.active {
    background: var(--bg-control);
    color: var(--text-primary);
  }

  .main {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    margin: 8px 8px 8px 0;
    overflow: hidden;
    border: var(--border-width) solid var(--border-shell);
    border-radius: var(--radius-lg);
    background: var(--bg-primary);
    box-shadow: var(--shadow-control);
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 44px;
    padding: 0 12px 0 16px;
    border-bottom: var(--border-width) solid var(--border-hairline);
  }

  .crumbs {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
  }

  .crumbs strong {
    color: var(--text-primary);
    font-weight: var(--font-weight-medium);
  }

  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 8px 8px 8px;
  }

  .toolbar__actions {
    display: flex;
    gap: 4px;
  }

  .list {
    flex: 1;
    overflow-y: auto;
    padding: 0 8px 16px;
  }

  .group__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 36px;
    margin-bottom: 2px;
    padding-right: 6px;
    border-radius: 8px;
    background: var(--bg-surface);
  }

  .group__toggle {
    display: flex;
    flex: 1;
    align-items: center;
    gap: 8px;
    height: 100%;
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

  .group__count {
    color: var(--text-muted);
  }

  .chevron {
    display: inline-flex;
    color: var(--text-muted);
    transition: transform 0.12s;
  }

  .chevron--closed {
    transform: rotate(-90deg);
  }

  .issue {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    height: 40px;
    padding: 0 12px 0 28px;
    border: 0;
    border-radius: 8px;
    background: transparent;
    color: var(--text-primary);
    font: inherit;
    font-size: var(--font-size-sm);
    text-align: left;
    cursor: pointer;
  }

  .issue:hover {
    background: var(--bg-surface-hover);
  }

  .issue__id {
    width: 52px;
    color: var(--text-muted);
    font-size: var(--font-size-xs);
    font-variant-numeric: tabular-nums;
  }

  .issue__title {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    font-weight: var(--font-weight-medium);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .issue__meta {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .issue__date {
    width: 48px;
    color: var(--text-muted);
    font-size: var(--font-size-xs);
    text-align: right;
  }

  .status {
    display: inline-flex;
    flex-shrink: 0;
  }

  .s-backlog,
  .s-canceled {
    color: var(--text-muted);
  }

  .s-todo {
    color: var(--text-secondary);
  }

  .s-progress {
    color: var(--accent-amber);
  }

  .s-done {
    color: var(--brand-accent);
  }

  .avatar {
    display: grid;
    place-items: center;
    width: 18px;
    height: 18px;
    border-radius: 9999px;
    background: var(--accent-green);
    color: #fff;
    font-size: 8px;
    font-weight: var(--font-weight-semibold);
  }

  .unassigned {
    display: inline-flex;
    color: var(--text-muted);
  }
</style>
