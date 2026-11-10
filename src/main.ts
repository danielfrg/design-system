import { mount } from "svelte";
import { initTheme, setThemeName } from "@kenn-io/kit-ui";
// Same order the apps use: upstream tokens first, then ours override them.
import "@kenn-io/kit-ui/theme.css";
import "../public/v1/theme.css";
import "@kenn-io/kit-ui/mermaid.css";
import "@kenn-io/kit-ui/markdown-images.css";
import "./kit-demo/demo.css";
import "../public/v1/components.css";
// Opens select lists over their trigger, and sets the gap under other triggers.
import "../public/v1/popover-position.js";
import App from "./kit-demo/App.svelte";

initTheme();
// kit-ui's initTheme() removes data-kit-theme when no name is stored, and the
// demo pages call it again, so store the name (the apps just hardcode it).
setThemeName("linear");
mount(App, { target: document.getElementById("app")! });
