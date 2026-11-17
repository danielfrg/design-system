<script lang="ts">
  import {
    ArrowUpCircleIcon,
    CheckIcon,
    BookOpenIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    CircleHelpIcon,
    CopyIcon,
    DownloadIcon,
    EllipsisIcon,
    FileTextIcon,
    FilterIcon,
    LockIcon,
    NetworkIcon,
    SearchIcon,
    SettingsIcon,
    UsersIcon,
  } from "@lucide/svelte";
  import { Avatar, AvatarFallback } from "@ui-sdk/svelte/avatar";
  import { Button } from "@ui-sdk/svelte/button";
  import { Input, InputGroup } from "@ui-sdk/svelte/input";
  import {
    Menu,
    MenuCheckboxItem,
    MenuContent,
    MenuGroup,
    MenuGroupLabel,
    MenuItem,
    MenuItemIndicator,
    MenuSeparator,
    MenuTrigger,
  } from "@ui-sdk/svelte/menu";
  import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@ui-sdk/svelte/popover";
  import { Toast, ToastRegion, ToastTitle, createToaster } from "@ui-sdk/svelte/toast";
  import { Tooltip, TooltipContent, TooltipTrigger } from "@ui-sdk/svelte/tooltip";
  import { onDestroy } from "svelte";
  import {
    sortRows,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    type TableSort,
  } from "@custom/table";

  type Tag = "expiry" | "subnets" | "exit" | "ssh";

  interface Machine {
    name: string;
    owner: string;
    aclTag?: string;
    tags: Tag[];
    ipv4: string;
    ipv6: string;
    version: string;
    os: string;
    updateAvailable: boolean;
    // Minutes since last seen; 0 means connected right now.
    lastSeen: number;
  }

  const machines: Machine[] = [
    {
      name: "edge-router",
      owner: "ada@example.com",
      tags: ["expiry", "subnets", "exit"],
      ipv4: "192.0.2.10",
      ipv6: "2001:db8::a10",
      version: "1.104.4",
      os: "Linux 5.6.3",
      updateAvailable: true,
      lastSeen: 0,
    },
    {
      name: "living-room-tv",
      owner: "ada@example.com",
      tags: ["expiry", "subnets"],
      ipv4: "192.0.2.11",
      ipv6: "2001:db8::a11",
      version: "1.104.6",
      os: "tvOS 27.2.0",
      updateAvailable: false,
      lastSeen: 0,
    },
    {
      name: "server-01",
      owner: "ada@example.com",
      aclTag: "tag:servers",
      tags: ["expiry", "ssh"],
      ipv4: "192.0.2.21",
      ipv6: "2001:db8::a21",
      version: "1.104.5",
      os: "Linux 7.0.14-arch1-1",
      updateAvailable: true,
      lastSeen: 0,
    },
    {
      name: "server-02",
      owner: "ada@example.com",
      aclTag: "tag:servers",
      tags: ["expiry", "ssh"],
      ipv4: "192.0.2.22",
      ipv6: "2001:db8::a22",
      version: "1.104.5",
      os: "Linux 7.2.14-arch1-1",
      updateAvailable: true,
      lastSeen: 0,
    },
    {
      name: "pi-garage",
      owner: "ada@example.com",
      aclTag: "tag:servers",
      tags: ["expiry", "ssh"],
      ipv4: "192.0.2.23",
      ipv6: "2001:db8::a23",
      version: "1.104.5",
      os: "Linux 6.12.47+rpt-rpi-2712",
      updateAvailable: true,
      lastSeen: 0,
    },
    {
      name: "tablet",
      owner: "ada@example.com",
      tags: [],
      ipv4: "192.0.2.31",
      ipv6: "2001:db8::a31",
      version: "1.104.6",
      os: "iOS 26.6.1",
      updateAvailable: false,
      lastSeen: 0,
    },
    {
      name: "phone",
      owner: "ada@example.com",
      tags: [],
      ipv4: "192.0.2.32",
      ipv6: "2001:db8::a32",
      version: "1.104.6",
      os: "iOS 27.2.0",
      updateAvailable: false,
      lastSeen: 6060,
    },
    {
      name: "laptop",
      owner: "ada@example.com",
      tags: [],
      ipv4: "192.0.2.33",
      ipv6: "2001:db8::a33",
      version: "1.104.5",
      os: "macOS 26.7.1",
      updateAvailable: true,
      lastSeen: 0,
    },
    {
      name: "work-laptop",
      owner: "grace@example.com",
      tags: [],
      ipv4: "192.0.2.34",
      ipv6: "2001:db8::a34",
      version: "1.104.4-dev20261102",
      os: "macOS 26.7.1",
      updateAvailable: true,
      lastSeen: 0,
    },
    {
      name: "desktop",
      owner: "grace@example.com",
      tags: ["expiry"],
      ipv4: "192.0.2.35",
      ipv6: "2001:db8::a35",
      version: "1.104.6",
      os: "Windows 11 24H2",
      updateAvailable: false,
      lastSeen: 2,
    },
    {
      name: "nas",
      owner: "ada@example.com",
      aclTag: "tag:servers",
      tags: ["expiry", "subnets"],
      ipv4: "192.0.2.40",
      ipv6: "2001:db8::a40",
      version: "1.102.0",
      os: "Linux 6.6.44",
      updateAvailable: true,
      lastSeen: 50400,
    },
  ];

  const tagLabel: Record<Tag, string> = {
    expiry: "Expiry disabled",
    subnets: "Subnets",
    exit: "Exit Node",
    ssh: "SSH",
  };

  const networkNav = ["Machines", "Apps", "Services", "DNS"];
  const settingsNav = ["General", "User management", "Device management", "Keys"];

  const toast = createToaster();
  onDestroy(() => toast.dismiss());

  let query = $state("");
  let onlyConnected = $state(false);
  let onlyUpdates = $state(false);
  let sort = $state<TableSort | null>(null);

  const visible = $derived(
    sortRows(
      machines.filter((m) => {
        const q = query.trim().toLowerCase();
        const text =
          `${m.name} ${m.owner} ${m.aclTag ?? ""} ${m.version} ${m.os} ${m.ipv4}`.toLowerCase();
        if (q && !text.includes(q)) return false;
        if (onlyConnected && m.lastSeen !== 0) return false;
        if (onlyUpdates && !m.updateAvailable) return false;
        return true;
      }),
      sort,
    ),
  );

  function lastSeenLabel(minutes: number): string {
    if (minutes === 0) return "Connected";
    if (minutes < 60) return `${minutes} min ago`;
    if (minutes < 60 * 24) return `${Math.round(minutes / 60)} hours ago`;
    return `${Math.round(minutes / 60 / 24)} days ago`;
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast(`Copied ${text}`);
    } catch {
      toast("Couldn't copy to the clipboard");
    }
  }
</script>

<div class="app">
  <aside class="sidebar">
    <div class="sidebar__top">
      <span class="workspace">
        <span class="workspace__mark" aria-hidden="true">
          {#each { length: 9 }, index (index)}<span></span>{/each}
        </span>
        acme.example
      </span>
      <span class="plan">Free</span>
    </div>

    <nav class="nav" aria-label="Admin">
      <Button class="nav__item" data-variant="ghost">
        <NetworkIcon aria-hidden="true" />
        Network
        <ChevronDownIcon aria-hidden="true" class="nav__chevron" />
      </Button>
      <div class="nav__sub">
        {#each networkNav as item (item)}
          <Button
            class="nav__item"
            data-variant="ghost"
            aria-current={item === "Machines" ? "page" : undefined}
            onclick={() => item !== "Machines" && toast(`${item} isn't part of this example`)}
          >
            {item}
          </Button>
        {/each}
      </div>
      <Button class="nav__item" data-variant="ghost"><UsersIcon aria-hidden="true" />Users</Button>
      <Button class="nav__item" data-variant="ghost">
        <LockIcon aria-hidden="true" />
        Access controls
        <ChevronRightIcon aria-hidden="true" class="nav__chevron" />
      </Button>
      <Button class="nav__item" data-variant="ghost">
        <FileTextIcon aria-hidden="true" />
        Logs
        <ChevronRightIcon aria-hidden="true" class="nav__chevron" />
      </Button>
      <Button class="nav__item" data-variant="ghost">
        <SettingsIcon aria-hidden="true" />
        Settings
        <ChevronDownIcon aria-hidden="true" class="nav__chevron" />
      </Button>
      <div class="nav__sub">
        {#each settingsNav as item (item)}
          <Button class="nav__item" data-variant="ghost">{item}</Button>
        {/each}
      </div>
    </nav>

    <div class="sidebar__bottom">
      <Button class="nav__item" data-variant="ghost"
        ><BookOpenIcon aria-hidden="true" />Resource hub</Button
      >
      <Button class="nav__item" data-variant="ghost"
        ><CircleHelpIcon aria-hidden="true" />Help</Button
      >
      <div class="user">
        <Avatar class="user__avatar"><AvatarFallback>AL</AvatarFallback></Avatar>
        <span class="user__text">
          <span class="user__name">Ada Lovelace</span>
          <span class="user__email">ada@example.com</span>
        </span>
      </div>
    </div>
  </aside>

  <main class="main">
    <header class="header">
      <div>
        <h1>Machines</h1>
        <p>
          Manage the devices connected to your tailnet.
          <a href="#example-machines">See how to manage devices</a>
        </p>
      </div>
      <Menu onAction={(value) => toast(`${value}…`)}>
        <MenuTrigger data-variant="solid">
          Add device
          <ChevronDownIcon aria-hidden="true" />
        </MenuTrigger>
        <MenuContent align="end">
          <MenuItem value="Add a Linux server">Linux server</MenuItem>
          <MenuItem value="Add a client device">Client device</MenuItem>
          <MenuSeparator />
          <MenuItem value="Generate an auth key">Generate auth key</MenuItem>
        </MenuContent>
      </Menu>
    </header>

    <div class="toolbar">
      <InputGroup class="search">
        <SearchIcon aria-hidden="true" />
        <Input
          type="search"
          bind:value={query}
          placeholder="Search by name, owner, tag, version…"
          aria-label="Search machines"
        />
      </InputGroup>
      <Menu>
        <MenuTrigger>
          <FilterIcon aria-hidden="true" />
          Filters
          <ChevronDownIcon aria-hidden="true" />
        </MenuTrigger>
        <MenuContent>
          <MenuGroup>
            <MenuGroupLabel>Show only</MenuGroupLabel>
            <MenuCheckboxItem bind:checked={onlyConnected} value="connected">
              <MenuItemIndicator keepMounted><CheckIcon aria-hidden="true" /></MenuItemIndicator>
              Connected
            </MenuCheckboxItem>
            <MenuCheckboxItem bind:checked={onlyUpdates} value="updates">
              <MenuItemIndicator keepMounted><CheckIcon aria-hidden="true" /></MenuItemIndicator>
              Update available
            </MenuCheckboxItem>
          </MenuGroup>
        </MenuContent>
      </Menu>
      <a href="#example-machines" class="learn">Learn more</a>
      <Tooltip type="label">
        <TooltipTrigger
          class="export"
          aria-label="Export machines"
          onclick={() => toast("Exported machines.csv")}
        >
          <DownloadIcon aria-hidden="true" />
        </TooltipTrigger>
        <TooltipContent>Export as CSV</TooltipContent>
      </Tooltip>
    </div>

    <span class="count">{visible.length} machines</span>

    <Table bind:sort>
      <TableHeader>
        <TableRow>
          <TableHead sortKey="name">Machine</TableHead>
          <TableHead sortKey="ipv4">Addresses</TableHead>
          <TableHead sortKey="version" firstDirection="desc">Version</TableHead>
          <TableHead sortKey="lastSeen">Last seen</TableHead>
          <TableHead><span class="sr-only">Actions</span></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {#each visible as machine (machine.name)}
          <TableRow>
            <TableCell>
              <div class="machine">
                <span class="machine__name">{machine.name}</span>
                {#if machine.aclTag}
                  <span class="pill">{machine.aclTag}</span>
                {:else}
                  <span>{machine.owner}</span>
                {/if}
                {#if machine.tags.length}
                  <span class="tags">
                    {#each machine.tags as tag (tag)}
                      <span class="tag" data-tag={tag}>{tagLabel[tag]}</span>
                    {/each}
                  </span>
                {/if}
              </div>
            </TableCell>
            <TableCell>
              <Popover>
                <PopoverTrigger class="address" data-variant="ghost">
                  {machine.ipv4}
                  <ChevronDownIcon aria-hidden="true" />
                </PopoverTrigger>
                <PopoverContent align="start">
                  <PopoverTitle>{machine.name}</PopoverTitle>
                  <dl class="addresses">
                    {#each [["IPv4", machine.ipv4], ["IPv6", machine.ipv6], ["MagicDNS", `${machine.name}.tailnet.example`]] as [label, value] (label)}
                      <dt>{label}</dt>
                      <dd>
                        <span>{value}</span>
                        <Button
                          data-variant="ghost"
                          aria-label="Copy {label}"
                          onclick={() => copy(value)}
                        >
                          <CopyIcon aria-hidden="true" />
                        </Button>
                      </dd>
                    {/each}
                  </dl>
                </PopoverContent>
              </Popover>
            </TableCell>
            <TableCell>
              <div class="version">
                <span class="version__icon">
                  {#if machine.updateAvailable}
                    <Tooltip type="label">
                      <TooltipTrigger data-variant="ghost" aria-label="Update available">
                        <ArrowUpCircleIcon aria-hidden="true" />
                      </TooltipTrigger>
                      <TooltipContent>Update available</TooltipContent>
                    </Tooltip>
                  {/if}
                </span>
                <span class="version__text">
                  <span>{machine.version}</span>
                  <span class="muted">{machine.os}</span>
                </span>
              </div>
            </TableCell>
            <TableCell>
              <span class="seen" data-connected={machine.lastSeen === 0 || undefined}>
                {lastSeenLabel(machine.lastSeen)}
              </span>
            </TableCell>
            <TableCell align="end">
              <Menu onAction={(value) => toast(`${value} ${machine.name}`)}>
                <MenuTrigger data-variant="ghost" aria-label="Actions for {machine.name}">
                  <EllipsisIcon aria-hidden="true" />
                </MenuTrigger>
                <MenuContent align="end">
                  <MenuItem value="Edit name of">Edit machine name…</MenuItem>
                  <MenuItem value="Share">Share…</MenuItem>
                  <MenuItem value="Disable key expiry for">Disable key expiry</MenuItem>
                  <MenuSeparator />
                  <MenuItem value="Removed" data-destructive>Remove…</MenuItem>
                </MenuContent>
              </Menu>
            </TableCell>
          </TableRow>
        {:else}
          <TableRow>
            <TableCell colspan={5} align="center" style="height: 96px; color: var(--muted)">
              No machines match your search.
            </TableCell>
          </TableRow>
        {/each}
      </TableBody>
    </Table>
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
    /* Light: a gray sidebar. Dark: a sidebar a step darker than the page. */
    background: light-dark(var(--tint), color-mix(in oklab, var(--paper) 78%, black));
    color: var(--ink);
    font-size: var(--text-md);
  }

  /* Sidebar */
  .sidebar {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    width: 232px;
    flex-shrink: 0;
    padding: var(--space-3) var(--space-2);
    overflow-y: auto;
  }

  .sidebar__top {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-1) var(--space-1) var(--space-3);
    border-bottom: 1px solid var(--line-faint);
  }

  .workspace {
    display: flex;
    flex: 1;
    align-items: center;
    gap: var(--space-2);
    font-weight: 500;
  }

  .workspace__mark {
    display: grid;
    grid-template-columns: repeat(3, 4px);
    gap: 2px;
  }

  .workspace__mark span {
    width: 4px;
    height: 4px;
    border-radius: 999px;
    background: var(--ink);
  }

  .workspace__mark span:nth-child(odd) {
    opacity: 0.45;
  }

  .plan,
  .count {
    padding: 1px 6px;
    border-radius: var(--radius-xs);
    background: var(--line);
    color: color-mix(in oklab, var(--ink) 80%, var(--muted));
    font-size: var(--text-xs);
    font-weight: 500;
  }

  .nav {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .nav :global(.nav__item) {
    justify-content: flex-start;
    gap: var(--space-2);
    width: 100%;
    height: var(--size-sm);
    padding-inline: var(--space-2);
    font-weight: 400;
  }

  .nav :global(.nav__item[aria-current]) {
    background: color-mix(in oklab, var(--ink) 9%, transparent);
    font-weight: 500;
  }

  .nav :global(.nav__item svg) {
    width: 15px;
    height: 15px;
  }

  .nav :global(.nav__chevron) {
    margin-inline-start: auto;
    color: var(--muted);
  }

  .nav__sub {
    display: flex;
    flex-direction: column;
    gap: 1px;
    margin-inline-start: 15px;
    padding-inline-start: var(--space-2);
    border-inline-start: 1px solid var(--line-faint);
  }

  .sidebar__bottom {
    display: flex;
    flex-direction: column;
    gap: 1px;
    margin-top: auto;
  }

  .sidebar__bottom :global(.nav__item) {
    justify-content: flex-start;
    gap: var(--space-2);
    height: var(--size-sm);
    padding-inline: var(--space-2);
    font-weight: 400;
  }

  .sidebar__bottom :global(.nav__item svg) {
    width: 15px;
    height: 15px;
  }

  .user {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-top: var(--space-2);
    padding: var(--space-3) var(--space-1) 0;
    border-top: 1px solid var(--line-faint);
  }

  .user :global(.user__avatar) {
    width: 28px;
    height: 28px;
    font-size: 10px;
  }

  .user__text {
    display: grid;
    min-width: 0;
  }

  .user__name {
    font-weight: 500;
  }

  .user__email {
    overflow: hidden;
    color: var(--muted);
    font-size: var(--text-xs);
    text-overflow: ellipsis;
  }

  /* Main panel: flat, beside the sidebar */
  .main {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: var(--space-4);
    min-width: 0;
    padding: var(--space-8) var(--space-8) var(--space-6);
    overflow: auto;
    border-inline-start: 1px solid var(--line-faint);
    background: var(--paper);
  }

  .header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-4);
  }

  h1 {
    margin: 0 0 var(--space-1);
    font-size: 1.5rem;
    font-weight: 600;
    letter-spacing: -0.01em;
  }

  .header p {
    margin: 0;
  }

  .header a,
  .learn {
    white-space: nowrap;
    color: var(--accent);
    text-decoration: underline;
    text-decoration-color: color-mix(in oklab, var(--accent) 40%, transparent);
    text-underline-offset: 3px;
  }

  .toolbar {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .toolbar :global(.search) {
    flex: 0 1 42rem;
  }

  .toolbar :global(.export) {
    margin-inline-start: auto;
  }

  .count {
    align-self: flex-start;
    padding: 2px 8px;
    border-radius: 999px;
  }

  /* Machine table */
  .main :global([data-slot="table-head"]) {
    font-size: var(--text-xs);
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .main :global([data-slot="table-cell"]) {
    padding-block: var(--space-3);
    vertical-align: top;
  }

  .machine {
    display: grid;
    justify-items: start;
    gap: 2px;
  }

  .machine__name {
    font-weight: 500;
  }

  .pill {
    padding: 0 8px;
    border: 1px solid var(--line);
    border-radius: 999px;
    font-size: var(--text-xs);
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 2px;
  }

  .tag {
    padding: 0 5px;
    border-radius: var(--radius-xs);
    background: var(--line);
    color: color-mix(in oklab, var(--ink) 80%, var(--muted));
    font-size: var(--text-xs);
    font-weight: 500;
  }

  .tag[data-tag="subnets"],
  .tag[data-tag="exit"] {
    background: light-dark(#e4ebfb, #3f5db3);
    color: light-dark(#173f9c, #cedefd);
  }

  .tag[data-tag="ssh"] {
    background: light-dark(#dcfce7, #09825d);
    color: light-dark(#166534, #efffed);
  }

  .main :global(.address) {
    gap: var(--space-1);
    height: auto;
    margin-inline-start: calc(var(--space-2) * -1);
    padding: 0 var(--space-2);
    font-weight: 400;
    font-variant-numeric: tabular-nums;
  }

  .addresses {
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    gap: var(--space-1) var(--space-4);
    margin: 0;
    font-size: var(--text-sm);
  }

  .addresses dt {
    color: var(--muted);
  }

  .addresses dd {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
    margin: 0;
    font-variant-numeric: tabular-nums;
  }

  .addresses :global([data-slot="button"]) {
    width: 24px;
    height: 24px;
    padding: 0;
  }

  .version {
    display: flex;
    gap: var(--space-2);
  }

  .version__icon {
    display: grid;
    width: 20px;
    color: var(--muted);
  }

  .version__icon :global([data-slot="tooltip-trigger"]) {
    width: 20px;
    height: 20px;
    padding: 0;
  }

  .version__text {
    display: grid;
  }

  .muted {
    color: var(--muted);
  }

  .seen {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    white-space: nowrap;
  }

  .seen::before {
    content: "";
    width: 7px;
    height: 7px;
    border-radius: 999px;
    background: var(--muted);
  }

  .seen[data-connected]::before {
    background: light-dark(#16a34a, #22c55e);
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  @container (max-width: 760px) {
    .sidebar {
      display: none;
    }

    .main {
      padding: var(--space-6) var(--space-4);
      border-inline-start: 0;
    }
  }
</style>
