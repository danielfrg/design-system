<script lang="ts">
  import { Input } from "@ui-sdk/svelte/input";
  import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@custom/table";
  import { invoices, money } from "./invoices";

  let query = $state("crypto");
  const rows = $derived(
    invoices.filter((row) =>
      `${row.invoice} ${row.paymentStatus} ${row.paymentMethod}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
    ),
  );
</script>

<div data-slot="stack" style="width: 100%">
  <Input
    type="search"
    aria-label="Filter invoices"
    placeholder="Filter invoices…"
    bind:value={query}
  />
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Invoice</TableHead>
        <TableHead>Method</TableHead>
        <TableHead align="end">Amount</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {#each rows as row (row.invoice)}
        <TableRow>
          <TableCell>{row.invoice}</TableCell>
          <TableCell>{row.paymentMethod}</TableCell>
          <TableCell align="end">{money(row.totalAmount)}</TableCell>
        </TableRow>
      {:else}
        <TableRow>
          <TableCell colspan={3} align="center" style="height: 96px; color: var(--muted)">
            No invoices match “{query}”.
          </TableCell>
        </TableRow>
      {/each}
    </TableBody>
  </Table>
</div>
