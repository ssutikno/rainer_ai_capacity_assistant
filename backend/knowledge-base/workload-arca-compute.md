# ARCA Compute Workload Baseline v1.3.0

Baseline dipakai saat metrik aktual customer belum tersedia. Nilai terukur selalu mengalahkan baseline.

| Workload | CPU | Memory | Storage | Network |
|---|---:|---:|---:|---:|
| ERP & database | 0,3 core/user, minimum 8 core | 16 GB awal + 0,2 GB/user, minimum 32 GB | 100 GB awal + 0,2 GB/bulan | Dual 10 GbE |
| Virtualisasi | 0,2 core/user, minimum 8 core | 32 GB awal + 0,5 GB/user | 500 GB awal + 2 GB/bulan | Dual 10 GbE |
| Application/web | 0,15 core/user, minimum 8 core | 16 GB awal + 0,15 GB/user | 200 GB awal + 1 GB/bulan | Dual 10 GbE |
| General compute | 0,2 core/user, minimum 8 core | 16 GB awal + 0,2 GB/user | 200 GB awal + 0,5 GB/bulan | Dual 10 GbE |

Good memakai baseline, Better 1,5x baseline, dan Best 2x baseline. Better menjadi rekomendasi default; Best dibuat HA-ready. Generasi CPU, hypervisor, lisensi, QVL, dan SKU tetap divalidasi.
