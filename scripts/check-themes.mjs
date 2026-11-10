// components.css and primitives.css read tokens only; theme.css supplies them.
// Fail the build when:
//  - the dark block sets a token the light block does not,
//  - the shared CSS uses a token (without a fallback) that nothing defines.
import { readFileSync } from "node:fs";

const decls = (body) => new Set([...body.matchAll(/^\s*(--[\w-]+)\s*:/gm)].map((m) => m[1]));

const css = readFileSync("public/v1/theme.css", "utf8");
// Blocks contain no nested braces, so a flat match is enough.
const block = (selector) =>
  [...css.matchAll(new RegExp(`${selector}\\s*\\{([^}]*)\\}`, "g"))].map((m) => m[1]).join("\n");
const light = decls(block(`:root\\[data-kit-theme="linear"\\]`));
const dark = decls(block(`:root\\.dark\\[data-kit-theme="linear"\\]`));

let failed = false;
const fail = (msg) => {
  console.error(msg);
  failed = true;
};

if (light.size === 0) {
  fail(`theme.css: no :root[data-kit-theme="linear"] block found.`);
} else {
  const darkOnly = [...dark].filter((t) => !light.has(t));
  if (darkOnly.length) {
    fail(`theme.css dark block sets tokens the light block does not: ${darkOnly.join(", ")}`);
  }
}

// Tokens the shared CSS may use without the theme defining them: kit-ui's own
// (theme.css) and ones the shared files declare themselves.
const kitTheme = readFileSync("node_modules/@kenn-io/kit-ui/src/lib/theme.css", "utf8");
const known = new Set([...light, ...decls(kitTheme)]);
for (const file of ["components.css", "primitives.css"]) {
  for (const t of decls(readFileSync(`public/v1/${file}`, "utf8"))) known.add(t);
}
// Set by kit-ui components (or by the JS around them), not by the theme.
const component = /^--(kit-|menu-icon-width|space-|bg-table-header|font-size-root)/;
for (const file of ["components.css", "primitives.css"]) {
  const unknown = new Set();
  // var(--x) with no fallback: the closing paren follows the name directly.
  for (const m of readFileSync(`public/v1/${file}`, "utf8").matchAll(/var\((--[\w-]+)\)/g)) {
    if (!known.has(m[1]) && !component.test(m[1])) unknown.add(m[1]);
  }
  if (unknown.size) fail(`${file} uses undefined tokens: ${[...unknown].join(", ")}`);
}

if (failed) process.exit(1);
console.log(`theme ok (${light.size} tokens)`);
