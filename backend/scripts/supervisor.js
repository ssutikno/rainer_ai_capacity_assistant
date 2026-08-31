import { spawn } from "node:child_process";

const MAX_RESTARTS = 5;
const WINDOW_MS = 5 * 60 * 1000;
const STABLE_MS = 60 * 1000;
let child;
let stopping = false;
let restartTimes = [];

function start() {
  const startedAt = Date.now();
  child = spawn(process.execPath, ["src/server.js"], { cwd: process.cwd(), env: process.env, stdio: "inherit" });
  child.on("exit", (code, signal) => {
    if (stopping) return;
    const now = Date.now();
    restartTimes = restartTimes.filter((time) => now - time < WINDOW_MS);
    if (now - startedAt >= STABLE_MS) restartTimes = [];
    if (restartTimes.length >= MAX_RESTARTS) {
      console.error(`Backend tidak direstart lagi: batas ${MAX_RESTARTS} restart dalam 5 menit tercapai.`);
      process.exit(code || 1);
    }
    restartTimes.push(now);
    const delay = Math.min(1000 * 2 ** (restartTimes.length - 1), 15000);
    console.warn(`Backend berhenti (${signal || code}); restart otomatis dalam ${delay} ms.`);
    setTimeout(start, delay);
  });
}

function shutdown(signal) {
  stopping = true;
  if (child && !child.killed) child.kill(signal);
  else process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
start();
