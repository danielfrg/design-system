// Builds the design system's portable CSS from the vendored ui-sdk docs styles
// (src/gallery/vendor/ui-sdk-examples), which are scoped to the docs' demo boxes:
//
//   public/v2/<theme>/tokens.css      a theme's tokens on :root
//   public/v2/<theme>/components.css  every rule that styles a ui-sdk part, unscoped,
//                                     plus the theme's overrides, if any
//   src/gallery/demo.css              the rest: rules for single demos and element
//                                     resets, still scoped to [data-example]
//
// Themes: "ui-sdk" is the docs' own look, its tokens generated from the docs. Every
// other theme is a folder in themes/ with a hand-written tokens.css and an optional
// overrides.css. Any project that uses ui-sdk gets a theme from its two public files.
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import postcss from "postcss";

const vendor = "src/gallery/vendor/ui-sdk-examples/examples";
const docs = "node_modules/@ui-sdk/svelte/docs/components";

// ui-sdk components, by their docs page names. A part's data-slot is the name
// or starts with "<name>-".
const components = [
  ...readdirSync(docs)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.slice(0, -3)),
  "spinner",
  "kbd",
];

const slotValue = /data-slot([$^*]?)="([a-z0-9-]*)"/g;

function isComponentSlot(op, value) {
  if (op === "$") return value.startsWith("-"); // [data-slot$="-trigger"]
  return components.some((c) => value === c || value.startsWith(`${c}-`));
}

// Generic layout slots the docs markup uses around and inside components, like a
// calendar header in a "row".
const layoutSlots = new Set([
  "stack", "row", "controls", "hint", "grid", "card", "tile", "list", "bar", "scroll",
  "log", "badge", "visually-hidden", "swatch", "initials", "media", "files", "output",
]);

function classify(selector) {
  if (selector.includes(":scope") || selector.includes("[data-example")) return "demo";
  const values = [...selector.matchAll(slotValue)];
  for (const [, op, value] of values) {
    if (isComponentSlot(op, value)) return "component";
  }
  // Layout slots stay in components.css, in source order: some share specificity
  // with component rules (a card variant, say) and only the order decides.
  if (values.length && values.every(([, , value]) => layoutSlots.has(value))) return "component";
  if (/(?<!:not\()\[data-slot\](?!=)|\[data-mirror\]|^:focus-visible/.test(selector)) return "component";
  return "demo";
}

// The docs site is square. Literal radii become tokens (set to 0 in tokens.css),
// so a project can bring curves back from tokens alone.
function tokenizeRadius(root) {
  root.walkDecls(/^border(-[a-z]+)*-radius$/, (decl) => {
    decl.value = decl.value.replace(/(?<![\w-])(\d*\.?\d+)(px|rem|%)/g, (match, n, unit) => {
      if (Number(n) === 0) return match;
      const full = unit === "%" ? Number(n) >= 50 : Number(n) >= 99;
      return full ? "var(--radius-full)" : "var(--radius-xs)";
    });
  });
}

// The docs design is monochrome: --ink is both the text color and the fill of a
// checked or solid part, and the outline of a control. Name those roles so a theme
// can tell them apart: --fill/--on-fill/--fill-hover for fills, --edge for a control's
// resting outline, --edge-hover on hover or press, --edge-active when it's focused,
// selected, checked or open. The ui-sdk theme sets them all back to --ink.
const activeState =
  /:focus|data-(highlighted|selected|checked|indeterminate|open|current|active|dragging|pressed|complete)|aria-(current|pressed)/;
const hoverState = /:hover|:active|data-hovering/;

function withoutNot(selector) {
  let out = selector;
  for (;;) {
    const i = out.indexOf(":not(");
    if (i < 0) return out;
    let depth = 0;
    let j = i + 4;
    for (; j < out.length; j++) {
      if (out[j] === "(") depth++;
      else if (out[j] === ")" && --depth === 0) break;
    }
    out = out.slice(0, i) + out.slice(j + 1);
  }
}

function chain(node) {
  const parts = [];
  for (let p = node.parent; p && p.type !== "root"; p = p.parent) if (p.selector) parts.unshift(p.selector);
  return withoutNot(parts.join(" "));
}

function semanticTokens(root) {
  root.walkDecls((decl) => {
    const value = decl.value.trim();
    if (/^background(-color)?$/.test(decl.prop) && value === "var(--ink)") {
      decl.value = "var(--fill)";
      decl.parent.each((sibling) => {
        if (sibling.type === "decl" && sibling.prop === "color" && sibling.value.trim() === "var(--paper)") {
          sibling.value = "var(--on-fill)";
        }
      });
    } else if (/^background/.test(decl.prop) && value === "color-mix(in oklab, var(--ink) 86%, var(--paper))") {
      decl.value = "var(--fill-hover)";
    } else if (decl.prop === "box-shadow" && /inset 0 0 0 1(\.5)?px var\(--ink\)/.test(value)) {
      const states = chain(decl);
      const edge = activeState.test(states) ? "--edge-active" : hoverState.test(states) ? "--edge-hover" : "--edge";
      decl.value = decl.value.replace(/(inset 0 0 0 1(?:\.5)?px) var\(--ink\)/g, `$1 var(${edge})`);
    }
  });
}

const banner = (text) => `/*\n${text.map((l) => ` * ${l}`.trimEnd()).join("\n")}\n */\n\n`;

function split(files) {
  const out = { component: postcss.root() };
  const demo = postcss.root();
  const demoScope = postcss.atRule({ name: "scope", params: "([data-example])" });
  out.demo = demoScope;

  for (const file of files) {
    const root = postcss.parse(readFileSync(file, "utf8"), { from: file });
    root.each((node) => {
      if (node.type === "atrule" && node.name === "scope") {
        node.each((child) => place(child, out));
      } else if (node.type === "atrule" && node.name === "keyframes") {
        out.component.append(node.clone());
      } else if (node.type !== "comment") {
        place(node, out);
      }
    });
  }
  demo.append(demoScope);
  return { component: out.component, demo };
}

// The docs reset plain lists and tables in every demo box. Parts that render as those
// elements, like a pagination list, rely on it, so components.css gets the same reset
// for elements that carry a data-slot, at the same specificity.
const partElements = /^(ul|ol|dl|table)$/;

// A rule goes to one output; an @media or @supports block is split between them.
function place(node, out) {
  if (node.type === "comment") return;
  if (node.type === "rule") {
    const kind = classify(node.selector);
    out[kind].append(node.clone());
    const elements = node.selectors.map((sel) => sel.trim());
    if (kind === "demo" && elements.every((sel) => partElements.test(sel))) {
      out.component.append(node.clone({ selectors: elements.map((el) => `${el}:where([data-slot])`) }));
    }
    return;
  }
  if (node.type === "atrule" && node.nodes) {
    const parts = {};
    for (const key of Object.keys(out)) parts[key] = node.clone({ nodes: [] });
    node.each((child) => place(child, parts));
    for (const key of Object.keys(out)) if (parts[key].nodes.length) out[key].append(parts[key]);
  }
}

// tokens.css: the docs tokens on :root, plus this design system's choices.
function buildTokens() {
  const root = postcss.parse(readFileSync(`${vendor}/styles/tokens.css`, "utf8"));
  const scope = root.nodes.find((n) => n.type === "atrule" && n.name === "scope");
  root.removeAll();
  scope.each((node) => {
    if (node.type !== "comment") root.append(node.clone());
  });
  root.walkRules((rule) => {
    rule.selector = rule.selector.replace(/:scope/g, ":root");
  });
  const main = root.nodes.find((n) => n.type === "rule");
  main.walk((n) => {
    if (n.type === "comment") n.remove();
  });
  main.walkDecls(/^--radius-/, (decl) => {
    decl.value = "0";
  });
  main.walkDecls("--mono", (decl) => {
    decl.value = '"Geist Mono", ui-monospace, "SF Mono", Menlo, monospace';
  });
  const after = (prop, decls) => {
    let anchor = main.nodes.find((n) => n.prop === prop);
    for (const [p, v] of decls) {
      const d = postcss.decl({ prop: p, value: v });
      anchor.after(d);
      anchor = d;
    }
  };
  after("--radius-popup", [
    ["--radius-xs", "0"],
    ["--radius-full", "0"],
  ]);
  after("--mono", [["--sans", 'Geist, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif']]);
  after("--backdrop", [
    ["--fill", "var(--ink)"],
    ["--fill-hover", "color-mix(in oklab, var(--ink) 86%, var(--paper))"],
    ["--on-fill", "var(--paper)"],
    ["--edge", "var(--ink)"],
    ["--edge-hover", "var(--ink)"],
    ["--edge-active", "var(--ink)"],
  ]);
  return root;
}

const componentFiles = [
  `${vendor}/styles/base.css`,
  ...readdirSync(`${vendor}/components`)
    .sort()
    .map((c) => `${vendor}/components/${c}/${c}.css`),
];

const { component, demo } = split(componentFiles);
// The docs set the text components inherit on each demo box; a project gets it on
// <body>, with no specificity so the app's own rules win.
component.prepend(
  // The docs site runs Tailwind's preflight under every demo: parts start from no
  // margin, padding or border, and native controls inherit the text around them.
  // Same reset here, for ui-sdk parts only and with no specificity.
  postcss.parse(`:where([data-slot], [data-slot]::before, [data-slot]::after) {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  border: 0 solid;
}
:where(button, input, select, textarea):where([data-slot]) {
  font: inherit;
  font-feature-settings: inherit;
  letter-spacing: inherit;
  color: inherit;
  background-color: transparent;
}
:where(body) {
  color: var(--ink);
  background: var(--paper);
  font-family: var(--sans);
  font-size: var(--text-md);
  font-weight: 400;
  line-height: var(--leading);
}`),
);
for (const root of [component, demo]) {
  tokenizeRadius(root);
  semanticTokens(root);
}

// Icon sizing reaches every svg inside a part. Apps wrap the whole page in
// <Preferences> (a part), so skip it, and drop specificity so an app's own svg
// rules (a chart, an illustration) win.
component.walkRules((rule) => {
  if (rule.selector === "[data-slot] svg") {
    rule.selector = ':where([data-slot]:not([data-slot="preferences"])) svg';
  }
});
const tokens = buildTokens();
for (const root of [component, demo, tokens]) root.cleanRaws();

const componentsBanner = (theme) =>
  banner([
    `Styles for every @ui-sdk part, by data-slot and state, and the layout slots the`,
    'ui-sdk docs markup uses (data-slot="stack", "row", "hint", "card"...). Reads only tokens.css.',
    `Theme: ${theme}. Load after its tokens.css. Put \`@layer ui-sdk;\` first in your global`,
    "stylesheet so these rules win over ui-sdk's own behavior CSS.",
    "Generated by scripts/build-design-css.mjs from the ui-sdk docs' demo styles.",
  ]);

// Old single-theme files, from before themes had folders.
rmSync("public/v2/tokens.css", { force: true });
rmSync("public/v2/components.css", { force: true });

const written = [];
const write = (path, text) => {
  writeFileSync(path, text);
  written.push(path);
};

mkdirSync("public/v2/ui-sdk", { recursive: true });
write(
  "public/v2/ui-sdk/tokens.css",
  banner([
    "Theme: ui-sdk, the ui-sdk docs' own look. Design tokens for ui-sdk components;",
    "load before components.css. Light and dark come from light-dark(): set color-scheme",
    "(or data-color-scheme) on <html>. Corners are square: every --radius-* is 0.",
    "Generated by scripts/build-design-css.mjs from the ui-sdk docs' demo tokens.",
  ]) + tokens.toString().trim() + "\n",
);
write("public/v2/ui-sdk/components.css", componentsBanner("ui-sdk") + component.toString().trim() + "\n");

for (const theme of existsSync("themes") ? readdirSync("themes").sort() : []) {
  const dir = `themes/${theme}`;
  mkdirSync(`public/v2/${theme}`, { recursive: true });
  write(`public/v2/${theme}/tokens.css`, readFileSync(`${dir}/tokens.css`, "utf8"));
  const overrides = existsSync(`${dir}/overrides.css`)
    ? `\n/* ${theme} overrides (themes/${theme}/overrides.css) */\n` + readFileSync(`${dir}/overrides.css`, "utf8")
    : "";
  write(`public/v2/${theme}/components.css`, componentsBanner(theme) + component.toString().trim() + "\n" + overrides);
}

write(
  "src/gallery/demo.css",
  banner([
    "The ui-sdk docs' demo scaffolding: rules for single demos, the demo box, and plain",
    "element resets. Gallery only. Generated by scripts/build-design-css.mjs.",
  ]) + demo.toString().trim() + "\n",
);

execFileSync("node_modules/.bin/oxfmt", written);

const count = (root) => {
  let n = 0;
  root.walkRules(() => n++);
  return n;
};
console.log(
  `build-design-css: components.css ${count(component)} rules, demo.css ${count(demo)}; themes: ${["ui-sdk", ...(existsSync("themes") ? readdirSync("themes") : [])].join(", ")}`,
);
