import { spawn } from "node:child_process";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const services = [
  { name: "backend", args: ["--prefix", "backend", "run", "dev"] },
  { name: "frontend", args: ["--prefix", "frontend", "run", "dev"] },
];

let stopping = false;
const children = new Map();

function start(service) {
  const child = spawn(npmCommand, service.args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: "inherit",
    windowsHide: true,
  });
  children.set(service.name, child);
  child.on("error", (error) => {
    console.error(`[${service.name}] gagal dijalankan: ${error.message}`);
    shutdown(1);
  });
  child.on("exit", (code, signal) => {
    children.delete(service.name);
    if (stopping) return;
    console.error(`[${service.name}] berhenti (${signal || code}). Menghentikan service lainnya.`);
    shutdown(code || 1);
  });
}

function shutdown(exitCode = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children.values()) {
    if (!child.killed) child.kill("SIGTERM");
  }
  const forceTimer = setTimeout(() => process.exit(exitCode), 3000);
  forceTimer.unref();
  Promise.all([...children.values()].map((child) => new Promise((resolve) => child.once("exit", resolve))))
    .finally(() => process.exit(exitCode));
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

console.info("Menjalankan Rainer AI Assistant: frontend http://localhost:3000 dan backend http://localhost:4000");
for (const service of services) start(service);
