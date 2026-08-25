# Arsitektur

Dokumen ini berlaku untuk Rainer AI Capacity Assistant versi 1.3.0.

## Frontend

Frontend menggunakan React, TypeScript, vinext, dan Vite. Permukaan utamanya adalah configurator customer, halaman hasil rekomendasi, dan dashboard internal. Frontend memanggil backend melalui `BACKEND_API_URL`.

## Backend

Backend menggunakan Node.js native HTTP API untuk validasi lead, sesi dan resume token, routing discovery, baseline workload, integrasi AI, guardrail, QR, email, review internal, serta audit event.

## AI dan privasi

Backend mengirim konteks discovery yang telah disanitasi ke endpoint chat-completions yang kompatibel. Identitas lead, token, alamat, email, nomor telepon, IP, hostname internal, dan identifier transaksi tidak disertakan. Respons AI wajib berbentuk JSON terstruktur dan memiliki headroom minimal 20%.

## Penyimpanan dan guardrail

Development memakai JSON store dengan penulisan atomik; gunakan PostgreSQL atau D1 sebelum deployment multi-instance. Routing dan completeness bersifat deterministik, nilai customer mengalahkan baseline, klaim komersial tanpa sumber diblokir, provenance disimpan, dan URL publik memakai opaque token yang dapat kedaluwarsa atau dicabut.
