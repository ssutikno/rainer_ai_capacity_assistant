import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
}

test("renders the Rainer customer configurator", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Rainer AI Assistant/i);
  assert.match(html, /Infrastruktur yang tepat/i);
  assert.match(html, /Mulai konfigurasi/i);
  assert.match(html, /VERSION 2\.0\.0/i);
  assert.match(html, /MULTI-PRODUCT SOLUTION/i);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/i);
});

test("connects result creation and display to the backend API", async () => {
  const [createRoute, qrRoute, resultPage, backendClient] = await Promise.all([
    readFile(new URL("app/api/results/route.ts", root), "utf8"),
    readFile(new URL("app/api/results/[id]/qr/route.ts", root), "utf8"),
    readFile(new URL("app/result/[id]/page.tsx", root), "utf8"),
    readFile(new URL("lib/rainer-api.ts", root), "utf8"),
  ]);
  assert.match(createRoute, /createRecommendation/);
  assert.match(qrRoute, /getBackendQrUrl/);
  assert.match(resultPage, /Buka melalui QR/);
  assert.match(resultPage, /getRecommendation/);
  assert.match(backendClient, /\/v1\/leads/);
  assert.match(backendClient, /\/recommendations/);
  assert.match(backendClient, /technicalAnswers/);
  assert.match(backendClient, /goalIds/);
  assert.match(resultPage, /ARSITEKTUR NETWORK AI/);
  assert.match(resultPage, /INTERCONNECTION/);
  const diagram = await readFile(new URL("app/result/[id]/SolutionDiagram.tsx", root), "utf8");
  assert.match(diagram, /type: "excalidraw"/);
  assert.match(diagram, /mcp_excalidraw/);
  assert.match(diagram, /create_from_mermaid/);
  assert.match(diagram, /flowchart LR/);
  assert.match(diagram, /estimated_bandwidth/);
});

test("provides distinct business, intermediate, and expert discovery questions", async () => {
  const page = await readFile(new URL("app/page.tsx", root), "utf8");
  assert.match(page, /intermediateQuestions/);
  assert.match(page, /expertQuestions/);
  assert.match(page, /MODE BISNIS/);
  assert.match(page, /MODE MENENGAH/);
  assert.match(page, /MODE EXPERT/);
  assert.match(page, /SOLUTION SCOPE/);
  assert.match(page, /atur jumlah unit setiap keluarga produk/);
  assert.match(page, /productQuantities/);
  assert.match(page, /Tambah \$\{route\}/);
  assert.match(page, /ScopeQuestions/);
  assert.match(page, /Kebutuhan operasional \{route\}/);
  assert.match(page, /Pertanyaan ini hanya digunakan untuk sizing produk/);
});
