# ui-sdk docs examples (vendored)

Copied unmodified from https://github.com/vercel-labs/ui at tag `@ui-sdk/svelte@0.1.0-beta.7`,
the version installed in this repo. Apache-2.0, see `LICENSE`.

- `examples/components/<name>/svelte/*.svelte`: every Svelte demo from the docs.
- `examples/components/<name>/<name>.css`, `examples/styles/{tokens,base}.css`: the docs'
  demo styles, scoped to `[data-example]`.
- `examples/shared/svelte/log.ts`: the `useLog` helper the demos import.

To update after bumping `@ui-sdk/*`, re-extract the same paths from the matching tag
(`git archive <tag> examples/... | tar -x`) and run `node scripts/demo-index.mjs`.
