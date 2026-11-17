<script lang="ts">
  import type { ColorSchemeValue } from "@ui-sdk/core";
  import { Input } from "@ui-sdk/svelte/input";
  import { Preferences, usePreference } from "@ui-sdk/svelte/preferences";
  import {
    SegmentedControl,
    SegmentedControlIndicator,
    SegmentedControlItem,
  } from "@ui-sdk/svelte/segmented-control";
  import { examples } from "../examples/index";
  import { colorScheme } from "./color-scheme";
  import ComponentPage from "./ComponentPage.svelte";
  import { componentPages } from "./pages";
  import SourceView from "./SourceView.svelte";

  interface NavItem {
    id: string;
    label: string;
  }

  const scheme = usePreference(colorScheme);

  const examplePages: NavItem[] = examples.map(({ id, label }) => ({ id, label }));
  const firstId = componentPages[0]!.id;

  let activeId = $state(location.hash.slice(1) || firstId);
  let filter = $state("");

  function matches(item: NavItem): boolean {
    const q = filter.trim().toLowerCase();
    return !q || item.label.toLowerCase().includes(q) || item.id.includes(q);
  }

  const visibleExamples = $derived(examplePages.filter(matches));
  const visibleComponents = $derived(componentPages.filter(matches));

  const activeExample = $derived(examples.find((e) => e.id === activeId));
  const activeComponent = $derived(componentPages.find((p) => p.id === activeId));
  const activeLabel = $derived(activeExample?.label ?? activeComponent?.label ?? "Not found");
</script>

<svelte:window
  onhashchange={() => {
    const id = location.hash.slice(1) || firstId;
    // Demos link to in-page anchors like #installation; only gallery ids switch pages.
    if (examples.some((e) => e.id === id) || componentPages.some((p) => p.id === id)) activeId = id;
  }}
/>

{#snippet navLink(item: NavItem)}
  <a
    class="sidebar__link"
    href="#{item.id}"
    aria-current={item.id === activeId ? "page" : undefined}
  >
    {item.label}
  </a>
{/snippet}

<Preferences preferences={[colorScheme]}>
  <div class="shell">
    <aside class="sidebar">
      <div class="sidebar__brand">
        <span class="sidebar__title">design-system</span>
        <span class="sidebar__subtitle">ui-sdk component gallery</span>
        <a class="sidebar__plain" href="./plain/">Plain HTML primitives →</a>
      </div>
      <div class="control control--block" data-example="gallery/filter">
        <Input
          class="sidebar__filter"
          type="search"
          aria-label="Filter components"
          placeholder="Filter components…"
          bind:value={filter}
        />
      </div>
      <nav class="sidebar__nav" aria-label="Gallery">
        {#if visibleExamples.length > 0}
          <span class="sidebar__section">Examples</span>
          {#each visibleExamples as item (item.id)}
            {@render navLink(item)}
          {/each}
        {/if}
        {#if visibleComponents.length > 0}
          <span class="sidebar__section">Components</span>
          {#each visibleComponents as item (item.id)}
            {@render navLink(item)}
          {/each}
        {/if}
        {#if visibleExamples.length === 0 && visibleComponents.length === 0}
          <span class="sidebar__empty">No matches</span>
        {/if}
      </nav>
    </aside>

    <main class="content">
      <header class="content__topbar">
        <h2 class="content__heading">{activeLabel}</h2>
        <div class="control" data-example="gallery/color-scheme">
          <SegmentedControl
            aria-label="Color scheme"
            value={scheme.current.value}
            onValueChange={(next) => colorScheme.set(next as ColorSchemeValue)}
          >
            <SegmentedControlIndicator />
            <SegmentedControlItem value="light">Light</SegmentedControlItem>
            <SegmentedControlItem value="dark">Dark</SegmentedControlItem>
            <SegmentedControlItem value="system">System</SegmentedControlItem>
          </SegmentedControl>
        </div>
      </header>
      <div class="content__body">
        {#key activeId}
          {#if activeExample}
            <SourceView
              description={activeExample.description}
              filename={activeExample.filename}
              component={activeExample.component}
              source={activeExample.source}
              framed
            />
          {:else if activeComponent}
            <ComponentPage id={activeComponent.id} description={activeComponent.description} />
          {:else}
            <p class="content__pending">No page called “{activeId}”.</p>
          {/if}
        {/key}
      </div>
    </main>
  </div>
</Preferences>
