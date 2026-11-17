<script lang="ts">
  import type { Component } from "svelte";
  import {
    SegmentedControl,
    SegmentedControlIndicator,
    SegmentedControlItem,
  } from "@ui-sdk/svelte/segmented-control";
  import CodeBlock from "./CodeBlock.svelte";

  interface Props {
    description: string;
    filename: string;
    component: Component;
    source: string;
    /** Examples are whole pages: show them in a fixed-height viewport. */
    framed?: boolean;
  }

  let { description, filename, component: Preview, source, framed = false }: Props = $props();

  let tab = $state("preview");
</script>

<section class="view">
  <div class="view__head">
    <p>{description}</p>
    <div class="control" data-example="gallery/view">
      <SegmentedControl aria-label="View" bind:value={tab}>
        <SegmentedControlIndicator />
        <SegmentedControlItem value="preview">Preview</SegmentedControlItem>
        <SegmentedControlItem value="code">Code</SegmentedControlItem>
      </SegmentedControl>
    </div>
  </div>

  <!-- Both stay mounted so switching tabs keeps the demo's state. -->
  <div
    class={framed ? "view__frame" : "view__body"}
    data-example="examples/{filename}"
    hidden={tab !== "preview"}
  >
    <Preview />
  </div>
  <div hidden={tab !== "code"}>
    <CodeBlock code={source} title={filename} />
  </div>
</section>
