<script lang="ts">
  import { StatusBadge } from "@custom/status-badge";
</script>

<div data-slot="row">
  <StatusBadge tone="success">Healthy</StatusBadge>
  <StatusBadge tone="warning">OutOfSync</StatusBadge>
  <StatusBadge tone="danger">Degraded</StatusBadge>
  <StatusBadge tone="info">Progressing</StatusBadge>
  <StatusBadge>Unknown</StatusBadge>
  <StatusBadge tone="success" dot={false}>No dot</StatusBadge>
</div>
