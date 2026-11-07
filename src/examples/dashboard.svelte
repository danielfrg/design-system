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

  // Visitors per day. Seeded noise so the chart looks the same on every load.
  const DAYS = 90;
  const END = Date.UTC(2026, 5, 30);
  const DAY_MS = 86_400_000;

  function rng(seed: number) {
    return () => {
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // A slow trend, a weekday/weekend rhythm and lightly smoothed day-to-day noise.
  function series(seed: number, base: number, trend: number, weekend: number) {
    const rand = rng(seed);
    const noise = Array.from({ length: DAYS }, () => rand() - 0.5);
    return noise.map((_, i) => {
      const smooth = (noise[i - 1] ?? 0) * 0.25 + noise[i]! * 0.5 + (noise[i + 1] ?? 0) * 0.25;
      const day = new Date(END - (DAYS - 1 - i) * DAY_MS).getUTCDay();
      const isWeekend = day === 0 || day === 6;
      const wave = Math.sin((i / DAYS) * Math.PI * 2.2) * 0.12;
      return Math.round(
        base * (1 + (trend * i) / DAYS + wave) * (isWeekend ? weekend : 1) * (1 + smooth * 0.4),
      );
    });
  }

  const desktopSeries = series(7, 300, 0.4, 0.86);
  const mobileSeries = series(19, 180, 0.55, 1.08);
  const visitors = desktopSeries.map((desktop, i) => ({
    date: new Date(END - (DAYS - 1 - i) * DAY_MS),
    desktop,
    mobile: mobileSeries[i]!,
  }));

  let range = $state("90");
  const shown = $derived(visitors.slice(-Number(range)));

  const dateFormat = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

  // The plot is drawn in real pixels (the width is measured) so lines and
  // markers never stretch. Room at the bottom for the date axis.
  const H = 240;
  const PAD_TOP = 8;
  const AXIS = 24;
  const GUTTER = 36;
  let W = $state(800);
  let hover = $state<number | null>(null);

  const yMax = $derived.by(() => {
    const max = Math.max(...shown.flatMap((d) => [d.desktop, d.mobile]));
    const step = max > 400 ? 200 : 100;
    return Math.ceil((max * 1.05) / step) * step;
  });
  const yTicks = $derived(Array.from({ length: 5 }, (_, i) => (yMax / 4) * i));
  const x = (i: number) => GUTTER + (i / Math.max(shown.length - 1, 1)) * (W - GUTTER);
  const y = (v: number) => PAD_TOP + (1 - v / yMax) * (H - AXIS - PAD_TOP);

  // Monotone cubic interpolation: smooth, but never overshoots a data point.
  function curve(pts: [number, number][]): string {
    const n = pts.length;
    if (n < 2) return "";
    const d = pts.slice(1).map((p, i) => (p[1] - pts[i]![1]) / (p[0] - pts[i]![0]));
    const m = pts.map((_, i) => {
      if (i === 0) return d[0]!;
      if (i === n - 1) return d[n - 2]!;
      const a = d[i - 1]!;
      const b = d[i]!;
      // Harmonic mean of the neighbouring slopes; flat at local peaks.
      return a * b <= 0 ? 0 : (2 * a * b) / (a + b);
    });
    let path = `M${pts[0]![0].toFixed(1)},${pts[0]![1].toFixed(1)}`;
    for (let i = 0; i < n - 1; i++) {
      const [x0, y0] = pts[i]!;
      const [x1, y1] = pts[i + 1]!;
      const h = (x1 - x0) / 3;
      path += ` C${(x0 + h).toFixed(1)},${(y0 + m[i]! * h).toFixed(1)} ${(x1 - h).toFixed(1)},${(y1 - m[i + 1]! * h).toFixed(1)} ${x1.toFixed(1)},${y1.toFixed(1)}`;
    }
    return path;
  }

  function area(key: "desktop" | "mobile") {
    const line = curve(shown.map((d, i) => [x(i), y(d[key])]));
    const base = y(0);
    return { line, fill: `${line} L${W},${base} L${GUTTER},${base} Z` };
  }
  const desktop = $derived(area("desktop"));
  const mobile = $derived(area("mobile"));

  const xTicks = $derived.by(() => {
    // Evenly spaced days, counted back from the latest so it always has a label.
    const every = Math.ceil(shown.length / (W < 480 ? 3 : 7));
    const ticks: number[] = [];
    for (let i = shown.length - 1; i >= 0; i -= every) ticks.unshift(i);
    return ticks;
  });

  function onmove(event: PointerEvent) {
    const rect = (event.currentTarget as SVGElement).getBoundingClientRect();
    const ratio = (event.clientX - rect.left - GUTTER) / (rect.width - GUTTER);
    hover = Math.max(0, Math.min(shown.length - 1, Math.round(ratio * (shown.length - 1))));
  }

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
      <div class="chart" bind:clientWidth={W}>
        <svg
          width={W}
          height={H}
          viewBox="0 0 {W} {H}"
          role="img"
          aria-label="Visitors per day, desktop and mobile"
          onpointermove={onmove}
          onpointerleave={() => (hover = null)}
        >
          <defs>
            <linearGradient id="fill-desktop" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="var(--accent-blue)" stop-opacity="0.3" />
              <stop offset="100%" stop-color="var(--accent-blue)" stop-opacity="0" />
            </linearGradient>
            <linearGradient id="fill-mobile" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="var(--accent-teal)" stop-opacity="0.24" />
              <stop offset="100%" stop-color="var(--accent-teal)" stop-opacity="0" />
            </linearGradient>
          </defs>

          {#each yTicks as tick (tick)}
            <line class="grid" x1={GUTTER} x2={W} y1={y(tick)} y2={y(tick)} />
            <text
              class="tick"
              x={GUTTER - 8}
              y={y(tick)}
              text-anchor="end"
              dominant-baseline="middle">{tick}</text
            >
          {/each}

          <path d={desktop.fill} fill="url(#fill-desktop)" />
          <path d={mobile.fill} fill="url(#fill-mobile)" />
          <path class="line" d={desktop.line} stroke="var(--accent-blue)" />
          <path class="line" d={mobile.line} stroke="var(--accent-teal)" />

          {#each xTicks as i (i)}
            <text
              class="tick"
              x={x(i)}
              y={H - 6}
              text-anchor={i === shown.length - 1 ? "end" : "middle"}
              >{dateFormat.format(shown[i]!.date)}</text
            >
          {/each}

          {#if hover !== null}
            {@const d = shown[hover]!}
            <line class="crosshair" x1={x(hover)} x2={x(hover)} y1={PAD_TOP} y2={y(0)} />
            <circle class="dot" cx={x(hover)} cy={y(d.desktop)} r="4" fill="var(--accent-blue)" />
            <circle class="dot" cx={x(hover)} cy={y(d.mobile)} r="4" fill="var(--accent-teal)" />
          {/if}
        </svg>

        {#if hover !== null}
          {@const d = shown[hover]!}
          <div
            class="tooltip"
            class:tooltip--left={x(hover) > W - 180}
            style="left: {x(hover)}px; top: {PAD_TOP}px"
          >
            <span class="tooltip__date">{dateFormat.format(d.date)}</span>
            <span class="tooltip__row">
              <i style="background: var(--accent-blue)"></i>Desktop<b>{d.desktop}</b>
            </span>
            <span class="tooltip__row">
              <i style="background: var(--accent-teal)"></i>Mobile<b>{d.mobile}</b>
            </span>
          </div>
        {/if}
      </div>
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
  /* The sidebar is the app background; the main panel is inset on it. */
  .app {
    display: flex;
    min-height: 100%;
    background: var(--bg-sidebar);
  }

  .sidebar {
    display: flex;
    flex-direction: column;
    gap: 16px;
    flex-shrink: 0;
    width: 208px;
    padding: 14px 8px 10px 12px;
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

  .nav:hover {
    background: var(--bg-surface-hover);
    color: var(--text-primary);
  }

  .nav.active {
    background: var(--bg-control);
    color: var(--text-primary);
  }

  .user {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    border-top: var(--border-width) solid var(--border-hairline);
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
    margin: 8px 8px 8px 0;
    padding: 16px 24px 32px;
    border: var(--border-width) solid var(--border-shell);
    border-radius: var(--radius-lg);
    background: var(--bg-primary);
    box-shadow: var(--shadow-control);
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
    border-radius: var(--radius-lg);
    background: var(--bg-surface);
    box-shadow: var(--shadow-card);
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

  .chart {
    position: relative;
    min-width: 0;
  }

  svg {
    display: block;
    overflow: visible;
    touch-action: pan-y;
  }

  .grid {
    stroke: var(--border-hairline);
  }

  .tick {
    fill: var(--text-muted);
    font-size: 11px;
    font-variant-numeric: tabular-nums;
  }

  .line {
    fill: none;
    stroke-width: 2;
    stroke-linejoin: round;
    stroke-linecap: round;
  }

  .crosshair {
    stroke: var(--text-muted);
    stroke-opacity: 0.5;
    stroke-dasharray: 3 3;
  }

  /* A ring in the panel color keeps the marker legible where lines cross. */
  .dot {
    stroke: var(--bg-surface);
    stroke-width: 2;
  }

  .tooltip {
    position: absolute;
    display: grid;
    gap: 4px;
    min-width: 140px;
    margin-left: 12px;
    padding: 8px 10px;
    border-radius: 8px;
    background: var(--bg-primary);
    box-shadow: var(--shadow-card), var(--shadow-md);
    font-size: var(--font-size-xs);
    pointer-events: none;
  }

  .tooltip--left {
    transform: translateX(calc(-100% - 24px));
  }

  .tooltip__date {
    color: var(--text-muted);
    font-weight: var(--font-weight-medium);
  }

  .tooltip__row {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--text-secondary);
  }

  .tooltip__row i {
    width: 8px;
    height: 8px;
    border-radius: 2px;
  }

  .tooltip__row b {
    margin-left: auto;
    color: var(--text-primary);
    font-weight: var(--font-weight-medium);
    font-variant-numeric: tabular-nums;
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
