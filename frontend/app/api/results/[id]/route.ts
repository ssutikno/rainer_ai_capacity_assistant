import { findResult } from "../../../../db/results";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await findResult(id);
  if (!result) return Response.json({ error: "Hasil tidak ditemukan atau sudah kedaluwarsa" }, { status: 404 });
  return Response.json({ result });
}
