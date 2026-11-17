<script lang="ts">
  import { Preferences } from "@ui-sdk/svelte/preferences";
  import { colorScheme, ThemeToggle } from "@custom/theme-toggle";
</script>

<Preferences preferences={[colorScheme]}>
  <ThemeToggle />
</Preferences>
