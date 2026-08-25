import { createRecommendation, RainerApiError } from "../../../lib/rainer-api";

type CreateResultPayload = {
  name?: string; company?: string; email?: string; whatsapp?: string;
  technicalLevel?: string; goalId?: string; route?: string;
  users?: string; workload?: string; priority?: string;
  technicalAnswers?: Record<string, string>;
};

export async function POST(request: Request) {
  try {
    const payload = await request.json() as CreateResultPayload;
    const required = ["name", "company", "email", "whatsapp", "technicalLevel", "goalId", "route", "users", "workload", "priority"] as const;
    for (const field of required) if (!payload[field]?.trim()) return Response.json({ error: `${field} wajib diisi` }, { status: 400 });
    const generated = await createRecommendation(payload as Required<CreateResultPayload>);
    const token = new URL(generated.result_url).pathname.split("/").filter(Boolean).at(-1);
    if (!token) throw new Error("Backend tidak mengembalikan link hasil yang valid");
    const origin = new URL(request.url).origin;
    return Response.json({ result: { id: generated.result_id, url: `${origin}/result/${token}`, qrUrl: `${origin}/api/results/${token}/qr` } }, { status: 201 });
  } catch (error) {
    const status = error instanceof RainerApiError ? error.status : 500;
    return Response.json({ error: error instanceof Error ? error.message : "Gagal membuat rekomendasi" }, { status });
  }
}
