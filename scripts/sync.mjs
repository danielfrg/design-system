// Copies the design system's files into the apps listed in sync.toml.
//
//   node scripts/sync.mjs [app...]           copy, removing files the app no longer needs
//   node scripts/sync.mjs --check [app...]   change nothing; exit 1 if an app has drifted
//
// Each app gets, under its `dest` folder:
//   theme/{tokens,components}.css     from public/v2/<theme>
//   custom/<name>/...                 from public/v2/custom/<name>
// The whole `dest` folder belongs to the sync: anything else in it counts as drift.
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "smol-toml";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const check = args.includes("--check");
const only = args.filter((a) => !a.startsWith("--"));

const config = parse(readFileSync(join(root, "sync.toml"), "utf8"));
const apps = Object.entries(config.apps ?? {});
const unknown = only.filter((name) => !config.apps?.[name]);
if (unknown.length) {
  console.error(`Unknown app: ${unknown.join(", ")}. Known: ${apps.map(([n]) => n).join(", ")}`);
  process.exit(2);
}

function files(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((e) => e.isFile())
    .map((e) => relative(dir, join(e.parentPath, e.name)))
    .sort();
}

// The files an app should have, as { path relative to dest: contents }.
function expected(app) {
  const out = new Map();
  const add = (srcDir, destDir, names) => {
    if (!existsSync(srcDir)) throw new Error(`${srcDir} does not exist`);
    for (const name of names ?? files(srcDir)) {
      out.set(join(destDir, name), readFileSync(join(srcDir, name)));
    }
  };
  add(join(root, "public/v2", app.theme), "theme", ["tokens.css", "components.css"]);
  for (const name of app.custom ?? []) add(join(root, "public/v2/custom", name), join("custom", name));
  return out;
}

let drifted = false;
for (const [name, app] of apps) {
  if (only.length && !only.includes(name)) continue;
  const appRoot = resolve(root, app.path);
  if (!existsSync(appRoot)) {
    console.error(`${name}: ${appRoot} not found`);
    process.exit(2);
  }
  const dest = join(appRoot, app.dest);
  const want = expected(app);
  const have = new Set(files(dest));

  const changed = [...want].filter(([p, data]) => !have.has(p) || !readFileSync(join(dest, p)).equals(data));
  const extra = [...have].filter((p) => !want.has(p));

  if (check) {
    for (const [p] of changed) console.log(`${name}: out of date  ${p}`);
    for (const p of extra) console.log(`${name}: unexpected   ${p}`);
    if (changed.length || extra.length) drifted = true;
    else console.log(`${name}: in sync`);
    continue;
  }
  for (const p of extra) rmSync(join(dest, p));
  for (const [p, data] of changed) {
    mkdirSync(dirname(join(dest, p)), { recursive: true });
    writeFileSync(join(dest, p), data);
  }
  console.log(`${name}: ${changed.length} updated, ${extra.length} removed (${want.size} files)`);
}
process.exit(drifted ? 1 : 0);
