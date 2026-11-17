<script lang="ts">
  import DemoPreview from "./DemoPreview.svelte";
  import { demos, loadDemo } from "./demos";

  interface Props {
    id: string;
    description: string;
  }

  let { id, description }: Props = $props();

  const entry = $derived(demos[id] ?? { dir: id, demos: [] });
</script>

{#snippet text(value: string)}
  {#each value.split("`") as part, index (index)}
    {#if index % 2 === 1}<code>{part}</code>{:else}{part}{/if}
  {/each}
{/snippet}

<p class="page__lead">{description}</p>
{#each entry.demos as demo (demo.file)}
  {@const loaded = loadDemo(entry.dir, demo.file)}
  <section class="section">
    {#if demo.heading !== "Overview"}<h3 class="section__title">{demo.heading}</h3>{/if}
    {#if demo.intro && demo.intro !== description}<p class="section__text">
        {@render text(demo.intro)}
      </p>{/if}
    <DemoPreview
      name="{entry.dir}/{demo.file}"
      file={demo.file}
      component={loaded.component}
      source={loaded.source}
    />
    {#if demo.caption}<p class="section__caption">{@render text(demo.caption)}</p>{/if}
  </section>
{/each}
