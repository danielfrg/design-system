// Builds src/gallery/demos.json: for each component, the demos its ui-sdk docs page
// embeds, in page order, with the heading above and the text around each one.
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";

const docs = "node_modules/@ui-sdk/svelte/docs/components";
const examples = "src/gallery/vendor/ui-sdk-examples/examples/components";

const plain = (text) =>
  text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

// Docs pages whose demos live in another component's folder upstream.
const folders = { "time-input": "date-input" };

const index = {};
for (const page of readdirSync(docs)
  .filter((f) => f.endsWith(".md"))
  .sort()) {
  const name = page.slice(0, -3);
  const dir = folders[name] ?? name;
  if (!existsSync(`${examples}/${dir}`)) continue;
  const md = readFileSync(`${docs}/${page}`, "utf8");
  const lines = md.split("\n");
  const demos = [];
  let heading = "Overview";
  let paragraph = [];
  let lastParagraph = "";
  let pending = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const h = line.match(/^#{2,3} (.+)/);
    if (h) {
      if (pending) pending = null;
      heading = h[1].trim();
      lastParagraph = "";
      paragraph = [];
      continue;
    }
    if (line.startsWith("```")) {
      const title = line.match(/title="([a-z0-9-]+)\.svelte"/);
      const end = lines.indexOf("```", i + 1);
      if (title && existsSync(`${examples}/${dir}/svelte/${title[1]}.svelte`)) {
        pending = { file: title[1], heading, intro: plain(lastParagraph), caption: "" };
        demos.push(pending);
      } else {
        pending = null;
      }
      i = end === -1 ? lines.length : end;
      paragraph = [];
      continue;
    }
    if (line.trim() === "") {
      if (paragraph.length) {
        const text = paragraph.join(" ");
        if (pending && !pending.caption) {
          pending.caption = plain(text);
          pending = null;
        } else if (!/^[-|>]/.test(text)) {
          lastParagraph = text;
        }
        paragraph = [];
      }
      continue;
    }
    paragraph.push(line);
  }
  // The docs page opens with a hero demo; some pages don't title it in their Markdown.
  if (!demos.some((d) => d.heading === "Overview")) {
    const hero = ["basic", "demo"].find((f) => existsSync(`${examples}/${dir}/svelte/${f}.svelte`));
    if (hero && !demos.some((d) => d.file === hero)) {
      demos.unshift({ file: hero, heading: "Overview", intro: "", caption: "" });
    }
  }
  index[name] = { dir, demos };
}

writeFileSync("src/gallery/demos.json", JSON.stringify(index, null, 2) + "\n");
const count = Object.values(index).reduce((n, d) => n + d.demos.length, 0);
console.log(`demo-index: ${Object.keys(index).length} components, ${count} demos`);
