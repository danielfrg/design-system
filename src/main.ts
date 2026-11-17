import { mount } from "svelte";
// The design system, exactly as other projects use it: tokens, then components.
import "../public/v2/tokens.css";
import "../public/v2/components.css";
// Gallery only: the ui-sdk docs' demo scaffolding, and the gallery's own chrome.
import "./gallery/demo.css";
import "./gallery/gallery.css";
import App from "./gallery/App.svelte";

mount(App, { target: document.getElementById("app")! });
