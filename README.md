# Rainer AI Capacity Assistant

Versi **1.3.0**

Rainer AI Capacity Assistant adalah configurator infrastruktur berbasis AI yang menerjemahkan kebutuhan customer menjadi rekomendasi kapasitas awal untuk keluarga produk Rainer ARCA, STOR, AIX, dan WORX. Rekomendasi mencakup sizing, headroom, proyeksi pertumbuhan, strategi scale-up/scale-out, serta pilihan Good/Better/Best.

## Struktur repository

- `frontend/` — configurator customer, halaman hasil, dan dashboard internal.
- `backend/` — API, routing discovery, integrasi AI, guardrail, audit, dan penyimpanan development.
- `backend/knowledge-base/` — baseline workload aktif versi 1.3.0.
- `docs/` — dokumentasi produk, arsitektur, API, dan panduan deployment.

## Prasyarat

- Node.js 22.13 atau lebih baru.
- Endpoint AI yang kompatibel dengan `POST /v1/chat/completions` dan structured JSON output.

## Menjalankan secara lokal

```bash
git clone https://github.com/<owner>/rainer_ai_capacity_assistant.git
cd rainer_ai_capacity_assistant/backend
npm install
cp .env.example .env
npm run dev
```

Pada terminal lain:

```bash
cd rainer_ai_capacity_assistant/frontend
npm install
npm run dev
```

Backend tersedia di `http://localhost:4000` dan frontend di `http://localhost:3000`. Konfigurasikan `AI_MODEL` pada `backend/.env`; `ai_host_url` dan `ai_api_key` dibaca dari system environment variable agar kredensial tidak masuk repository.

## Verifikasi

```bash
npm test
npm run check
```

## Status production readiness

Versi ini sesuai untuk demo dan pengembangan single-process. Sebelum production, ganti JSON store dengan database production, gunakan provider email nyata, lindungi dashboard dengan SSO/MFA, simpan secret melalui secret manager, dan gunakan TLS/reverse proxy.

Lihat [ringkasan proyek](docs/PROJECT.md), [arsitektur](docs/ARCHITECTURE.md), [kontrak API](docs/API.md), dan [knowledge base](docs/KNOWLEDGE_BASE.md).
