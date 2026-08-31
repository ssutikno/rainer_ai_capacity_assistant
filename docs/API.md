# API Rainer AI Capacity Assistant

Kontrak ini berlaku untuk versi 2.0.0. Base URL lokal: `http://localhost:4000`.

`PATCH /v1/sessions/:id/answers` menerima `goals: string[]` dan `product_quantities` untuk solusi multi-produk. Contoh: `{"goals":["compute","storage","ai"],"product_quantities":{"ARCA":3,"STOR":2,"AIX":1}}`. Quantity dibatasi 1–16 per keluarga. `goal` tunggal tetap didukung. Respons recommendation version 3 menambahkan `routes`, `products`, `interconnections`, `network_architecture`, dan `solution_validation_required`; projection field lama tetap tersedia untuk kompatibilitas.

Setiap interconnection berisi endpoint, purpose, traffic class, protocol, estimated bandwidth, recommended link, quantity, redundancy, dan validation requirements. Network architecture berisi topology, segments, switching requirements, resilience strategy, capacity rationale, dan expansion triggers.

Frontend membentuk diagram dan file `.excalidraw` dari kontrak tersebut. Karena diagram bersifat derivatif, API tidak menyimpan binary image terpisah dan tidak mengirim identitas lead ke canvas.

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
