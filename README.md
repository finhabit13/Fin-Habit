# FINHABIT

> Spend smart. Save better. Beat FOMO.

Aplikasi mobile-style untuk melatih kebiasaan keuangan remaja. Belajar mengelola uang lewat pengeluaran yang dicatat, budget bulanan, target tabungan, tantangan harian, dan misi keluarga, semua dibalut poin dan skor kebiasaan.

Frontend React (Vite) berbicara langsung ke **Supabase** (Postgres + Auth + RLS) tanpa backend terpisah. Bila kredensial Supabase belum diisi, aplikasi otomatis memakai **mode demo** berbasis `localStorage`, sehingga tetap bisa dicoba penuh.

## Fitur

- **Expense Tracker** - catat pengeluaran per kategori (Makanan, Minuman, Transportasi, Game, Belanja, Lainnya). Setiap catatan memberi +5 poin.
- **Budget** - target pengeluaran bulanan dengan level status: Aman (< 80%), Perhatian (80-100%), Berlebihan (> 100%).
- **Saving Goals** - target tabungan harian plus simulasi berapa hari untuk mencapai target, dan berapa jika nominalnya dinaikkan.
- **30 Financial Challenges** - satu challenge per hari (ditentukan dari tanggal), arsip semua challenge tersedia.
- **Learn** - 15 lesson singkat dalam 5 topik (Saving, Smart Spending, Budgeting, Goal Setting, Risk Awareness), +10 poin per lesson.
- **Decision Lab** - 3 kasus pilihan; setiap pilihan memberi poin dan memengaruhi dimensi skormu.
- **Family Mission** - 3 misi keluarga untuk dikerjakan di rumah, poin per misi saat selesai.
- **Finance Habit Score** - skor 0-100 dari 5 dimensi (saving, spending, decision, goal, risk): breakdown, grafik 7 hari, badge, dan streak harian.

## Cara pakai

### 1. Siapkan project Supabase

Buat project baru di [supabase.com](https://supabase.com). Buka **SQL Editor**, tempel dan jalankan isi `frontend/supabase/schema.sql`. File ini membuat:

- tabel `profiles` (menyimpan data kebiasaan tiap user)
- tabel `expenses`
- trigger `handle_new_user` yang membuat baris profil otomatis saat user baru mendaftar
- kebijakan **RLS** sehingga tiap user hanya bisa membaca dan mengubah datanya sendiri

Lalu di **Authentication → Sign In / Providers → Email**, matikan *Confirm email* supaya pendaftaran langsung masuk tanpa verifikasi (opsional tapi disarankan).

### 2. Isi kredensial

Salin **Project Settings → API** ke `frontend/.env` (buat file dari `.env.example`):

```
VITE_SUPABASE_URL=https://<referensi-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-public-key>
```

Tanpa dua nilai ini aplikasi berjalan dalam mode demo (data disimpan di `localStorage`).

### 3. Jalankan lokal

```bash
cd frontend
npm install
npm run dev
```

Buka http://localhost:5173. Build produksi dengan `npm run build`, hasilnya di `dist/`.

### 4. Deploy ke Vercel

- Git repo ini sudah siap, root frontend di folder `frontend/` dengan preset **Vite**.
- Tambahkan env var yang sama (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) di dashboard Vercel.
- `vercel.json` sudah berisi rewrite SPA.

## Struktur

```
finhabit-app/
└─ frontend/
   ├─ src/components/   elemen UI bersama (ring, modal, toast, success)
   ├─ src/context/      state app, auth, dan navigasi antar layar
   ├─ src/lib/          rewards (mesin poin), api (live), store (demo), data, util
   ├─ src/pages/        Home, Learn, Challenge, Expenses, Budget, Saving, Decision, Family, Score, Profile, Auth
   └─ supabase/         schema.sql
```

Logika poin, dimensi, dan badge hidup di satu sumber: `frontend/src/lib/rewards.js`. File ini dipakai oleh `api.js` (Supabase live) dan `store.js` (mode demo), jadi hasilnya selalu identik di kedua mode.

## Teknologi

- React + Vite
- Supabase (Postgres, Auth, RLS)
- Vercel