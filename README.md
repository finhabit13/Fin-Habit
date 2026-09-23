# FINHABIT — SPEND SMART. SAVE BETTER. BEAT FOMO.

Aplikasi mobile-style untuk melatih kebiasaan keuangan remaja. Frontend React (Vite) + **Supabase** (Postgres + Auth + RLS), dengan **mode demo otomatis** (localStorage) bila kredensial Supabase belum diisi — aplikasi tetap berjalan penuh saat demo/kompetisi.

## Fitur

- **Expense Tracker** — catat pengeluaran harian per kategori.
- **Limit Warning** — kartu pengingat saat budget bulanan sudah dipakai ≥80% (warn) atau >100% (over).
- **Saving Goals** — simulasi "what if" tabungan harian + target/realisasi.
- **30 Financial Challenges** — satu challenge harian + arsip semuanya.
- **Learn** — 15 mini-lesson 5 topik, +10 poin per lesson.
- **Decision Lab** — 3 kasus pilihan dengan konsekuensi & dampak poin.
- **Family Mission** — 3 misi keluarga untuk dikerjakan di rumah.
- **Finance Habit Score** — skor per dimensi (saving, spending, decision, goal, risk), breakdown, grafik 7 hari, badge, streak.

## Struktur

```
finhabit-app/
├─ frontend/
│  ├─ src/components   ring, modal, toast, success
│  ├─ src/context      state + run/auth/enterDemo + navigasi
│  ├─ src/lib          data (30 challenge dll), api (Supabase), store (demo), rewards, util
│  ├─ src/pages        Home, Learn, Challenge, Expenses, Budget,
│  │                   Saving, Decision, Family, Score, Profile, Auth
│  └─ supabase/        schema.sql (tabel, RLS, trigger)
```

Logika poin/dimensi/lencana hidup di satu sumber: `frontend/src/lib/rewards.js`. Ia dipakai oleh `api.js` (live) dan `store.js` (demo) agar hasilnya selalu identik — replikasi dari perilaku `rewards.py` pada backend lama.

## Setup Supabase

1. Buat project di [supabase.com](https://supabase.com) (region bebas, password database terserah).
2. Buka **SQL Editor** → paste & jalankan isi `frontend/supabase/schema.sql`. Ini membuat:
   - tabel `profiles` (1 baris per user Auth, kolom menyamai bentuk data aplikasi)
   - tabel `expenses` + index
   - trigger `handle_new_user` (auto-buat profil saat register)
   - RLS: tiap user hanya bisa membaca/mengubah baris miliknya.
3. (Opsional, direkomendasikan) **Authentication → Sign In / Providers → Email** — matikan *Confirm email* supaya register langsung masuk.
4. Salin **Project Settings → API**: *Project URL* dan *anon public key* ke `frontend/.env`:

```
VITE_SUPABASE_URL=https://<ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-public-key>
```

Tanpa dua nilai ini aplikasi otomatis memakai mode demo (`store.js`, localStorage key `finhabit_demo_v1`).

## Menjalankan lokal

```bash
cd frontend
npm install
npm run dev            # http://localhost:5173
npm run build          # build produksi ke dist/
```

## Deploy (Vercel)

- Repo import → root `finhabit-app/frontend`, preset Vite.
- Tambahkan env var `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`.
- `vercel.json` sudah berisi SPA rewrite.

> Catatan: Jangan commit `.env` — file tersebut sudah masuk `.gitignore`.