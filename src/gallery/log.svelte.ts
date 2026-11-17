import { setContext } from "svelte";
import { LogKey } from "./vendor/ui-sdk-examples/examples/shared/svelte/log";

// The docs examples log through the vendored `useLog`, which reads LogKey from context.
class DemoLog {
  lines = $state<{ id: number; text: string }[]>([]);
  #next = 0;

  push(text: string) {
    this.lines = [...this.lines, { id: this.#next++, text }].slice(-6);
  }

  clear() {
    this.lines = [];
  }
}

export function createLog() {
  const log = new DemoLog();
  setContext(LogKey, (text: string) => log.push(text));
  return log;
}
