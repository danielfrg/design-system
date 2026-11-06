<script lang="ts">
  import {
    Checkbox,
    Chip,
    FilterDropdown,
    IconButton,
    Menu,
    MenuContent,
    MenuItem,
    MenuSeparator,
    MenuTrigger,
    SearchInput,
    SelectDropdown,
    Table,
    TableHeaderCell,
    TableSort,
    showFlash,
  } from "@kenn-io/kit-ui";
  import ArrowDownIcon from "@lucide/svelte/icons/arrow-down";
  import ArrowRightIcon from "@lucide/svelte/icons/arrow-right";
  import ArrowUpIcon from "@lucide/svelte/icons/arrow-up";
  import ChevronLeftIcon from "@lucide/svelte/icons/chevron-left";
  import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
  import EllipsisIcon from "@lucide/svelte/icons/ellipsis";

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

  let query = $state("");
  let statuses = $state(new Set<string>());
  let priorities = $state(new Set<string>());
  let selected = $state(new Set<string>());
  let pageSize = $state("8");
  let page = $state(0);

  const sorter = new TableSort<Task>(
    {
      id: (task) => task.id,
      title: (task) => task.title,
      status: (task) => STATUSES.indexOf(task.status),
      priority: { value: (task) => PRIORITIES.indexOf(task.priority), firstDirection: "desc" },
    },
    null,
  );

  const filtered = $derived(
    tasks.filter(
      (task) =>
        (!query || `${task.id} ${task.title}`.toLowerCase().includes(query.toLowerCase())) &&
        (statuses.size === 0 || statuses.has(task.status)) &&
        (priorities.size === 0 || priorities.has(task.priority)),
    ),
  );
  const sorted = $derived(sorter.sort(filtered));
  const pages = $derived(Math.max(1, Math.ceil(sorted.length / Number(pageSize))));
  const visible = $derived(sorted.slice(page * Number(pageSize), (page + 1) * Number(pageSize)));
  const allVisibleSelected = $derived(
    visible.length > 0 && visible.every((t) => selected.has(t.id)),
  );

  function toggle(set: Set<string>, value: string): Set<string> {
    const next = new Set(set);
    if (!next.delete(value)) next.add(value);
    return next;
  }

  function toggleRow(id: string) {
    selected = toggle(selected, id);
  }

  function toggleVisible(checked: boolean) {
    const next = new Set(selected);
    for (const task of visible) {
      if (checked) next.add(task.id);
      else next.delete(task.id);
    }
    selected = next;
  }

  // Any filter change goes back to the first page.
  function resetPage() {
    page = 0;
  }

  const statusTone = {
    Backlog: "muted",
    Todo: "neutral",
    "In progress": "info",
    Done: "success",
    Canceled: "danger",
  } as const;
</script>

<div class="tasks">
  <header class="head">
    <div>
      <h1>Welcome back!</h1>
      <p>Here's a list of your tasks for this month.</p>
    </div>
  </header>

  <div class="toolbar">
    <div class="search">
      <SearchInput
        bind:value={query}
        placeholder="Filter tasks…"
        ariaLabel="Filter tasks"
        size="sm"
        block
        oninput={resetPage}
      />
    </div>
    <FilterDropdown
      label="Status"
      badgeCount={statuses.size}
      sections={[
        {
          items: STATUSES.map((status) => ({
            id: status,
            label: status,
            count: tasks.filter((t) => t.status === status).length,
            active: statuses.has(status),
            onSelect: () => {
              statuses = toggle(statuses, status);
              resetPage();
            },
          })),
        },
      ]}
      resetLabel="Clear filters"
      onReset={() => {
        statuses = new Set();
        resetPage();
      }}
    />
    <FilterDropdown
      label="Priority"
      badgeCount={priorities.size}
      sections={[
        {
          items: PRIORITIES.map((priority) => ({
            id: priority,
            label: priority,
            count: tasks.filter((t) => t.priority === priority).length,
            active: priorities.has(priority),
            onSelect: () => {
              priorities = toggle(priorities, priority);
              resetPage();
            },
          })),
        },
      ]}
      resetLabel="Clear filters"
      onReset={() => {
        priorities = new Set();
        resetPage();
      }}
    />
  </div>

  <Table ariaLabel="Tasks">
    {#snippet header()}
      <TableHeaderCell width={44}>
        <Checkbox
          ariaLabel="Select all rows on this page"
          checked={allVisibleSelected}
          indeterminate={!allVisibleSelected && visible.some((t) => selected.has(t.id))}
          onchange={toggleVisible}
        />
      </TableHeaderCell>
      <TableHeaderCell label="Task" sort={sorter} column="id" />
      <TableHeaderCell label="Title" sort={sorter} column="title" />
      <TableHeaderCell label="Status" sort={sorter} column="status" />
      <TableHeaderCell label="Priority" sort={sorter} column="priority" />
      <TableHeaderCell width={44}><span class="sr-only">Actions</span></TableHeaderCell>
    {/snippet}
    {#each visible as task (task.id)}
      <tr>
        <td class="narrow">
          <Checkbox
            ariaLabel={`Select ${task.id}`}
            checked={selected.has(task.id)}
            onchange={() => toggleRow(task.id)}
          />
        </td>
        <td class="id">{task.id}</td>
        <td>
          <div class="title">
            <Chip size="sm">{task.label}</Chip>
            <span>{task.title}</span>
          </div>
        </td>
        <td><Chip size="sm" tone={statusTone[task.status]}>{task.status}</Chip></td>
        <td>
          <span class="priority">
            {#if task.priority === "High"}
              <ArrowUpIcon size={13} aria-hidden="true" />
            {:else if task.priority === "Low"}
              <ArrowDownIcon size={13} aria-hidden="true" />
            {:else}
              <ArrowRightIcon size={13} aria-hidden="true" />
            {/if}
            {task.priority}
          </span>
        </td>
        <td class="narrow">
          <Menu>
            <MenuTrigger ariaLabel={`Actions for ${task.id}`}>
              <EllipsisIcon size={14} aria-hidden="true" />
            </MenuTrigger>
            <MenuContent ariaLabel={`Actions for ${task.id}`}>
              <MenuItem textValue="Edit" onselect={() => showFlash(`Edit ${task.id}`)}
                >Edit</MenuItem
              >
              <MenuItem textValue="Make a copy" onselect={() => showFlash(`Copied ${task.id}`)}>
                Make a copy
              </MenuItem>
              <MenuItem textValue="Favorite" onselect={() => showFlash(`Favorited ${task.id}`)}>
                Favorite
              </MenuItem>
              <MenuSeparator />
              <MenuItem
                tone="danger"
                textValue="Delete"
                onselect={() => showFlash(`Deleted ${task.id}`)}
              >
                Delete
              </MenuItem>
            </MenuContent>
          </Menu>
        </td>
      </tr>
    {:else}
      <tr><td class="empty" colspan="6">No results.</td></tr>
    {/each}
  </Table>

  <footer class="pager">
    <span class="count">{selected.size} of {sorted.length} row(s) selected.</span>
    <div class="pager__controls">
      <label class="rows">
        Rows per page
        <SelectDropdown
          value={pageSize}
          onchange={(value) => {
            pageSize = value;
            resetPage();
          }}
          options={["8", "16", "24"].map((n) => ({ value: n, label: n }))}
        />
      </label>
      <span class="count">Page {Math.min(page + 1, pages)} of {pages}</span>
      <IconButton ariaLabel="Previous page" disabled={page === 0} onclick={() => (page -= 1)}>
        <ChevronLeftIcon size={14} />
      </IconButton>
      <IconButton ariaLabel="Next page" disabled={page >= pages - 1} onclick={() => (page += 1)}>
        <ChevronRightIcon size={14} />
      </IconButton>
    </div>
  </footer>
</div>

<style>
  .tasks {
    display: grid;
    gap: 16px;
    align-content: start;
    min-height: 100%;
    padding: 24px 28px 32px;
    background: var(--bg-primary);
  }

  h1 {
    margin: 0;
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
  }

  .head p {
    margin: 2px 0 0;
    color: var(--text-muted);
    font-size: var(--font-size-sm);
  }

  .toolbar {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }

  .search {
    width: min(100%, 260px);
  }

  .narrow {
    width: 36px;
  }

  .id {
    font-family: var(--font-mono);
    font-size: var(--font-size-xs);
    white-space: nowrap;
  }

  .title {
    display: flex;
    align-items: center;
    gap: 8px;
    max-width: 440px;
  }

  .title span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .priority {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .empty {
    padding: 32px;
    color: var(--text-muted);
    text-align: center;
  }

  .pager {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px 24px;
  }

  .pager__controls {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .rows {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--text-muted);
    font-size: var(--font-size-sm);
  }

  .count {
    color: var(--text-muted);
    font-size: var(--font-size-sm);
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }
</style>
