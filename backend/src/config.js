import path from "node:path";

const number = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;

export const config = Object.freeze({
  appVersion: "1.3.0",
  port: number(process.env.PORT, 4000),
  publicBaseUrl: process.env.PUBLIC_BASE_URL || "http://localhost:4000",
  resultTtlHours: number(process.env.RESULT_TTL_HOURS, 168),
  resumeTtlHours: number(process.env.RESUME_TTL_HOURS, 72),
  adminApiKey: process.env.ADMIN_API_KEY || "development-only-key",
  dataFile: path.resolve(process.cwd(), process.env.DATA_FILE || "./data/rainer.json"),
  emailMode: process.env.EMAIL_MODE || "console",
  freeEmailPolicy: process.env.FREE_EMAIL_POLICY || "warn",
  rateLimitPerMinute: number(process.env.RATE_LIMIT_PER_MINUTE, 100),
  aiRequired: process.env.AI_REQUIRED !== "false",
  aiBaseUrl: process.env.ai_host_url || "",
  aiApiKey: process.env.ai_api_key || "",
  aiModel: process.env.AI_MODEL || "",
  aiTimeoutMs: number(process.env.AI_TIMEOUT_MS, 120000),
  versions: { kb: "1.3.0", rules: "1.3.0", prompt: "ai-sizing-v2" },
});
