<script lang="ts">
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
  import { invoices, money } from "./invoices";

  let sort = $state<TableSort | null>({ key: "totalAmount", direction: "desc" });
  const rows = $derived(sortRows(invoices, sort));
</script>

<div data-slot="stack" style="width: 100%">
  <Table bind:sort>
    <TableHeader>
      <TableRow>
        <TableHead sortKey="invoice">Invoice</TableHead>
        <TableHead sortKey="paymentStatus">Status</TableHead>
        <TableHead sortKey="paymentMethod">Method</TableHead>
        <TableHead sortKey="totalAmount" firstDirection="desc" align="end">Amount</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {#each rows as row (row.invoice)}
        <TableRow>
          <TableCell style="font-weight: 500">{row.invoice}</TableCell>
          <TableCell>{row.paymentStatus}</TableCell>
          <TableCell>{row.paymentMethod}</TableCell>
          <TableCell align="end">{money(row.totalAmount)}</TableCell>
        </TableRow>
      {/each}
    </TableBody>
  </Table>
  <p data-slot="hint" role="status">
    {sort ? `Sorted by ${sort.key}, ${sort.direction === "asc" ? "ascending" : "descending"}` : "Not sorted"}
  </p>
</div>
