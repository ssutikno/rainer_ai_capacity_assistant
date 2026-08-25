import { eq } from "drizzle-orm";
import { ensureDatabase, getDb } from ".";
import { results } from "./schema";

export type StoredResult = typeof results.$inferSelect;

export const recommendationCatalog: Record<string, { family: string; product: string; description: string; focus: string }> = {
  ARCA: { family: "ARCA COMPUTE", product: "Rainer ARCA CX-220", description: "Konfigurasi compute untuk ERP, database, dan virtualisasi dengan ruang pertumbuhan terukur.", focus: "ERP, database, dan virtualisasi" },
  STOR: { family: "STOR STORAGE", product: "Rainer STOR SX-240", description: "Platform penyimpanan untuk file sharing, backup, dan pertumbuhan data dengan perlindungan berlapis.", focus: "penyimpanan, backup, dan retensi data" },
  AIX: { family: "AIX AI & GPU", product: "Rainer AIX GX-420", description: "Platform GPU fleksibel untuk inference, training, dan komputasi intensif.", focus: "AI, GPU, dan komputasi intensif" },
  WORX: { family: "WORX WORKSTATION", product: "Rainer WORX WX-90", description: "Workstation profesional untuk CAD, desain, rendering, dan pekerjaan visual single-user.", focus: "workstation dan aplikasi profesional" },
};

export async function findResult(id: string) {
  await ensureDatabase();
  const [row] = await getDb().select().from(results).where(eq(results.id, id)).limit(1);
  if (!row || new Date(row.expiresAt).getTime() < Date.now()) return null;
  return row;
}
