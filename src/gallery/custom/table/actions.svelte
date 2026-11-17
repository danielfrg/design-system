<script lang="ts">
  import { EllipsisIcon } from "@lucide/svelte";
  import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "@ui-sdk/svelte/menu";
  import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@custom/table";
  import { invoices, money } from "./invoices";

  let message = $state("Choose an action from a row's menu.");
</script>

<div data-slot="stack" style="width: 100%">
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Invoice</TableHead>
        <TableHead>Status</TableHead>
        <TableHead align="end">Amount</TableHead>
        <TableHead align="end"><span data-slot="visually-hidden">Actions</span></TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {#each invoices.slice(0, 4) as row (row.invoice)}
        <TableRow>
          <TableCell>{row.invoice}</TableCell>
          <TableCell>{row.paymentStatus}</TableCell>
          <TableCell align="end">{money(row.totalAmount)}</TableCell>
          <TableCell align="end">
            <Menu onAction={(value) => (message = `${value} ${row.invoice}`)}>
              <MenuTrigger data-variant="ghost" aria-label="Actions for {row.invoice}">
                <EllipsisIcon />
              </MenuTrigger>
              <MenuContent>
                <MenuItem value="Edit">Edit</MenuItem>
                <MenuItem value="Duplicate">Duplicate</MenuItem>
                <MenuSeparator />
                <MenuItem value="Delete" data-variant="destructive">Delete</MenuItem>
              </MenuContent>
            </Menu>
          </TableCell>
        </TableRow>
      {/each}
    </TableBody>
  </Table>
  <p data-slot="hint" role="status">{message}</p>
</div>
