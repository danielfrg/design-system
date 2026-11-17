<script lang="ts">
  import { createHighlighterCore } from "shiki/core";
  import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

  interface Props {
    code: string;
    title?: string;
  }

  let { code, title }: Props = $props();

  // Only Svelte and the two themes, not every grammar shiki ships.
  const highlighter = createHighlighterCore({
    themes: [import("shiki/themes/github-light.mjs"), import("shiki/themes/github-dark.mjs")],
    langs: [import("shiki/langs/svelte.mjs")],
    engine: createJavaScriptRegexEngine(),
  });

  const html = $derived(
    highlighter.then((h) =>
      h.codeToHtml(code, {
        lang: "svelte",
        themes: { light: "github-light", dark: "github-dark" },
        defaultColor: false,
      }),
    ),
  );
</script>

<figure class="code-block">
  {#if title}<figcaption>{title}</figcaption>{/if}
  {#await html}
    <pre><code>{code}</code></pre>
  {:then markup}
    {@html markup}
  {/await}
</figure>
