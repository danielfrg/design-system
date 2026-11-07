# design-system

A design-system for my apps.

There is no components here, Svelte components come from [kit-ui](https://github.com/kenn-io/kit-ui) we just customize the theme.

Also a simpler no-build version for static pages with plain-HTML + CSS + tailwind.

## Usage: Svelte

Copy `theme.css` and `components.css` into the app, import in this order:

```ts
import "@kenn-io/kit-ui/theme.css"; // upstream defaults
import "./theme.css"; // ours, overrides the tokens
import "./components.css"; // ours, styles components
```

## Usage: no-build

```html
<link rel="stylesheet" href="https://danielfrg.github.io/design-system/v1/theme.css" />
<link rel="stylesheet" href="https://danielfrg.github.io/design-system/v1/primitives.css" />

<style type="text/tailwindcss">
  /* contents of v1/tailwind.css */
</style>

<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4.3.5"></script>
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.17.5/dist/cdn.min.js"></script>
```

Tailwind's browser build cannot `@import` files, which is why `tailwind.css` is inlined.

See [`src/plain/index.html`](src/plain/index.html) for the full, working head.

## Gallery

Showcase for all the kit-ui components plus example pages.

```bash
pnpm install
pnpm dev      # http://127.0.0.1:5180

pnpm build    # dist/, deployed to GitHub Pages by .github/workflows/pages.yml
```

## Files

| File             | For                      | What it is                                                                                                                                                                                                                    |
| ---------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `theme.css`      | everything               | Palette and design tokens. Light on `:root`, dark on `:root.dark`. The single place with palette values. Also sets `scrollbar-gutter: stable` so modals don't shift the layout.                                               |
| `components.css` | Svelte apps using kit-ui | Retunes upstream `.kit-*` components (pill buttons, 8px inputs, flat surfaces).                                                                                                                                               |
| `primitives.css` | static pages             | Plain `.btn`, `.input`, `.card`, `.badge`, `.alert`, `.table`, `.tabs`, `.menu`, plus styles for native controls (`.switch`, `.range`, `.progress`, `.meter`, `.fieldset`, `.details`, `.dialog`), matching `components.css`. |
| `tailwind.css`   | Tailwind v4              | Maps tokens to theme keys (`bg-surface`, `text-muted-foreground`, ...).                                                                                                                                                       |
