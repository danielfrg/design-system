<script lang="ts">
  import {
    ArrowDownIcon,
    ArrowUpDownIcon,
    ArrowUpIcon,
    ChartColumnIcon,
    DatabaseIcon,
    FileTextIcon,
    FolderIcon,
    LayoutDashboardIcon,
    ListChecksIcon,
    PlusIcon,
    SettingsIcon,
    SparklesIcon,
    TrendingDownIcon,
    TrendingUpIcon,
    UsersIcon,
  } from "@lucide/svelte";
  import { Avatar, AvatarFallback } from "@ui-sdk/svelte/avatar";
  import { Button } from "@ui-sdk/svelte/button";
  import {
    SegmentedControl,
    SegmentedControlIndicator,
    SegmentedControlItem,
  } from "@ui-sdk/svelte/segmented-control";
  import { Toast, ToastRegion, ToastTitle, createToaster } from "@ui-sdk/svelte/toast";
  import { onDestroy } from "svelte";

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

  const toast = createToaster();
  onDestroy(() => toast.dismiss());

  const metrics = [
    {
      label: "Total revenue",
      value: "$1,250.00",
      change: "+12.5%",
      up: true,
      note: "Trending up this month",
      footer: "Visitors for the last 6 months",
    },
    {
      label: "New customers",
      value: "1,234",
      change: "-20%",
      up: false,
      note: "Down 20% this period",
      footer: "Acquisition needs attention",
    },
    {
      label: "Active accounts",
      value: "45,678",
      change: "+12.5%",
      up: true,
      note: "Strong user retention",
      footer: "Engagement exceeds targets",
    },
    {
      label: "Growth rate",
      value: "4.5%",
      change: "+4.5%",
      up: true,
      note: "Steady performance increase",
      footer: "Meets growth projections",
    },
  ];

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
  const H = 220;
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
  const total = $derived(shown.reduce((sum, d) => sum + d.desktop + d.mobile, 0));

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

  type SortKey = Exclude<keyof Row, "id">;
  const columns: { key: SortKey; label: string; numeric?: boolean }[] = [
    { key: "header", label: "Header" },
    { key: "type", label: "Section type" },
    { key: "status", label: "Status" },
    { key: "target", label: "Target", numeric: true },
    { key: "limit", label: "Limit", numeric: true },
    { key: "reviewer", label: "Reviewer" },
  ];
  let sort = $state<{ key: SortKey; direction: "asc" | "desc" } | null>({
    key: "header",
    direction: "asc",
  });

  const sortedRows = $derived.by(() => {
    if (!sort) return rows;
    const { key, direction } = sort;
    const sign = direction === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => (a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0) * sign);
  });

  // Numbers sort high to low first, text A to Z; a third press clears the sort.
  function toggleSort(key: SortKey, numeric = false) {
    const first = numeric ? "desc" : "asc";
    if (sort?.key !== key) sort = { key, direction: first };
    else if (sort.direction === first) sort = { key, direction: first === "asc" ? "desc" : "asc" };
    else sort = null;
  }
</script>

<div class="app">
  <aside class="sidebar">
    <div class="sidebar__top">
      <span class="workspace">
        <span class="workspace__mark" aria-hidden="true"><SparklesIcon /></span>
        Acme Inc.
      </span>
    </div>
    <nav class="nav" aria-label="Main">
      {#each nav as item (item.id)}
        <Button
          class="nav__item"
          data-variant="ghost"
          aria-current={activeNav === item.id ? "page" : undefined}
          onclick={() => (activeNav = item.id)}
        >
          <item.icon aria-hidden="true" />
          {item.label}
        </Button>
      {/each}
    </nav>
    <div class="user">
      <Avatar>
        <AvatarFallback>
          <span aria-hidden="true">SH</span>
        </AvatarFallback>
      </Avatar>
      <span class="who"><strong>Sam Hollis</strong><small>sam@example.com</small></span>
    </div>
  </aside>

  <main class="main">
    <header class="top">
      <h1>Documents</h1>
      <Button data-variant="solid" onclick={() => toast("New document created")}>
        <PlusIcon aria-hidden="true" />
        Quick create
      </Button>
    </header>

    <section class="metrics" aria-label="Key metrics">
      {#each metrics as metric (metric.label)}
        <article class="card metric">
          <div class="metric__head">
            <span class="muted">{metric.label}</span>
            <span class="change" data-down={!metric.up || undefined}>
              {#if metric.up}<TrendingUpIcon aria-hidden="true" />{:else}<TrendingDownIcon
                  aria-hidden="true"
                />{/if}
              {metric.change}
            </span>
          </div>
          <strong class="metric__value">{metric.value}</strong>
          <span class="metric__note">{metric.note}</span>
          <span class="muted">{metric.footer}</span>
        </article>
      {/each}
    </section>

    <section class="card">
      <div class="card__head">
        <div>
          <h2>Total visitors</h2>
          <p class="muted">{total.toLocaleString("en-US")} for the selected range</p>
        </div>
        <SegmentedControl aria-label="Range" bind:value={range}>
          <SegmentedControlIndicator />
          <SegmentedControlItem value="90">Last 3 months</SegmentedControlItem>
          <SegmentedControlItem value="30">Last 30 days</SegmentedControlItem>
          <SegmentedControlItem value="7">Last 7 days</SegmentedControlItem>
        </SegmentedControl>
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
              <stop offset="0%" stop-color="var(--desktop)" stop-opacity="0.3" />
              <stop offset="100%" stop-color="var(--desktop)" stop-opacity="0" />
            </linearGradient>
            <linearGradient id="fill-mobile" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="var(--mobile)" stop-opacity="0.24" />
              <stop offset="100%" stop-color="var(--mobile)" stop-opacity="0" />
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
          <path class="line" d={desktop.line} stroke="var(--desktop)" />
          <path class="line" d={mobile.line} stroke="var(--mobile)" />

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
            {const d = $derived(shown[hover ?? 0]!)}
            <line class="crosshair" x1={x(hover)} x2={x(hover)} y1={PAD_TOP} y2={y(0)} />
            <circle class="dot" cx={x(hover)} cy={y(d.desktop)} r="4" fill="var(--desktop)" />
            <circle class="dot" cx={x(hover)} cy={y(d.mobile)} r="4" fill="var(--mobile)" />
          {/if}
        </svg>

        {#if hover !== null}
          {const d = $derived(shown[hover ?? 0]!)}
          <div
            class="readout"
            class:readout--left={x(hover) > W - 180}
            style:left="{x(hover)}px"
            style:top="{PAD_TOP}px"
            aria-hidden="true"
          >
            <span class="muted">{dateFormat.format(d.date)}</span>
            <span class="readout__row"><i class="swatch desktop"></i>Desktop<b>{d.desktop}</b></span
            >
            <span class="readout__row"><i class="swatch mobile"></i>Mobile<b>{d.mobile}</b></span>
          </div>
        {/if}
      </div>
      <div class="legend">
        <span><i class="swatch desktop"></i>Desktop</span>
        <span><i class="swatch mobile"></i>Mobile</span>
      </div>
    </section>

    <section class="card">
      <h2>Outline</h2>
      <div class="table-wrap">
        <table>
          <caption class="sr-only">Document outline</caption>
          <thead>
            <tr>
              {#each columns as column (column.key)}
                <th
                  class:num={column.numeric}
                  aria-sort={sort?.key === column.key
                    ? sort.direction === "asc"
                      ? "ascending"
                      : "descending"
                    : undefined}
                >
                  <Button
                    class="sort"
                    data-variant="ghost"
                    onclick={() => toggleSort(column.key, column.numeric)}
                  >
                    {column.label}
                    {#if sort?.key !== column.key}
                      <ArrowUpDownIcon aria-hidden="true" class="sort__idle" />
                    {:else if sort.direction === "asc"}
                      <ArrowUpIcon aria-hidden="true" />
                    {:else}
                      <ArrowDownIcon aria-hidden="true" />
                    {/if}
                  </Button>
                </th>
              {/each}
            </tr>
          </thead>
          <tbody>
            {#each sortedRows as row (row.id)}
              <tr>
                <td>{row.header}</td>
                <td><span class="badge">{row.type}</span></td>
                <td
                  ><span class="badge" data-done={row.status === "Done" || undefined}
                    >{row.status}</span
                  ></td
                >
                <td class="num">{row.target}</td>
                <td class="num">{row.limit}</td>
                <td class:muted={row.reviewer === "Assign reviewer"}>{row.reviewer}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </section>
  </main>

  <ToastRegion toaster={toast}>
    <Toast>
      <ToastTitle />
    </Toast>
  </ToastRegion>
</div>

<style>
  .app {
    --desktop: var(--ui-primary);
    --mobile: var(--ui-muted-foreground);
    display: flex;
    align-items: stretch;
    align-self: stretch;
    width: 100%;
    height: 100%;
    background: var(--tint);
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
  }

  .workspace__mark :global(svg) {
    width: 12px;
    height: 12px;
  }

  .nav {
    display: flex;
    flex: 1;
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

  .user {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2);
    border-top: 1px solid var(--line-faint);
  }

  .who {
    display: grid;
    min-width: 0;
    font-size: var(--text-xs);
    line-height: 1.3;
  }

  .who small {
    color: var(--muted);
  }

  /* Main panel: flat, beside the sidebar */
  .main {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: calc(var(--ui-spacing) * 4);
    min-width: 0;
    padding: calc(var(--ui-spacing) * 4) calc(var(--ui-spacing) * 6) calc(var(--ui-spacing) * 8);
    overflow: auto;
    border-inline-start: 1px solid var(--line-faint);
    background: var(--paper);
  }

  .top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  h1 {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
  }

  h2 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
  }

  .muted {
    color: var(--ui-muted-foreground);
    font-size: 0.75rem;
  }

  .card {
    display: grid;
    gap: calc(var(--ui-spacing) * 3);
    padding: calc(var(--ui-spacing) * 4);
    border: 1px solid var(--ui-border);
    border-radius: calc(var(--ui-radius) * 2);
  }

  .card__head {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;
    gap: calc(var(--ui-spacing) * 2) calc(var(--ui-spacing) * 4);
  }

  .card__head p {
    margin: 2px 0 0;
  }

  .metrics {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: calc(var(--ui-spacing) * 3);
  }

  .metric {
    gap: calc(var(--ui-spacing) * 1);
  }

  .metric__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .metric__value {
    font-size: 1.5rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }

  .metric__note {
    font-size: 0.875rem;
    font-weight: 500;
  }

  .change {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 0 calc(var(--ui-spacing) * 1.5);
    border: 1px solid var(--ui-border);
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .change[data-down] {
    color: var(--ui-destructive);
  }

  .change :global(svg) {
    width: 12px;
    height: 12px;
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
    stroke: var(--ui-border);
  }

  .tick {
    fill: var(--ui-muted-foreground);
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
    stroke: var(--ui-muted-foreground);
    stroke-opacity: 0.5;
    stroke-dasharray: 3 3;
  }

  /* A ring in the card color keeps the marker legible where lines cross. */
  .dot {
    stroke: var(--ui-background);
    stroke-width: 2;
  }

  .readout {
    position: absolute;
    display: grid;
    gap: 4px;
    min-width: 140px;
    margin-left: 12px;
    padding: calc(var(--ui-spacing) * 2) calc(var(--ui-spacing) * 2.5);
    border: 1px solid var(--ui-border);
    border-radius: var(--ui-radius);
    background: var(--ui-background);
    box-shadow: var(--ui-shadow);
    font-size: 0.75rem;
    pointer-events: none;
  }

  .readout--left {
    transform: translateX(calc(-100% - 24px));
  }

  .readout__row {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .readout__row b {
    margin-left: auto;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
  }

  .legend {
    display: flex;
    gap: calc(var(--ui-spacing) * 4);
    color: var(--ui-muted-foreground);
    font-size: 0.75rem;
  }

  .legend span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .swatch {
    width: 8px;
    height: 8px;
    border-radius: 2px;
  }

  .swatch.desktop {
    background: var(--desktop);
  }

  .swatch.mobile {
    background: var(--mobile);
  }

  .table-wrap {
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
  }

  th,
  td {
    height: calc(var(--ui-spacing) * 10);
    padding: 0 calc(var(--ui-spacing) * 3);
    border-bottom: 1px solid var(--ui-border);
    text-align: start;
    white-space: nowrap;
  }

  th {
    color: var(--ui-muted-foreground);
    font-weight: 500;
  }

  tbody tr:last-child td {
    border-bottom: 0;
  }

  tbody tr:hover {
    background: var(--ui-muted);
  }

  .num {
    text-align: end;
    font-variant-numeric: tabular-nums;
  }

  .badge {
    display: inline-flex;
    padding: 0 calc(var(--ui-spacing) * 1.5);
    border: 1px solid var(--ui-border);
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 500;
    line-height: 1.25rem;
  }

  .badge[data-done] {
    border-color: var(--ui-primary);
    background: var(--ui-primary);
    color: var(--ui-primary-foreground);
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
  }

  /* Sortable headers: a ghost Button that reads as the header text. */
  th :global(.sort) {
    gap: var(--space-1);
    height: auto;
    margin-inline: calc(var(--space-1) * -1);
    padding-inline: var(--space-1);
    color: var(--muted);
    font-size: var(--text-xs);
    font-weight: 500;
  }

  th :global(.sort svg) {
    width: 13px;
    height: 13px;
  }
</style>
