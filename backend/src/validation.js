import { cleanText } from "./lib.js";

const FREE_DOMAINS = new Set(["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com"]);
export const normalizeEmail = (value) => cleanText(value, 254).toLowerCase();
export const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
export const normalizePhone = (value, countryCode = "+62") => {
  let digits = String(value ?? "").replace(/\D/g, "");
  const cc = String(countryCode).replace(/\D/g, "") || "62";
  if (digits.startsWith("0")) digits = `${cc}${digits.slice(1)}`;
  else if (!digits.startsWith(cc)) digits = `${cc}${digits}`;
  return `+${digits}`;
};
export function validateLead(input, freeEmailPolicy = "warn") {
  const name = cleanText(input.name, 120), company = cleanText(input.company, 160);
  const company_email = normalizeEmail(input.company_email);
  const whatsapp_e164 = normalizePhone(input.whatsapp, input.country_code);
  const errors = [];
  if (name.length < 2) errors.push({ field: "name", message: "Nama wajib diisi" });
  if (company.length < 2) errors.push({ field: "company", message: "Nama perusahaan wajib diisi" });
  if (!isEmail(company_email)) errors.push({ field: "company_email", message: "Email tidak valid" });
  if (!/^\+[1-9]\d{7,14}$/.test(whatsapp_e164)) errors.push({ field: "whatsapp", message: "Nomor WhatsApp tidak valid" });
  if (input.service_consent !== true) errors.push({ field: "service_consent", message: "Consent layanan wajib diberikan" });
  const free = FREE_DOMAINS.has(company_email.split("@")[1]);
  if (free && freeEmailPolicy === "block") errors.push({ field: "company_email", message: "Gunakan email perusahaan atau hubungi tim Rainer" });
  return { errors, warnings: free && freeEmailPolicy === "warn" ? [{ field: "company_email", message: "Domain email publik memerlukan review" }] : [], value: { name, company, company_email, whatsapp_e164 } };
}
