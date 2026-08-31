# STOR Storage Workload Baseline v2.0.0

| Workload | Kapasitas awal | Tambahan per user | Proyeksi 3 tahun | Proteksi awal |
|---|---:|---:|---:|---|
| File sharing | 500 GB | 10 GB | 20% | Dual parity/RAID 6 + snapshot |
| Backup repository | 1.000 GB | 20 GB | 30% | Dual parity + immutable copy |
| Archive | 2.000 GB | 25 GB | 25% | Dual parity + salinan terpisah |
| General storage | 500 GB | 10 GB | 20% | Dual parity + snapshot |

Good memakai dual 10 GbE, Better/Best memakai dual 25 GbE. Retention, change rate, dedup ratio, RPO/RTO, protocol, drive count, dan controller wajib dikonfirmasi.
