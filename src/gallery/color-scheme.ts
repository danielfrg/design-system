import { createColorScheme, createLocalStorage } from "@ui-sdk/core";

const colorScheme = createColorScheme({
  storage: createLocalStorage("color-scheme"),
  global: true,
});

export { colorScheme };
