// components.css and primitives.css read tokens only; each themes/<name>.css
// supplies them. Fail the build when:
//  - two themes define different token sets (a token missing from one theme
//    silently falls back to whatever the other theme or kit-ui left behind),
//  - a dark block sets a token its light block does not,
//  - the shared CSS uses a token (without a fallback) that nothing defines.
import { readFileSync, readdirSync } from "node:fs";

const dir = "public/v1/themes";
const themeFiles = readdirSync(dir).filter((f) => f.endsWith(".css"));

const decls = (body) => new Set([...body.matchAll(/^\s*(--[\w-]+)\s*:/gm)].map((m) => m[1]));

const themes = {};
for (const file of themeFiles) {
  const css = readFileSync(`${dir}/${file}`, "utf8");
  const name = file.replace(/\.css$/, "");
  // Blocks contain no nested braces, so a flat match is enough.
  const block = (selector) =>
    [...css.matchAll(new RegExp(`${selector}\\s*\\{([^}]*)\\}`, "g"))].map((m) => m[1]).join("\n");
  const light = decls(block(`:root\\[data-kit-theme="${name}"\\]`));
  const dark = decls(block(`:root\\.dark\\[data-kit-theme="${name}"\\]`));
  if (light.size === 0) {
    console.error(`${file}: no :root[data-kit-theme="${name}"] block found.`);
    process.exit(1);
  }
  themes[name] = { light, dark };
}

let failed = false;
const fail = (msg) => {
  console.error(msg);
  failed = true;
};

const names = Object.keys(themes);
const union = new Set(names.flatMap((n) => [...themes[n].light]));
for (const n of names) {
  const missing = [...union].filter((t) => !themes[n].light.has(t));
  if (missing.length) fail(`${n}.css is missing: ${missing.join(", ")}`);
  const darkOnly = [...themes[n].dark].filter((t) => !themes[n].light.has(t));
  if (darkOnly.length)
    fail(`${n}.css dark block sets tokens the light block does not: ${darkOnly.join(", ")}`);
}

// Tokens the shared CSS may use without any theme defining them: kit-ui's own
// (theme.css) and ones the shared files declare themselves.
const kitTheme = readFileSync("node_modules/@kenn-io/kit-ui/src/lib/theme.css", "utf8");
const known = new Set([...union, ...decls(kitTheme)]);
for (const file of ["components.css", "primitives.css"]) {
  const css = readFileSync(`public/v1/${file}`, "utf8");
  for (const t of decls(css)) known.add(t);
}
// Set by kit-ui components (or by the JS around them), not by themes.
const component = /^--(kit-|menu-icon-width|space-|bg-table-header|font-size-root)/;
for (const file of ["components.css", "primitives.css"]) {
  const css = readFileSync(`public/v1/${file}`, "utf8");
  const unknown = new Set();
  // var(--x) with no fallback: the closing paren follows the name directly.
  for (const m of css.matchAll(/var\((--[\w-]+)\)/g)) {
    if (!known.has(m[1]) && !component.test(m[1])) unknown.add(m[1]);
  }
  if (unknown.size) fail(`${file} uses undefined tokens: ${[...unknown].join(", ")}`);
}

if (failed) process.exit(1);
console.log(`themes ok: ${names.join(", ")} (${union.size} tokens each)`);
