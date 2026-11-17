<script lang="ts">
  import { Button } from "@ui-sdk/svelte/button";
  import {
    ArrowDownIcon,
    ArrowRightIcon,
    ArrowUpDownIcon,
    ArrowUpIcon,
    CheckIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    EllipsisIcon,
    MinusIcon,
    XIcon,
  } from "@lucide/svelte";
  import { Checkbox, CheckboxIndicator } from "@ui-sdk/svelte/checkbox";
  import { Input } from "@ui-sdk/svelte/input";
  import {
    Menu,
    MenuContent,
    MenuItem,
    MenuSeparator,
    MenuTrigger,
    createMenuController,
  } from "@ui-sdk/svelte/menu";
  import {
    Pagination,
    PaginationItem,
    PaginationList,
    PaginationNext,
    PaginationPrevious,
  } from "@ui-sdk/svelte/pagination";
  import {
    Select,
    SelectClear,
    SelectContent,
    SelectItem,
    SelectItemIndicator,
    SelectLabel,
    SelectTrigger,
    SelectValue,
  } from "@ui-sdk/svelte/select";
  import {
    Toast,
    ToastDescription,
    ToastRegion,
    ToastTitle,
    createToaster,
  } from "@ui-sdk/svelte/toast";
  import { onDestroy } from "svelte";

  const STATUSES = ["Backlog", "Todo", "In progress", "Done", "Canceled"] as const;
  const PRIORITIES = ["Low", "Medium", "High"] as const;
  const LABELS = ["Bug", "Feature", "Documentation"] as const;
  type Status = (typeof STATUSES)[number];
  type Priority = (typeof PRIORITIES)[number];

  interface Task {
    id: string;
    title: string;
    label: (typeof LABELS)[number];
    status: Status;
    priority: Priority;
  }

  const TITLES = [
    "You can't compress the program without quantifying the open-source SSD pixel!",
    "Try to calculate the EXE feed, maybe it will index the multi-byte pixel!",
    "We need to bypass the neural TCP card!",
    "The SAS interface is down, bypass the open-source pixel so we can back up the PNG bandwidth!",
    "Use the redundant XSS firewall, then you can parse the haptic sensor.",
    "I'll connect the wireless SCSI bandwidth, that should interface the SQL port!",
    "Synthesizing the bluetooth protocol won't do anything, we need to hack the haptic RAM.",
    "Overriding the capacitor won't do anything, we need to navigate the digital API.",
    "The GB pixel is down, hack the virtual capacitor so we can parse the HDD bus!",
    "If we reboot the card, we can get to the SMTP monitor through the primary sensor.",
  ];

  // Deterministic, so the table is the same on every load.
  const tasks: Task[] = Array.from({ length: 42 }, (_, i) => ({
    id: `TASK-${8782 - i * 37}`,
    title: TITLES[i % TITLES.length]!,
    label: LABELS[(i * 7) % LABELS.length]!,
    status: STATUSES[(i * 3 + 1) % STATUSES.length]!,
    priority: PRIORITIES[(i * 5) % PRIORITIES.length]!,
  }));

  type SortKey = "id" | "title" | "status" | "priority";
  const columns: { key: SortKey; label: string; firstDirection: "asc" | "desc" }[] = [
    { key: "id", label: "Task", firstDirection: "asc" },
    { key: "title", label: "Title", firstDirection: "asc" },
    { key: "status", label: "Status", firstDirection: "asc" },
    { key: "priority", label: "Priority", firstDirection: "desc" },
  ];
  const sortValue: Record<SortKey, (task: Task) => string | number> = {
    id: (task) => task.id,
    title: (task) => task.title,
    status: (task) => STATUSES.indexOf(task.status),
    priority: (task) => PRIORITIES.indexOf(task.priority),
  };

  let query = $state("");
  let statuses = $state<string[]>([]);
  let priorities = $state<string[]>([]);
  let selected = $state(new Set<string>());
  let pageSize = $state("8");
  let page = $state(1);
  let sort = $state<{ key: SortKey; direction: "asc" | "desc" } | null>(null);

  const toast = createToaster();
  onDestroy(() => toast.dismiss());
  const rowMenu = createMenuController<Task>();

  const filtered = $derived(
    tasks.filter(
      (task) =>
        (!query || `${task.id} ${task.title}`.toLowerCase().includes(query.toLowerCase())) &&
        (statuses.length === 0 || statuses.includes(task.status)) &&
        (priorities.length === 0 || priorities.includes(task.priority)),
    ),
  );
  const sorted = $derived.by(() => {
    if (!sort) return filtered;
    const { key, direction } = sort;
    const sign = direction === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const x = sortValue[key](a);
      const y = sortValue[key](b);
      return (x < y ? -1 : x > y ? 1 : 0) * sign;
    });
  });
  const size = $derived(Number(pageSize));
  const pages = $derived(Math.max(1, Math.ceil(sorted.length / size)));
  const visible = $derived(sorted.slice((page - 1) * size, page * size));
  const visibleSelected = $derived(visible.filter((t) => selected.has(t.id)).length);
  const headerChecked = $derived(
    visibleSelected === 0 ? false : visibleSelected === visible.length ? true : "indeterminate",
  );

  function toggleSort(key: SortKey, firstDirection: "asc" | "desc") {
    if (sort?.key !== key) sort = { key, direction: firstDirection };
    else if (sort.direction === firstDirection)
      sort = { key, direction: firstDirection === "asc" ? "desc" : "asc" };
    else sort = null;
  }

  function ariaSort(key: SortKey) {
    if (sort?.key !== key) return undefined;
    return sort.direction === "asc" ? "ascending" : "descending";
  }

  function setRow(id: string, checked: boolean) {
    const next = new Set(selected);
    if (checked) next.add(id);
    else next.delete(id);
    selected = next;
  }

  function setVisible(checked: boolean) {
    const next = new Set(selected);
    for (const task of visible) {
      if (checked) next.add(task.id);
      else next.delete(task.id);
    }
    selected = next;
  }

  const countBy = (key: "status" | "priority", value: string) =>
    tasks.filter((t) => t[key] === value).length;

  const actionLabel: Record<string, string> = {
    edit: "Editing",
    copy: "Copied",
    favorite: "Favorited",
    delete: "Deleted",
  };
</script>

{#snippet filter(label: string, options: readonly string[], key: "status" | "priority")}
  <div class="filter">
    <SelectLabel>{label}</SelectLabel>
    <SelectTrigger>
      <SelectValue>
        {#snippet children(state)}
          {label}{#if !state.placeholder}<span class="badge">{state.labels.length}</span>{/if}
        {/snippet}
      </SelectValue>
    </SelectTrigger>
    <SelectClear aria-label="Clear {label.toLowerCase()} filter">
      <XIcon aria-hidden="true" />
    </SelectClear>
  </div>
  <SelectContent>
    {#each options as option (option)}
      <SelectItem value={option} label={option}>
        <SelectItemIndicator keepMounted>
          <CheckIcon aria-hidden="true" />
        </SelectItemIndicator>
        {option}
        <span class="option-count">{countBy(key, option)}</span>
      </SelectItem>
    {/each}
  </SelectContent>
{/snippet}

<div class="tasks">
  <header>
    <h1>Welcome back!</h1>
    <p>Here's a list of your tasks for this month.</p>
  </header>

  <div class="toolbar">
    <Input
      type="search"
      aria-label="Filter tasks"
      placeholder="Filter tasks…"
      bind:value={query}
      onValueChange={() => (page = 1)}
    />
    <Select multiple bind:value={statuses} placeholder="Status" onValueChange={() => (page = 1)}>
      {@render filter("Status", STATUSES, "status")}
    </Select>
    <Select
      multiple
      bind:value={priorities}
      placeholder="Priority"
      onValueChange={() => (page = 1)}
    >
      {@render filter("Priority", PRIORITIES, "priority")}
    </Select>
  </div>

  <div class="table-wrap">
    <table>
      <caption class="sr-only">Tasks</caption>
      <thead>
        <tr>
          <th class="narrow">
            <Checkbox
              aria-label="Select all rows on this page"
              checked={headerChecked}
              disabled={visible.length === 0}
              onCheckedChange={(checked) => setVisible(checked === true)}
            >
              <CheckboxIndicator>
                {#snippet children(state)}
                  {#if state.indeterminate}<MinusIcon aria-hidden="true" />{:else}<CheckIcon
                      aria-hidden="true"
                    />{/if}
                {/snippet}
              </CheckboxIndicator>
            </Checkbox>
          </th>
          {#each columns as column (column.key)}
            <th aria-sort={ariaSort(column.key)}>
              <Button
                onclick={() => toggleSort(column.key, column.firstDirection)}
              >
                {column.label}
                {#if sort?.key === column.key}
                  {#if sort.direction === "asc"}<ArrowUpIcon
                      aria-hidden="true"
                    />{:else}<ArrowDownIcon aria-hidden="true" />{/if}
                {:else}
                  <ArrowUpDownIcon aria-hidden="true" class="sort__idle" />
                {/if}
              </Button>
            </th>
          {/each}
          <th class="narrow"><span class="sr-only">Actions</span></th>
        </tr>
      </thead>
      <tbody>
        {#each visible as task (task.id)}
          <tr data-selected={selected.has(task.id) || undefined}>
            <td class="narrow">
              <Checkbox
                aria-label="Select {task.id}"
                checked={selected.has(task.id)}
                onCheckedChange={(checked) => setRow(task.id, checked === true)}
              >
                <CheckboxIndicator>
                  <CheckIcon aria-hidden="true" />
                </CheckboxIndicator>
              </Checkbox>
            </td>
            <td class="id">{task.id}</td>
            <td>
              <div class="title">
                <span class="badge">{task.label}</span>
                <span class="title__text">{task.title}</span>
              </div>
            </td>
            <td><span class="badge" data-status={task.status}>{task.status}</span></td>
            <td>
              <span class="priority">
                {#if task.priority === "High"}
                  <ArrowUpIcon aria-hidden="true" />
                {:else if task.priority === "Low"}
                  <ArrowDownIcon aria-hidden="true" />
                {:else}
                  <ArrowRightIcon aria-hidden="true" />
                {/if}
                {task.priority}
              </span>
            </td>
            <td class="narrow">
              <MenuTrigger controller={rowMenu} payload={task} aria-label="Actions for {task.id}">
                <EllipsisIcon aria-hidden="true" />
              </MenuTrigger>
            </td>
          </tr>
        {:else}
          <tr><td class="empty" colspan="6">No results.</td></tr>
        {/each}
      </tbody>
    </table>
  </div>

  <footer class="pager">
    <span class="muted">{selected.size} of {sorted.length} row(s) selected.</span>
    <div class="pager__controls">
      <Select bind:value={pageSize} onValueChange={() => (page = 1)}>
        <div class="rows">
          <SelectLabel>Rows per page</SelectLabel>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
        </div>
        <SelectContent>
          {#each ["8", "16", "24"] as n (n)}
            <SelectItem value={n}>
              {n}
              <SelectItemIndicator>
                <CheckIcon aria-hidden="true" />
              </SelectItemIndicator>
            </SelectItem>
          {/each}
        </SelectContent>
      </Select>
      <span class="muted">Page {Math.min(page, pages)} of {pages}</span>
      <Pagination aria-label="Task pages" bind:page total={sorted.length} pageSize={size}>
        <PaginationList>
          <PaginationItem>
            <PaginationPrevious aria-label="Previous page">
              <ChevronLeftIcon aria-hidden="true" />
            </PaginationPrevious>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext aria-label="Next page">
              <ChevronRightIcon aria-hidden="true" />
            </PaginationNext>
          </PaginationItem>
        </PaginationList>
      </Pagination>
    </div>
  </footer>

  <Menu
    controller={rowMenu}
    onAction={(action) => {
      const task = rowMenu.getPayload();
      if (task) toast(`${actionLabel[action]} ${task.id}`);
    }}
  >
    <MenuContent align="end">
      <MenuItem value="edit">Edit</MenuItem>
      <MenuItem value="copy">Make a copy</MenuItem>
      <MenuItem value="favorite">Favorite</MenuItem>
      <MenuSeparator />
      <MenuItem value="delete" destructive>Delete</MenuItem>
    </MenuContent>
  </Menu>

  <ToastRegion toaster={toast}>
    <Toast>
      <ToastTitle />
      <ToastDescription />
    </Toast>
  </ToastRegion>
</div>

<style>
  .tasks {
    display: flex;
    flex-direction: column;
    gap: calc(var(--ui-spacing) * 4);
    min-height: 100%;
    padding: calc(var(--ui-spacing) * 6) calc(var(--ui-spacing) * 7);
    background: var(--ui-background);
    color: var(--ui-foreground);
  }

  h1 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
  }

  header p {
    margin: 2px 0 0;
    color: var(--ui-muted-foreground);
    font-size: 0.875rem;
  }

  .toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: calc(var(--ui-spacing) * 2);
  }

  .filter {
    display: flex;
    align-items: center;
    gap: calc(var(--ui-spacing) * 1);
  }

  .option-count {
    margin-inline-start: auto;
    padding-inline-start: calc(var(--ui-spacing) * 4);
    color: var(--ui-muted-foreground);
    font-variant-numeric: tabular-nums;
  }

  .table-wrap {
    overflow-x: auto;
    border: 1px solid var(--ui-border);
    border-radius: var(--ui-radius);
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
  }

  th,
  td {
    height: calc(var(--ui-spacing) * 11);
    padding: 0 calc(var(--ui-spacing) * 3);
    border-bottom: 1px solid var(--ui-border);
    text-align: start;
  }

  th {
    color: var(--ui-muted-foreground);
    font-weight: 500;
    white-space: nowrap;
  }

  tbody tr:last-child td {
    border-bottom: 0;
  }

  tbody tr:hover,
  tbody tr[data-selected] {
    background: var(--ui-muted);
  }

  .narrow {
    width: 44px;
  }

  .id {
    font-family: var(--ui-font-mono);
    font-size: 0.75rem;
    white-space: nowrap;
  }

  .title {
    display: flex;
    align-items: center;
    gap: calc(var(--ui-spacing) * 2);
    max-width: 440px;
  }

  .title__text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
    margin-inline-start: calc(var(--ui-spacing) * 1.5);
    padding: 0 calc(var(--ui-spacing) * 1.5);
    border: 1px solid var(--ui-border);
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 500;
    line-height: 1.25rem;
    white-space: nowrap;
  }

  td .badge {
    margin-inline-start: 0;
  }

  .badge[data-status="Done"] {
    border-color: var(--ui-primary);
    background: var(--ui-primary);
    color: var(--ui-primary-foreground);
  }

  .badge[data-status="In progress"] {
    background: var(--ui-muted);
  }

  .badge[data-status="Canceled"] {
    border-color: var(--ui-destructive);
    color: var(--ui-destructive);
  }

  .badge[data-status="Backlog"] {
    color: var(--ui-muted-foreground);
  }

  .priority {
    display: inline-flex;
    align-items: center;
    gap: calc(var(--ui-spacing) * 1.5);
  }

  .priority :global(svg) {
    width: 14px;
    height: 14px;
    color: var(--ui-muted-foreground);
  }

  .empty {
    height: calc(var(--ui-spacing) * 24);
    color: var(--ui-muted-foreground);
    text-align: center;
  }

  .pager {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: calc(var(--ui-spacing) * 2) calc(var(--ui-spacing) * 6);
    margin-top: auto;
  }

  .pager__controls,
  .rows {
    display: flex;
    align-items: center;
    gap: calc(var(--ui-spacing) * 3);
  }

  .muted,
  .rows {
    color: var(--ui-muted-foreground);
    font-size: 0.875rem;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
</style>
