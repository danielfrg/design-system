<script lang="ts">
  import { loadCustomDemo, type CustomPage } from "./custom";
  import DemoPreview from "./DemoPreview.svelte";

  interface Props {
    page: CustomPage;
  }

  let { page }: Props = $props();

  const name = $derived(page.id.replace(/^custom-/, ""));
</script>

{#snippet text(value: string)}
  {#each value.split("`") as part, index (index)}
    {#if index % 2 === 1}<code>{part}</code>{:else}{part}{/if}
  {/each}
{/snippet}

<p class="page__lead">{page.description}</p>
<p class="page__lead">
  Not part of ui-sdk: copy the <code>{page.folder}</code> folder into your app and import its
  stylesheet once. It reads only <code>tokens.css</code>.
</p>
{#each page.demos as demo (demo.file)}
  {@const loaded = loadCustomDemo(name, demo.file)}
  <section class="section">
    {#if demo.heading !== "Overview"}<h3 class="section__title">{demo.heading}</h3>{/if}
    {#if demo.intro}<p class="section__text">{@render text(demo.intro)}</p>{/if}
    <DemoPreview name="{name}/{demo.file}" file={demo.file} component={loaded.component} source={loaded.source} />
    {#if demo.caption}<p class="section__caption">{@render text(demo.caption)}</p>{/if}
  </section>
{/each}
