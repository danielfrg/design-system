<script lang="ts">
  import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
  } from "@custom/table";
  import { invoices, money } from "./invoices";

  const rows = invoices.slice(0, 3);
  const total = rows.reduce((sum, row) => sum + row.totalAmount, 0);
</script>

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Invoice</TableHead>
      <TableHead>Status</TableHead>
      <TableHead align="end">Amount</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {#each rows as row (row.invoice)}
      <TableRow>
        <TableCell>{row.invoice}</TableCell>
        <TableCell>{row.paymentStatus}</TableCell>
        <TableCell align="end">{money(row.totalAmount)}</TableCell>
      </TableRow>
    {/each}
  </TableBody>
  <TableFooter>
    <TableRow>
      <TableCell colspan={2}>Total</TableCell>
      <TableCell align="end">{money(total)}</TableCell>
    </TableRow>
  </TableFooter>
</Table>
