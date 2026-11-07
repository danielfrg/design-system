<script lang="ts">
  import {
    Button,
    Chip,
    Menu,
    MenuContent,
    MenuItem,
    MenuSeparator,
    MenuTrigger,
    SearchInput,
    SelectDropdown,
    SettingsLayout,
    Table,
    TableHeaderCell,
    TableSort,
    showFlash,
    type SettingsCategory,
  } from "@kenn-io/kit-ui";
  import ChevronLeftIcon from "@lucide/svelte/icons/chevron-left";
  import EllipsisIcon from "@lucide/svelte/icons/ellipsis";

  const categories: SettingsCategory[] = [
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
  const visibleCategories = $derived.by(() => {
    const q = navQuery.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => `${c.label} ${c.group}`.toLowerCase().includes(q));
  });

  type Role = "Admin" | "Member" | "Guest";
  type State = "Active" | "Invited" | "Suspended";
  interface Member {
    name: string;
    username: string;
    email: string;
    role: Role;
    state: State;
    teams: number;
    joined: string;
    /** ISO date, or "online". */
    lastSeen: string;
    color: string;
  }

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
      color: "#4cb782",
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
      color: "#5e8ad6",
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
      color: "#d6875e",
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
      color: "#b25ed6",
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
      color: "#d65e7c",
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
      color: "#5ec2d6",
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
      color: "#8a8f98",
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
      color: "#8a8f98",
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
      color: "#8a8f98",
    },
  ];

  const STATES: State[] = ["Active", "Invited", "Suspended"];

  let query = $state("");
  let roleFilter = $state("all");

  const sorter = new TableSort<Member>(
    {
      name: (m) => m.name,
      email: (m) => m.email,
      role: (m) => ["Admin", "Member", "Guest"].indexOf(m.role),
      teams: { value: (m) => m.teams, firstDirection: "desc" },
      joined: { value: (m) => m.joined, firstDirection: "desc" },
      lastSeen: {
        value: (m) => (m.lastSeen === "online" ? "9999" : m.lastSeen || null),
        firstDirection: "desc",
      },
    },
    { key: "name" },
  );

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
    const sorted = sorter.sort(filtered);
    return STATES.map((state) => ({ state, rows: sorted.filter((m) => m.state === state) })).filter(
      (g) => g.rows.length > 0,
    );
  });

  const monthYear = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" });
  function formatDate(iso: string): string {
    return monthYear.format(new Date(`${iso}T12:00:00`));
  }

  function initials(name: string): string {
    return name
      .split(" ")
      .slice(0, 2)
      .map((part) => part[0])
      .join("");
  }
</script>

<div class="host">
  <SettingsLayout categories={visibleCategories} bind:active title="">
    {#snippet sidebarHeader()}
      <button class="back kit-control-states" type="button">
        <ChevronLeftIcon size={14} aria-hidden="true" /> Back to app
      </button>
      <SearchInput bind:value={navQuery} size="sm" block placeholder="Search…" />
    {/snippet}

    {#snippet panel(id)}
      {#if id === "members"}
        <div class="page">
          <h1 class="title">Members</h1>

          <div class="toolbar">
            <div class="toolbar__filters">
              <SearchInput
                bind:value={query}
                placeholder="Search by name or email"
                class="search"
              />
              <SelectDropdown
                value={roleFilter}
                onchange={(v) => (roleFilter = v)}
                options={[
                  { value: "all", label: "All" },
                  { value: "admin", label: "Admins" },
                  { value: "member", label: "Members" },
                  { value: "guest", label: "Guests" },
                ]}
              />
            </div>
            <div class="toolbar__actions">
              <Button
                label="Export CSV"
                size="lg"
                onclick={() => showFlash("Exported members.csv")}
              />
              <Button
                label="Invite"
                size="lg"
                tone="info"
                surface="solid"
                onclick={() => showFlash("Invite sent")}
              />
            </div>
          </div>

          <Table ariaLabel="Workspace members" scroll="page" zebra={false}>
            {#snippet header()}
              <TableHeaderCell label="Name" sort={sorter} column="name" />
              <TableHeaderCell label="Email" sort={sorter} column="email" />
              <TableHeaderCell label="Role" sort={sorter} column="role" />
              <TableHeaderCell label="Teams" sort={sorter} column="teams" />
              <TableHeaderCell label="Joined" sort={sorter} column="joined" />
              <TableHeaderCell label="Last seen" sort={sorter} column="lastSeen" />
              <TableHeaderCell width={44}><span class="sr-only">Actions</span></TableHeaderCell>
            {/snippet}

            {#each groups as group (group.state)}
              <tr class="group">
                <td colspan="7">
                  {group.state}<span class="group__count">{group.rows.length}</span>
                </td>
              </tr>
              {#each group.rows as member (member.username)}
                <tr>
                  <td>
                    <span class="who">
                      <span class="avatar" style:background={member.color} aria-hidden="true">
                        {initials(member.name)}
                      </span>
                      <span class="who__text">
                        <span class="who__name">{member.name}</span>
                        <span class="muted">{member.username}</span>
                      </span>
                    </span>
                  </td>
                  <td class="muted">{member.email}</td>
                  <td>
                    {#if member.role === "Admin"}
                      <Chip tone="info" size="sm" uppercase={false}>Admin</Chip>
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
                  <td class="actions-col">
                    <Menu>
                      <MenuTrigger ariaLabel={`Actions for ${member.name}`}>
                        <EllipsisIcon size={14} aria-hidden="true" />
                      </MenuTrigger>
                      <MenuContent ariaLabel={`Actions for ${member.name}`}>
                        <MenuItem
                          textValue="Change role"
                          onselect={() => showFlash(`Role changed for ${member.name}`)}
                        >
                          Change role…
                        </MenuItem>
                        <MenuItem
                          textValue="Copy email"
                          onselect={() => showFlash(`Copied ${member.email}`)}
                        >
                          Copy email
                        </MenuItem>
                        <MenuSeparator />
                        <MenuItem
                          textValue="Suspend member"
                          onselect={() => showFlash(`${member.name} suspended`)}
                        >
                          Suspend member
                        </MenuItem>
                      </MenuContent>
                    </Menu>
                  </td>
                </tr>
              {/each}
            {:else}
              <tr>
                <td colspan="7" class="empty">No members match “{query}”.</td>
              </tr>
            {/each}
          </Table>
        </div>
      {:else}
        <p class="placeholder">This example only implements Members.</p>
      {/if}
    {/snippet}
  </SettingsLayout>
</div>

<style>
  .host {
    display: flex;
    height: 100%;
  }

  /* Members uses the full panel width, not the narrow settings column. */
  .host :global(.kit-settings__panel) {
    max-width: none;
    padding-inline: 48px;
  }

  .back {
    display: flex;
    align-items: center;
    gap: 6px;
    min-height: 28px;
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

  .back:hover {
    background: var(--bg-surface-hover);
    color: var(--text-primary);
  }

  .page {
    display: grid;
    gap: 16px;
  }

  .title {
    margin: 0;
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-medium);
  }

  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
  }

  .toolbar__filters,
  .toolbar__actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .toolbar :global(.search) {
    width: 300px;
  }

  /* Group header rows: a rounded band with the state and its count. */
  .host .group td {
    height: 32px;
    background: var(--bg-inset);
    color: var(--text-secondary);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-medium);
  }

  .group__count {
    margin-left: 6px;
    color: var(--text-muted);
  }

  .who {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .avatar {
    display: grid;
    place-items: center;
    width: 24px;
    height: 24px;
    flex-shrink: 0;
    border-radius: 9999px;
    color: #fff;
    font-size: 10px;
    font-weight: var(--font-weight-semibold);
  }

  .who__text {
    display: grid;
    line-height: 1.25;
  }

  .who__name {
    color: var(--text-primary);
    font-weight: var(--font-weight-medium);
  }

  /* .host raises the cell rule above the theme's table cell styles. */
  .muted,
  .host td.muted {
    color: var(--text-muted);
    font-size: var(--font-size-xs);
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
    background: var(--accent-green);
  }

  .actions-col {
    text-align: right;
  }

  /* The row menu trigger appears on hover, or while focused or open. */
  td.actions-col :global(.kit-menu__trigger:not([aria-expanded="true"]):not(:focus-visible)) {
    opacity: 0;
  }

  tr:hover td.actions-col :global(.kit-menu__trigger) {
    opacity: 1;
  }

  .empty {
    color: var(--text-muted);
    text-align: center;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  .placeholder {
    color: var(--text-muted);
    font-size: var(--font-size-sm);
  }
</style>
