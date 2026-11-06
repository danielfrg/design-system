// The Tailwind browser build cannot @import files, so the plain gallery inlines
// the theme block from public/v1/tailwind.css. Fail the build if the copies drift.
import { readFileSync } from "node:fs";

const squash = (text) => text.replace(/\s+/g, "");

const source = readFileSync("public/v1/tailwind.css", "utf8");
const page = readFileSync("src/plain/index.html", "utf8");

const sourceBlock = source.slice(source.indexOf("@custom-variant"));
const inlined = page.match(
  /\/\* tailwind\.css:start \*\/([\s\S]*?)\/\* tailwind\.css:end \*\//,
)?.[1];

if (!inlined) {
  console.error("src/plain/index.html: missing the tailwind.css:start/end markers.");
  process.exit(1);
}
if (squash(inlined) !== squash(sourceBlock)) {
  console.error(
    "src/plain/index.html: the inlined tailwind block differs from public/v1/tailwind.css.",
  );
  console.error("Copy everything from @custom-variant onward between the markers.");
  process.exit(1);
}
console.log("tailwind.css is in sync with src/plain/index.html");
