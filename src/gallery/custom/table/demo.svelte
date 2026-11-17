<script lang="ts">
  import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
  } from "@custom/table";
  import { invoices, money } from "./invoices";

  const total = invoices.reduce((sum, row) => sum + row.totalAmount, 0);
</script>

<Table>
  <TableCaption>A list of your recent invoices.</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead style="width: 100px">Invoice</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Method</TableHead>
      <TableHead align="end">Amount</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {#each invoices as row (row.invoice)}
      <TableRow>
        <TableCell style="font-weight: 500">{row.invoice}</TableCell>
        <TableCell>{row.paymentStatus}</TableCell>
        <TableCell>{row.paymentMethod}</TableCell>
        <TableCell align="end">{money(row.totalAmount)}</TableCell>
      </TableRow>
    {/each}
  </TableBody>
  <TableFooter>
    <TableRow>
      <TableCell colspan={3}>Total</TableCell>
      <TableCell align="end">{money(total)}</TableCell>
    </TableRow>
  </TableFooter>
</Table>
