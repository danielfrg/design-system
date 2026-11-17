<script lang="ts">
  import {
    sortRows,
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    type TableSort,
  } from "@custom/table";

  const rows = [
    { invoice: "INV001", status: "مدفوع", method: "بطاقة ائتمان", amount: 250 },
    { invoice: "INV002", status: "قيد الانتظار", method: "باي بال", amount: 150 },
    { invoice: "INV003", status: "غير مدفوع", method: "تحويل بنكي", amount: 350 },
  ];
  const money = new Intl.NumberFormat("ar", { style: "currency", currency: "USD" });

  let sort = $state<TableSort | null>(null);
  const sorted = $derived(sortRows(rows, sort));
</script>

<div dir="rtl" lang="ar" style="width: 100%">
  <Table bind:sort>
    <TableCaption>قائمة بفواتيرك الأخيرة.</TableCaption>
    <TableHeader>
      <TableRow>
        <TableHead sortKey="invoice">الفاتورة</TableHead>
        <TableHead sortKey="status">الحالة</TableHead>
        <TableHead>الطريقة</TableHead>
        <TableHead sortKey="amount" firstDirection="desc" align="end">المبلغ</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {#each sorted as row (row.invoice)}
        <TableRow>
          <TableCell>{row.invoice}</TableCell>
          <TableCell>{row.status}</TableCell>
          <TableCell>{row.method}</TableCell>
          <TableCell align="end">{money.format(row.amount)}</TableCell>
        </TableRow>
      {/each}
    </TableBody>
  </Table>
</div>
