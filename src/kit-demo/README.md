# kit-demo

Vendored from [kenn-io/kit-ui](https://github.com/kenn-io/kit-ui) `src/demo` at commit
`dc7a4184843343cb1fa639ea6e77b68d13e755af` (Apache-2.0, see `LICENSE`), the same commit
`package.json` pins for the library.

Files are verbatim except `App.svelte`:

- removed the named-theme picker, high-contrast toggle and the "Themes" page (this repo has one theme);
- added a link to the plain-HTML gallery in the sidebar;
- added an "Examples" section under the search box that renders `src/examples` (see below).

`../lib/...` imports resolve to the installed kit-ui through an alias in `vite.config.ts`.

To update: bump the commit in `package.json`, copy `src/demo` again, redo the `App.svelte` edits.

## Examples (`src/examples/`, ours)

Realistic pages built with kit-ui, adapted from shadcn/ui's examples and blocks. Each is a single
`.svelte` file; `ExampleView.svelte` renders it on the Preview tab and shows the same file's text
(imported with `?raw`) on the Code tab, so the code on screen is the code that runs. Imports come
from `@kenn-io/kit-ui`, so a file can be copied into an app as is. To add one, drop a file in
`src/examples/` and list it in `src/examples/index.ts`.
