import { config } from "./config.js";
import { createApp } from "./app.js";
import { JsonStore } from "./store.js";

const store = new JsonStore(config.dataFile);
await store.init();
const server = createApp({ store, config });
server.listen(config.port, () => console.info(`Rainer API listening on ${config.publicBaseUrl}`));

const shutdown = () => server.close(() => process.exit(0));
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
