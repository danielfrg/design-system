<script lang="ts">
  import {
    ArrowDownIcon,
    ArrowUpDownIcon,
    ArrowUpIcon,
    CheckIcon,
    ChevronLeftIcon,
    EllipsisIcon,
  } from "@lucide/svelte";
  import { Avatar, AvatarFallback } from "@ui-sdk/svelte/avatar";
  import { Button } from "@ui-sdk/svelte/button";
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
    Select,
    SelectContent,
    SelectItem,
    SelectItemIndicator,
    SelectLabel,
    SelectTrigger,
    SelectValue,
  } from "@ui-sdk/svelte/select";
  import { Toast, ToastRegion, ToastTitle, createToaster } from "@ui-sdk/svelte/toast";
  import { onDestroy } from "svelte";

  const categories = [
    { id: "preferences", label: "Preferences", group: "Account" },
    { id: "profile", label: "Profile", group: "Account" },
    { id: "notifications", label: "Notifications", group: "Account" },
    { id: "security", label: "Security & access", group: "Account" },
    { id: "workspace", label: "General", group: "Administration" },
    { id: "members", label: "Members", group: "Administration" },
    { id: "billing", label: "Billing", group: "Administration" },
  ];

  let active = $state("members");
  let navQuery = $state("");
  const navGroups = $derived.by(() => {
    const q = navQuery.trim().toLowerCase();
    const shown = categories.filter((c) => !q || `${c.label} ${c.group}`.toLowerCase().includes(q));
    return [...new Set(shown.map((c) => c.group))].map((group) => ({
      group,
      items: shown.filter((c) => c.group === group),
    }));
  });

  type Role = "Admin" | "Member" | "Guest";
  type MemberState = "Active" | "Invited" | "Suspended";
  interface Member {
    name: string;
    username: string;
    email: string;
    role: Role;
    state: MemberState;
    teams: number;
    joined: string;
    lastSeen: string;
  }

  // lastSeen is an ISO date, "online", or empty for people who never signed in.
  const members: Member[] = [
    {
      name: "Ada Lovelace",
      username: "ada",
      email: "ada@example.com",
      role: "Admin",
      state: "Active",
      teams: 3,
      joined: "2025-01-14",
      lastSeen: "online",
    },
    {
      name: "Grace Hopper",
      username: "grace",
      email: "grace@example.com",
      role: "Admin",
      state: "Active",
      teams: 2,
      joined: "2025-02-02",
      lastSeen: "2026-11-05",
    },
    {
      name: "Alan Turing",
      username: "alan",
      email: "alan@example.com",
      role: "Member",
      state: "Active",
      teams: 4,
      joined: "2025-03-21",
      lastSeen: "online",
    },
    {
      name: "Katherine Johnson",
      username: "katherine",
      email: "kj@example.com",
      role: "Member",
      state: "Active",
      teams: 1,
      joined: "2025-06-08",
      lastSeen: "2026-10-28",
    },
    {
      name: "Edsger Dijkstra",
      username: "edsger",
      email: "edsger@example.com",
      role: "Member",
      state: "Active",
      teams: 2,
      joined: "2025-09-30",
      lastSeen: "2026-11-01",
    },
    {
      name: "Barbara Liskov",
      username: "barbara",
      email: "liskov@example.com",
      role: "Guest",
      state: "Active",
      teams: 1,
      joined: "2026-04-11",
      lastSeen: "2026-09-17",
    },
    {
      name: "Linus Torvalds",
      username: "linus",
      email: "linus@example.com",
      role: "Member",
      state: "Invited",
      teams: 0,
      joined: "2026-11-03",
      lastSeen: "",
    },
    {
      name: "Margaret Hamilton",
      username: "margaret",
      email: "mh@example.com",
      role: "Member",
      state: "Invited",
      teams: 0,
      joined: "2026-11-04",
      lastSeen: "",
    },
    {
      name: "Dennis Ritchie",
      username: "dennis",
      email: "dmr@example.com",
      role: "Member",
      state: "Suspended",
      teams: 2,
      joined: "2025-01-20",
      lastSeen: "2026-03-02",
    },
  ];

  const STATES: MemberState[] = ["Active", "Invited", "Suspended"];
  const ROLES: Role[] = ["Admin", "Member", "Guest"];
  const roleOptions = [
    { value: "all", label: "All" },
    { value: "admin", label: "Admins" },
    { value: "member", label: "Members" },
    { value: "guest", label: "Guests" },
  ];

  type SortKey = "name" | "email" | "role" | "teams" | "joined" | "lastSeen";
  const columns: { key: SortKey; label: string; firstDirection: "asc" | "desc" }[] = [
    { key: "name", label: "Name", firstDirection: "asc" },
    { key: "email", label: "Email", firstDirection: "asc" },
    { key: "role", label: "Role", firstDirection: "asc" },
    { key: "teams", label: "Teams", firstDirection: "desc" },
    { key: "joined", label: "Joined", firstDirection: "desc" },
    { key: "lastSeen", label: "Last seen", firstDirection: "desc" },
  ];
  const sortValue: Record<SortKey, (m: Member) => string | number> = {
    name: (m) => m.name,
    email: (m) => m.email,
    role: (m) => ROLES.indexOf(m.role),
    teams: (m) => m.teams,
    joined: (m) => m.joined,
    lastSeen: (m) => (m.lastSeen === "online" ? "9999" : m.lastSeen),
  };

  let query = $state("");
  let roleFilter = $state("all");
  let sort = $state<{ key: SortKey; direction: "asc" | "desc" } | null>({
    key: "name",
    direction: "asc",
  });

  const toast = createToaster();
  onDestroy(() => toast.dismiss());
  const rowMenu = createMenuController<Member>();

  const filtered = $derived(
    members.filter((m) => {
      const q = query.trim().toLowerCase();
      const matchesQuery = !q || `${m.name} ${m.username} ${m.email}`.toLowerCase().includes(q);
      const matchesRole = roleFilter === "all" || m.role.toLowerCase() === roleFilter;
      return matchesQuery && matchesRole;
    }),
  );

  // Sort first, then split by state, so each group keeps the column order.
  const groups = $derived.by(() => {
    let sorted = filtered;
    if (sort) {
      const { key, direction } = sort;
      const sign = direction === "asc" ? 1 : -1;
      sorted = [...filtered].sort((a, b) => {
        const x = sortValue[key](a);
        const y = sortValue[key](b);
        return (x < y ? -1 : x > y ? 1 : 0) * sign;
      });
    }
    return STATES.map((state) => ({ state, rows: sorted.filter((m) => m.state === state) })).filter(
      (g) => g.rows.length > 0,
    );
  });

  function toggleSort(key: SortKey, firstDirection: "asc" | "desc") {
    if (sort?.key !== key) sort = { key, direction: firstDirection };
    else if (sort.direction === firstDirection)
      sort = { key, direction: firstDirection === "asc" ? "desc" : "asc" };
    else sort = null;
  }

  const monthYear = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" });
  const formatDate = (iso: string) => monthYear.format(new Date(`${iso}T12:00:00`));
  const initials = (name: string) =>
    name
      .split(" ")
      .slice(0, 2)
      .map((part) => part[0])
      .join("");

  function onAction(action: string) {
    const member = rowMenu.getPayload();
    if (!member) return;
    if (action === "role") toast(`Role changed for ${member.name}`);
    else if (action === "copy") toast(`Copied ${member.email}`);
    else toast(`${member.name} suspended`);
  }
</script>

<div class="settings">
  <aside class="sidebar">
    <Button>
      <ChevronLeftIcon aria-hidden="true" /> Back to app
    </Button>
    <Input type="search" aria-label="Search settings" placeholder="Search…" bind:value={navQuery} />
    <nav aria-label="Settings">
      {#each navGroups as group (group.group)}
        <span class="nav__group">{group.group}</span>
        {#each group.items as item (item.id)}
          <Button
            aria-current={active === item.id ? "page" : undefined}
            onclick={() => (active = item.id)}
          
    data-variant={active === item.id ? "solid" : undefined}>
            {item.label}
          </Button>
        {/each}
      {:else}
        <p class="muted">No settings match.</p>
      {/each}
    </nav>
  </aside>

  <main class="panel">
    {#if active === "members"}
      <h1>Members</h1>

      <div class="toolbar">
        <div class="toolbar__group">
          <Input
            type="search"
            aria-label="Search members"
            placeholder="Search by name or email"
            bind:value={query}
          />
          <Select bind:value={roleFilter} items={roleOptions}>
            <SelectLabel>Role</SelectLabel>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {#each roleOptions as option (option.value)}
                <SelectItem value={option.value}>
                  {option.label}
                  <SelectItemIndicator>
                    <CheckIcon aria-hidden="true" />
                  </SelectItemIndicator>
                </SelectItem>
              {/each}
            </SelectContent>
          </Select>
        </div>
        <div class="toolbar__group">
          <Button onclick={() => toast("Exported members.csv")}>Export CSV</Button>
          <Button data-variant="solid" onclick={() => toast("Invite sent")}>Invite</Button>
        </div>
      </div>

      <div class="table-wrap">
        <table>
          <caption class="sr-only">Workspace members</caption>
          <thead>
            <tr>
              {#each columns as column (column.key)}
                <th
                  aria-sort={sort?.key === column.key
                    ? sort.direction === "asc"
                      ? "ascending"
                      : "descending"
                    : undefined}
                >
                  <Button
                    onclick={() => toggleSort(column.key, column.firstDirection)}
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
              <th class="actions"><span class="sr-only">Actions</span></th>
            </tr>
          </thead>
          {#each groups as group (group.state)}
            <tbody>
              <tr class="group">
                <th scope="rowgroup" colspan="7">
                  {group.state}<span class="group__count">{group.rows.length}</span>
                </th>
              </tr>
              {#each group.rows as member (member.username)}
                <tr>
                  <td>
                    <span class="who">
                      <Avatar>
                        <AvatarFallback
                          ><span aria-hidden="true">{initials(member.name)}</span></AvatarFallback
                        >
                      </Avatar>
                      <span class="who__text">
                        <span class="who__name">{member.name}</span>
                        <span class="muted">{member.username}</span>
                      </span>
                    </span>
                  </td>
                  <td class="muted">{member.email}</td>
                  <td>
                    {#if member.role === "Admin"}
                      <span class="badge">Admin</span>
                    {:else}
                      <span class="muted">{member.role}</span>
                    {/if}
                  </td>
                  <td class="muted">
                    {member.teams === 0
                      ? "—"
                      : `${member.teams} team${member.teams === 1 ? "" : "s"}`}
                  </td>
                  <td class="muted">{formatDate(member.joined)}</td>
                  <td class="muted">
                    {#if member.lastSeen === "online"}
                      <span class="online"><span class="online__dot"></span>Online</span>
                    {:else if member.lastSeen}
                      {formatDate(member.lastSeen)}
                    {:else}
                      —
                    {/if}
                  </td>
                  <td class="actions">
                    <MenuTrigger
                      controller={rowMenu}
                      payload={member}
                      aria-label="Actions for {member.name}"
                    >
                      <EllipsisIcon aria-hidden="true" />
                    </MenuTrigger>
                  </td>
                </tr>
              {/each}
            </tbody>
          {:else}
            <tbody>
              <tr><td colspan="7" class="empty">No members match “{query}”.</td></tr>
            </tbody>
          {/each}
        </table>
      </div>
    {:else}
      <p class="muted">This example only implements Members.</p>
    {/if}
  </main>

  <Menu controller={rowMenu} {onAction}>
    <MenuContent align="end">
      <MenuItem value="role">Change role…</MenuItem>
      <MenuItem value="copy">Copy email</MenuItem>
      <MenuSeparator />
      <MenuItem value="suspend" destructive>Suspend member</MenuItem>
    </MenuContent>
  </Menu>

  <ToastRegion toaster={toast}>
    <Toast>
      <ToastTitle />
    </Toast>
  </ToastRegion>
</div>

<style>
  .settings {
    display: flex;
    height: 100%;
    background: var(--ui-background);
    color: var(--ui-foreground);
  }

  .sidebar {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    gap: calc(var(--ui-spacing) * 3);
    width: 232px;
    padding: calc(var(--ui-spacing) * 3);
    overflow-y: auto;
    border-inline-end: 1px solid var(--ui-border);
    background: var(--ui-muted);
  }

  nav {
    display: grid;
    gap: 1px;
  }

  .nav__group {
    margin-top: calc(var(--ui-spacing) * 2);
    padding: 0 calc(var(--ui-spacing) * 2) 4px;
    color: var(--ui-muted-foreground);
    font-size: 0.75rem;
    font-weight: 500;
  }

  .panel {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: calc(var(--ui-spacing) * 4);
    min-width: 0;
    padding: calc(var(--ui-spacing) * 8);
    overflow-y: auto;
  }

  h1 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 500;
  }

  .toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: calc(var(--ui-spacing) * 2);
  }

  .toolbar__group {
    display: flex;
    align-items: center;
    gap: calc(var(--ui-spacing) * 2);
  }

  .table-wrap {
    flex-shrink: 0;
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
  }

  th,
  td {
    height: calc(var(--ui-spacing) * 12);
    padding: 0 calc(var(--ui-spacing) * 2.5);
    border-bottom: 1px solid var(--ui-border);
    text-align: start;
    white-space: nowrap;
  }

  thead th {
    height: calc(var(--ui-spacing) * 9);
    color: var(--ui-muted-foreground);
    font-weight: 500;
  }

  .group th {
    height: calc(var(--ui-spacing) * 8);
    border-bottom: 0;
    background: var(--ui-muted);
    font-size: 0.75rem;
    font-weight: 500;
  }

  .group__count {
    margin-inline-start: 6px;
    color: var(--ui-muted-foreground);
  }

  .who {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .who__text {
    display: grid;
    line-height: 1.25;
  }

  .who__name {
    font-weight: 500;
  }

  .muted {
    color: var(--ui-muted-foreground);
    font-size: 0.75rem;
  }

  .badge {
    display: inline-flex;
    padding: 0 calc(var(--ui-spacing) * 1.5);
    border: 1px solid var(--ui-primary);
    border-radius: 9999px;
    background: var(--ui-primary);
    color: var(--ui-primary-foreground);
    font-size: 0.75rem;
    font-weight: 500;
    line-height: 1.25rem;
  }

  .online {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .online__dot {
    width: 6px;
    height: 6px;
    border-radius: 9999px;
    background: var(--ui-primary);
  }

  .actions {
    width: 44px;
    text-align: end;
  }

  .empty {
    color: var(--ui-muted-foreground);
    text-align: center;
  }

  @container (max-width: 700px) {
    .sidebar {
      display: none;
    }

    .panel {
      padding: calc(var(--ui-spacing) * 6);
    }
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
