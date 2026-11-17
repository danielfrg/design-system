<script lang="ts">
  import type { Component } from "svelte";
  import {
    SegmentedControl,
    SegmentedControlIndicator,
    SegmentedControlItem,
  } from "@ui-sdk/svelte/segmented-control";
  import CodeBlock from "./CodeBlock.svelte";
  import { createLog } from "./log.svelte";

  interface Props {
    name: string;
    file: string;
    component: Promise<Component>;
    source: Promise<string>;
  }

  let { name, file, component, source }: Props = $props();

  let tab = $state("preview");
  const log = createLog();
</script>

<div class="demo">
  <div class="demo__bar">
    <div class="control" data-example="gallery/view">
      <SegmentedControl aria-label="View" bind:value={tab}>
        <SegmentedControlIndicator />
        <SegmentedControlItem value="preview">Preview</SegmentedControlItem>
        <SegmentedControlItem value="code">Code</SegmentedControlItem>
      </SegmentedControl>
    </div>
    <span class="demo__file">{file}.svelte</span>
  </div>
  <!-- Both stay mounted so switching tabs keeps the demo's state. -->
  <div class="demo__preview" data-example={name} hidden={tab !== "preview"}>
    <div class="demo__content">
      {#await component then Demo}
        <Demo />
      {/await}
    </div>
  </div>
  {#if tab === "code"}
    {#await source then code}
      <CodeBlock {code} />
    {/await}
  {/if}
  {#if log.lines.length > 0 && tab === "preview"}
    <div class="demo__log">
      <div class="demo__log-head">
        <span>Console</span>
        <button type="button" onclick={() => log.clear()}>Clear</button>
      </div>
      <ol aria-label="Console" aria-live="polite">
        {#each log.lines as line (line.id)}
          <li>{line.text}</li>
        {/each}
      </ol>
    </div>
  {/if}
</div>
