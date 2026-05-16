import { createServer } from "vite";
import { createViteConfig } from "../vite.config.mjs";

const extraArgs = process.argv.slice(2);
const hostArgIndex = extraArgs.findIndex((arg) => arg === "--host");
const host = hostArgIndex >= 0 ? extraArgs[hostArgIndex + 1] : undefined;

const config = createViteConfig("development");

if (host) {
  config.server = {
    ...config.server,
    host,
  };
}

const server = await createServer({
  ...config,
  configFile: false,
  mode: "development",
});

await server.listen();
server.printUrls();
server.bindCLIShortcuts({ print: true });
