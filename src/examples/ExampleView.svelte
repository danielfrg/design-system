<script lang="ts">
  import { CodeBlock, SegmentedControl } from "@kenn-io/kit-ui";
  import type { Example } from "./index.js";

  let { example }: { example: Example } = $props();

  let tab = $state("preview");
  const Preview = $derived(example.component);
</script>

<section class="view">
  <div class="view__head">
    <p>{example.description}</p>
    <SegmentedControl
      value={tab}
      onchange={(v) => (tab = v)}
      options={[
        { value: "preview", label: "Preview" },
        { value: "code", label: "Code" },
      ]}
    />
  </div>

  <!-- Both stay mounted so switching tabs keeps the demo's state. -->
  <div class="frame" hidden={tab !== "preview"}>
    <Preview />
  </div>

  <div class="code" hidden={tab !== "code"}>
    <CodeBlock code={example.source} language="svelte" title={example.filename} lineNumbers />
  </div>
</section>

<style>
  .view {
    display: grid;
    gap: 12px;
    min-width: 0;
  }

  .view__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
  }

  .view__head p {
    margin: 0;
    max-width: 640px;
    color: var(--text-muted);
    font-size: var(--font-size-sm);
  }

  /* A fixed-height window onto the page, like a browser viewport. Examples fill it. */
  .frame {
    height: 720px;
    overflow: auto;
    border: 1px solid var(--border-default);
    border-radius: var(--radius-lg);
    container-type: inline-size;
  }

  .frame[hidden],
  .code[hidden] {
    display: none;
  }

  .code {
    display: grid;
    gap: 8px;
    min-width: 0;
  }
</style>
