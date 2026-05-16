import { build } from "vite";
import { createViteConfig } from "../vite.config.mjs";

const modeArgIndex = process.argv.findIndex((arg) => arg === "--mode");
const mode = modeArgIndex >= 0 ? process.argv[modeArgIndex + 1] : "production";

await build({
  ...createViteConfig(mode),
  configFile: false,
  mode,
});
