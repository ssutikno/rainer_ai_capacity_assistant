import { createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";

export const now = () => new Date().toISOString();
export const id = (prefix) => `${prefix}_${randomUUID()}`;
export const token = () => randomBytes(24).toString("base64url");
export const hash = (value) => createHash("sha256").update(value).digest("hex");
export const addHours = (hours) => new Date(Date.now() + hours * 3600000).toISOString();
export const safeEqual = (a = "", b = "") => {
  const x = Buffer.from(String(a)); const y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
};
export const cleanText = (value, max = 500) => String(value ?? "").trim().slice(0, max);
export const send = (res, status, body, headers = {}) => {
  const payload = body === undefined ? "" : JSON.stringify(body);
  res.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers });
  res.end(payload);
};
export const readJson = async (req, limit = 1_000_000) => {
  let raw = "";
  for await (const chunk of req) { raw += chunk; if (raw.length > limit) throw Object.assign(new Error("Payload terlalu besar"), { status: 413 }); }
  try { return raw ? JSON.parse(raw) : {}; } catch { throw Object.assign(new Error("JSON tidak valid"), { status: 400 }); }
};
export const publicLead = ({ whatsapp_e164, ...lead }) => ({ ...lead, whatsapp_e164: whatsapp_e164?.replace(/.(?=.{4})/g, "*") });
