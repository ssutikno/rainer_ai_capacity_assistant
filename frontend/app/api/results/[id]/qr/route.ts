import { getBackendQrUrl } from "../../../../../lib/rainer-api";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const response = await fetch(getBackendQrUrl(id), { cache: "no-store" });
  if (!response.ok) return new Response("Hasil tidak ditemukan", { status: response.status });
  return new Response(await response.text(), { headers: { "content-type": "image/svg+xml; charset=utf-8", "cache-control": "private, max-age=300", "content-disposition": `inline; filename="rainer-${id}.svg"` } });
}
