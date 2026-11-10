/*
 * Fine positioning for kit-ui's floating lists, driven by the theme.
 *
 * kit-ui places SelectDropdown lists, Menu content and FilterDropdown panels
 * with an inline `left`/`top` and a fixed 2px (select, menu) or 4px (filter)
 * gap under the trigger, and re-writes that style whenever the trigger or the
 * list resizes. This watches those writes and nudges `top`. It only ever
 * moves a list vertically; kit-ui keeps the horizontal placement.
 *
 *   --popover-gap       px between the trigger and the list (below or above it)
 *   --select-overlay    1: a select list opens over its trigger instead, the
 *                       current choice where the closed trigger was. The list
 *                       starts at the trigger's left edge and is at least as
 *                       wide; the theme's option padding matches the trigger's,
 *                       so the two are the same width when the current choice
 *                       is the widest option.
 *
 * Optional: without this file lists open where kit-ui puts them. Import it
 * once for the side effect:
 *   import "./popover-position.js";
 */
const EDGE = 8;
const SELECTED = ".kit-select-dropdown__option.selected";

// The element that opened the list: by aria-controls, else a known wrapper.
const byControls = (list) =>
  list.id ? document.querySelector(`[aria-controls="${CSS.escape(list.id)}"]`) : null;

const KINDS = [
  {
    list: ".kit-select-dropdown__list",
    overlay: true,
    trigger: (list) =>
      byControls(list) ?? list.parentElement?.querySelector(".kit-select-dropdown__trigger"),
  },
  { list: ".kit-menu__content", trigger: byControls },
  {
    list: ".kit-filter-dropdown__panel",
    trigger: (list) => list.closest(".kit-filter-dropdown")?.querySelector("button"),
  },
];
const LISTS = KINDS.map((k) => k.list).join(",");

const themeValue = (name) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

function place(list) {
  // kit-ui writes `top` after the list mounts; until then it is unplaced.
  if (!list.style.top) return;
  const kind = KINDS.find((k) => list.matches(k.list));
  const trigger = kind?.trigger(list);
  if (!trigger) return;

  const t = trigger.getBoundingClientRect();
  const l = list.getBoundingClientRect();
  let top = null;

  if (kind.overlay && themeValue("--select-overlay") === "1") {
    const selected = list.querySelector(SELECTED);
    if (selected) {
      const s = selected.getBoundingClientRect();
      top = l.top + (t.top + t.height / 2 - (s.top + s.height / 2));
    }
  }
  if (top === null) {
    const gap = parseFloat(themeValue("--popover-gap"));
    if (Number.isNaN(gap)) return;
    // kit-ui flips a list above the trigger when it would overflow the bottom.
    const below = l.top >= t.top + t.height / 2;
    top = below ? t.bottom + gap : t.top - gap - l.height;
  }

  const maxTop = Math.max(EDGE, window.innerHeight - l.height - EDGE);
  top = Math.min(Math.max(top, EDGE), maxTop);
  // Our own write fires the observer again; skip when already in place.
  if (Math.abs(top - l.top) < 0.5) return;
  list.style.top = `${Math.round(top)}px`;
}

function visit(node) {
  if (!(node instanceof Element)) return;
  if (node.matches(LISTS)) place(node);
  else node.querySelectorAll(LISTS).forEach(place);
}

if (typeof document !== "undefined") {
  new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === "attributes") visit(record.target);
      else record.addedNodes.forEach(visit);
    }
  }).observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["style"],
  });
}
