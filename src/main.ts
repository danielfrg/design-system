import { mount } from "svelte";
// The design system's tokens.css and components.css load as <link>s from
// public/v1/<theme>, exactly as other projects use them: see index.html and theme.ts.
// Custom components, each copied into apps with its own stylesheet.
import "../public/v1/custom/table/table.css";
import "../public/v1/custom/theme-toggle/theme-toggle.css";
// Gallery only: the ui-sdk docs' demo scaffolding, and the gallery's own chrome.
import "./gallery/demo.css";
import "./gallery/gallery.css";
import App from "./gallery/App.svelte";

mount(App, { target: document.getElementById("app")! });
