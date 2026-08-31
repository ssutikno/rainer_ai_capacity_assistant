# Arsitektur

Dokumen ini berlaku untuk Rainer AI Capacity Assistant versi 2.0.0.

## Frontend

Frontend menggunakan React, TypeScript, vinext, dan Vite. Permukaan utamanya adalah configurator customer, halaman hasil rekomendasi, dan dashboard internal. Frontend memanggil backend melalui `BACKEND_API_URL`.

## Backend

Backend menggunakan Node.js native HTTP API untuk validasi lead, sesi dan resume token, multi-route discovery, baseline per workload, solution composition, AI product sizing, AI network design, guardrail, QR, email, review internal, serta audit event.

## Multi-product solution dan interconnection

Setiap permintaan dinormalisasi menjadi solution version 3. `product_quantities` menyimpan jumlah unit per keluarga (1–16). `products[]` menyimpan peran, quantity, sizing, spesifikasi, confidence, dan validasi per produk. Quantity diteruskan ke AI product sizing dan network design. `interconnections[]` menyimpan source/destination, purpose, traffic class, protocol, bandwidth, jumlah link/port, redundancy, dan validasi. `network_architecture` menjelaskan topology, segmentasi, switching, resilience, capacity rationale, serta expansion trigger.

AI network designer menerima jawaban discovery yang telah disanitasi dan baseline seluruh produk. AI wajib memperhitungkan concurrency, storage I/O, dataset movement, backup/replication, availability, pertumbuhan, port count, oversubscription, dan headroom minimum 20%. Backend menolak struktur yang tidak lengkap. Jika adapter AI custom belum mendukung network design, backend memakai fallback konservatif dan mencatat `network_design_source` pada provenance.

## Diagram Excalidraw

Halaman hasil mengubah `products[]` dan `interconnections[]` menjadi Mermaid `flowchart LR` sebagai canonical diagram source. Preview customer dan scene Excalidraw version 2 berasal dari graph yang sama. Customer dapat mengunduh `.mmd` maupun `.excalidraw`; scene menyimpan Mermaid source dan nama tool `create_from_mermaid` agar dapat dikonversi atau disempurnakan melalui `mcp_excalidraw` tanpa menempatkan seluruh customer pada satu canvas MCP bersama. Data identitas customer tidak dimasukkan ke diagram.

## AI dan privasi

Backend mengirim konteks discovery yang telah disanitasi ke endpoint chat-completions yang kompatibel. Identitas lead, token, alamat, email, nomor telepon, IP, hostname internal, dan identifier transaksi tidak disertakan. Respons AI wajib berbentuk JSON terstruktur dan memiliki headroom minimal 20%.

## Penyimpanan dan guardrail

Development memakai JSON store dengan penulisan atomik; gunakan PostgreSQL atau D1 sebelum deployment multi-instance. Routing dan completeness bersifat deterministik, nilai customer mengalahkan baseline, klaim komersial tanpa sumber diblokir, provenance disimpan, dan URL publik memakai opaque token yang dapat kedaluwarsa atau dicabut.
