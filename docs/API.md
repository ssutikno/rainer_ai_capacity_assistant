# API Rainer AI Capacity Assistant

Kontrak ini berlaku untuk versi 1.3.0. Base URL lokal: `http://localhost:4000`.

## Customer

| Method | Endpoint | Fungsi |
|---|---|---|
| POST | `/v1/leads` | Membuat lead dan sesi |
| GET | `/v1/sessions/:id` | Membaca sesi |
| PATCH | `/v1/sessions/:id/profile` | Menentukan level teknis |
| PATCH | `/v1/sessions/:id/answers` | Autosave discovery |
| POST | `/v1/sessions/:id/confirm` | Mengonfirmasi jawaban minimum |
| POST | `/v1/sessions/:id/recommendations` | Menghasilkan rekomendasi |
| GET | `/v1/results/:token` | Membaca hasil publik |
| GET | `/v1/results/:token/qr.svg` | Mengambil QR hasil |
| POST | `/v1/results/:token/email` | Mengirim link hasil |

Endpoint sesi memakai `Authorization: Bearer <resume_token>`. Pembuatan rekomendasi menerima `Idempotency-Key`.

## Admin

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/v1/admin/leads` | Daftar transaksi |
| GET | `/v1/admin/results/:id` | Detail rekomendasi |
| PATCH | `/v1/admin/results/:id/review` | Memperbarui status review |
| POST | `/v1/admin/results/:id/revoke` | Mencabut akses hasil |
| GET | `/v1/admin/audit-events` | Membaca audit event |

Endpoint admin development memakai `X-Admin-API-Key`. Gunakan autentikasi pengguna dan otorisasi berbasis peran untuk production.
