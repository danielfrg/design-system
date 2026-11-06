<script lang="ts">
  import {
    Button,
    Chip,
    MetricCard,
    SegmentedControl,
    Table,
    TableHeaderCell,
    TableSort,
  } from "@kenn-io/kit-ui";
  import ChartColumnIcon from "@lucide/svelte/icons/chart-column";
  import DatabaseIcon from "@lucide/svelte/icons/database";
  import FileTextIcon from "@lucide/svelte/icons/file-text";
  import FolderIcon from "@lucide/svelte/icons/folder";
  import LayoutDashboardIcon from "@lucide/svelte/icons/layout-dashboard";
  import ListChecksIcon from "@lucide/svelte/icons/list-checks";
  import PlusIcon from "@lucide/svelte/icons/plus";
  import SettingsIcon from "@lucide/svelte/icons/settings";
  import SparklesIcon from "@lucide/svelte/icons/sparkles";
  import UsersIcon from "@lucide/svelte/icons/users";

  const nav = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
    { id: "lifecycle", label: "Lifecycle", icon: ListChecksIcon },
    { id: "analytics", label: "Analytics", icon: ChartColumnIcon },
    { id: "projects", label: "Projects", icon: FolderIcon },
    { id: "team", label: "Team", icon: UsersIcon },
    { id: "data", label: "Data library", icon: DatabaseIcon },
    { id: "reports", label: "Reports", icon: FileTextIcon },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ];
  let activeNav = $state("dashboard");

  // Visitors per day. Deterministic so the chart looks the same on every load.
  const DAYS = 90;
  const visitors = Array.from({ length: DAYS }, (_, i) => ({
    desktop: 220 + 90 * Math.sin(i / 8) + ((i * 7919) % 60),
    mobile: 150 + 60 * Math.sin(i / 6 + 1) + ((i * 104729) % 45),
  }));

  let range = $state("90");
  const shown = $derived(visitors.slice(-Number(range)));

  const W = 800;
  const H = 220;
  const maxY = Math.max(...visitors.flatMap((d) => [d.desktop, d.mobile])) * 1.1;

  function area(key: "desktop" | "mobile") {
    const step = W / Math.max(shown.length - 1, 1);
    const points = shown.map(
      (d, i) => `${(i * step).toFixed(1)},${(H - (d[key] / maxY) * H).toFixed(1)}`,
    );
    return { line: `M${points.join(" L")}`, fill: `M0,${H} L${points.join(" L")} L${W},${H} Z` };
  }
  const desktop = $derived(area("desktop"));
  const mobile = $derived(area("mobile"));

  interface Row {
    id: number;
    header: string;
    type: string;
    status: "Done" | "In process";
    target: number;
    limit: number;
    reviewer: string;
  }

  const rows: Row[] = [
    {
      id: 1,
      header: "Cover page",
      type: "Cover page",
      status: "In process",
      target: 18,
      limit: 5,
      reviewer: "Eddie Lake",
    },
    {
      id: 2,
      header: "Table of contents",
      type: "Table of contents",
      status: "Done",
      target: 29,
      limit: 24,
      reviewer: "Eddie Lake",
    },
    {
      id: 3,
      header: "Executive summary",
      type: "Narrative",
      status: "Done",
      target: 10,
      limit: 13,
      reviewer: "Eddie Lake",
    },
    {
      id: 4,
      header: "Technical approach",
      type: "Narrative",
      status: "Done",
      target: 27,
      limit: 23,
      reviewer: "Jamik Tashpulatov",
    },
    {
      id: 5,
      header: "Design",
      type: "Narrative",
      status: "In process",
      target: 2,
      limit: 16,
      reviewer: "Jamik Tashpulatov",
    },
    {
      id: 6,
      header: "Capabilities",
      type: "Narrative",
      status: "In process",
      target: 20,
      limit: 8,
      reviewer: "Jamik Tashpulatov",
    },
    {
      id: 7,
      header: "Integration with existing systems",
      type: "Narrative",
      status: "In process",
      target: 19,
      limit: 21,
      reviewer: "Eddie Lake",
    },
    {
      id: 8,
      header: "Innovation and Advantages",
      type: "Narrative",
      status: "Done",
      target: 25,
      limit: 26,
      reviewer: "Assign reviewer",
    },
  ];

  const sorter = new TableSort<Row>(
    {
      header: (row) => row.header,
      type: (row) => row.type,
      status: (row) => row.status,
      target: { value: (row) => row.target, firstDirection: "desc" },
      limit: { value: (row) => row.limit, firstDirection: "desc" },
      reviewer: (row) => row.reviewer,
    },
    { key: "header" },
  );
</script>

<div class="app">
  <aside class="sidebar">
    <div class="brand"><SparklesIcon size={16} aria-hidden="true" /> Acme Inc.</div>
    <nav aria-label="Main">
      {#each nav as item (item.id)}
        <button
          type="button"
          class="nav kit-control-states"
          class:active={activeNav === item.id}
          aria-current={activeNav === item.id ? "page" : undefined}
          onclick={() => (activeNav = item.id)}
        >
          <item.icon size={15} aria-hidden="true" />
          {item.label}
        </button>
      {/each}
    </nav>
    <div class="user">
      <span class="avatar" aria-hidden="true">SH</span>
      <span class="who"><strong>shadcn</strong><small>m@example.com</small></span>
    </div>
  </aside>

  <main class="main">
    <header class="top">
      <h1>Documents</h1>
      <Button tone="info" surface="solid" label="Quick create">
        {#snippet trailing()}<PlusIcon size={14} aria-hidden="true" />{/snippet}
      </Button>
    </header>

    <section class="metrics" aria-label="Key metrics">
      <MetricCard label="Total revenue" value="$1,250.00" meta="+12.5%" tone="success">
        Trending up this month
        {#snippet footer()}Visitors for the last 6 months{/snippet}
      </MetricCard>
      <MetricCard label="New customers" value="1,234" meta="-20%" tone="danger">
        Down 20% this period
        {#snippet footer()}Acquisition needs attention{/snippet}
      </MetricCard>
      <MetricCard label="Active accounts" value="45,678" meta="+12.5%" tone="success">
        Strong user retention
        {#snippet footer()}Engagement exceeds targets{/snippet}
      </MetricCard>
      <MetricCard label="Growth rate" value="4.5%" meta="+4.5%" tone="success">
        Steady performance increase
        {#snippet footer()}Meets growth projections{/snippet}
      </MetricCard>
    </section>

    <section class="panel">
      <div class="panel__head">
        <div>
          <h2>Total visitors</h2>
          <p>Total for the selected range</p>
        </div>
        <SegmentedControl
          value={range}
          onchange={(v) => (range = v)}
          options={[
            { value: "90", label: "Last 3 months" },
            { value: "30", label: "Last 30 days" },
            { value: "7", label: "Last 7 days" },
          ]}
        />
      </div>
      <svg
        viewBox="0 0 {W} {H}"
        preserveAspectRatio="none"
        role="img"
        aria-label="Visitors area chart"
      >
        <path d={mobile.fill} fill="var(--accent-teal)" fill-opacity="0.16" />
        <path
          d={mobile.line}
          fill="none"
          stroke="var(--accent-teal)"
          stroke-width="1.5"
          vector-effect="non-scaling-stroke"
        />
        <path d={desktop.fill} fill="var(--accent-blue)" fill-opacity="0.16" />
        <path
          d={desktop.line}
          fill="none"
          stroke="var(--accent-blue)"
          stroke-width="1.5"
          vector-effect="non-scaling-stroke"
        />
      </svg>
      <div class="legend">
        <span><i style="background: var(--accent-blue)"></i>Desktop</span>
        <span><i style="background: var(--accent-teal)"></i>Mobile</span>
      </div>
    </section>

    <section class="panel">
      <div class="panel__head">
        <h2>Outline</h2>
      </div>
      <Table ariaLabel="Document outline">
        {#snippet header()}
          <TableHeaderCell label="Header" sort={sorter} column="header" />
          <TableHeaderCell label="Section type" sort={sorter} column="type" />
          <TableHeaderCell label="Status" sort={sorter} column="status" />
          <TableHeaderCell label="Target" numeric sort={sorter} column="target" />
          <TableHeaderCell label="Limit" numeric sort={sorter} column="limit" />
          <TableHeaderCell label="Reviewer" sort={sorter} column="reviewer" />
        {/snippet}
        {#each sorter.sort(rows) as row (row.id)}
          <tr>
            <td>{row.header}</td>
            <td><Chip size="sm">{row.type}</Chip></td>
            <td>
              <Chip size="sm" tone={row.status === "Done" ? "success" : "muted"}>{row.status}</Chip>
            </td>
            <td class="num">{row.target}</td>
            <td class="num">{row.limit}</td>
            <td>{row.reviewer}</td>
          </tr>
        {/each}
      </Table>
    </section>
  </main>
</div>

<style>
  .app {
    display: flex;
    min-height: 100%;
    background: var(--bg-primary);
  }

  .sidebar {
    display: flex;
    flex-direction: column;
    gap: 16px;
    flex-shrink: 0;
    width: 208px;
    padding: 14px 10px;
    border-right: 1px solid var(--border-default);
    background: var(--bg-sidebar);
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 8px;
    font-weight: var(--font-weight-semibold);
  }

  nav {
    display: grid;
    gap: 1px;
    flex: 1;
    align-content: start;
  }

  .nav {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    border: 0;
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--text-secondary);
    font: inherit;
    font-size: var(--font-size-sm);
    text-align: left;
    cursor: pointer;
  }

  .nav:hover {
    background: var(--bg-surface-hover);
    color: var(--text-primary);
  }

  .nav.active {
    background: color-mix(in srgb, var(--accent-blue) 12%, transparent);
    color: var(--accent-blue);
    font-weight: var(--font-weight-semibold);
  }

  .user {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    border-top: 1px solid var(--border-muted);
  }

  .avatar {
    display: grid;
    place-items: center;
    width: 28px;
    height: 28px;
    border-radius: 9999px;
    background: var(--bg-control);
    font-size: var(--font-size-2xs);
    font-weight: var(--font-weight-semibold);
  }

  .who {
    display: grid;
    min-width: 0;
    font-size: var(--font-size-xs);
    line-height: 1.3;
  }

  .who small {
    color: var(--text-muted);
  }

  .main {
    display: grid;
    flex: 1;
    gap: 16px;
    align-content: start;
    min-width: 0;
    padding: 16px 24px 32px;
  }

  .top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  h1 {
    margin: 0;
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
  }

  .metrics {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
    gap: 12px;
  }

  .panel {
    display: grid;
    gap: 12px;
    padding: 16px;
    border: 1px solid var(--border-default);
    border-radius: var(--radius-lg);
    background: var(--bg-surface);
  }

  .panel__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px 16px;
  }

  h2 {
    margin: 0;
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-semibold);
  }

  .panel__head p {
    margin: 2px 0 0;
    color: var(--text-muted);
    font-size: var(--font-size-xs);
  }

  svg {
    width: 100%;
    height: 220px;
  }

  .legend {
    display: flex;
    gap: 16px;
    color: var(--text-muted);
    font-size: var(--font-size-xs);
  }

  .legend span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .legend i {
    width: 8px;
    height: 8px;
    border-radius: 2px;
  }

  .num {
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  @container (max-width: 700px) {
    .sidebar {
      display: none;
    }
  }
</style>
