import { mount } from "svelte";
import { initTheme } from "@kenn-io/kit-ui";
// Same order the apps use: upstream tokens first, then ours override them.
import "@kenn-io/kit-ui/theme.css";
import "../public/v1/theme.css";
import "@kenn-io/kit-ui/mermaid.css";
import "@kenn-io/kit-ui/markdown-images.css";
import "./kit-demo/demo.css";
import "../public/v1/components.css";
import App from "./kit-demo/App.svelte";

initTheme({ storageKey: "design-system-theme" });
mount(App, { target: document.getElementById("app")! });
