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
- **Family Group** - satu keluarga (maksimal 8 orang) berbagi misi rumah dengan satu bar progres bersama. Owner membuat misi, setiap anggota mengisi satu centang dan dapat +5 poin, maksimal 5 kontribusi per orang per hari.
- **Finance Habit Score** - skor 0-100 dari 5 dimensi (saving, spending, decision, goal, risk): breakdown, grafik 7 hari, badge, dan streak harian.

## Menggunakan aplikasi

### Membuat akun

Buka aplikasi lalu pilih tab **Daftar**, isi nama, email, dan kata sandi (minimal 6 karakter), tekan **Buat akun**. Kalau *Confirm email* dimatikan di Supabase, akun langsung aktif. Tidak mau daftar? Tekan **Coba mode demo tanpa akun**: semua data disimpan di browser ini saja, jadi tidak ikut tersimpan antar perangkat.

### Alur harian

1. **Track Spending** - catat setiap pengeluaran beserta kategorinya (Makanan, Minuman, Transportasi, Game, Belanja, Lainnya). Tiap catatan memberi **+5 poin** dan ikut menghitung pemakaian budget bulanan. Riwayat bulan ini bisa dihapus kapan saja.
2. **Daily Challenge** - kartu challenge di Home berganti setiap tanggal. Buka halaman **Challenge**, kerjakan sesuai tantangan, tandai chip yang relevan, lalu tandai selesai untuk mendapat poin (15-35 poin tergantung tantangan).
3. **Learn** - pilih topik (Saving, Smart Spending, Budgeting, Goal Setting, Risk Awareness) dan baca lesson singkatnya. Setiap lesson selesai memberi **+10 poin** dan menaikkan dimensi topik tersebut.

Tiga slot **Progress hari ini** di Home terisi setiap kamu melakukan aktivitas berpoin (mencatat pengeluaran, menyelesaikan lesson, challenge, kasus, atau misi), maksimal 3 per hari.

### Kelola uang

- **Budget** - atur target pengeluaran bulanan. Bar pemakaian menunjukkan status: Aman (< 80%), Perhatian (80-100%), Berlebihan (> 100%). Saat melewati batas, kartu peringatan muncul di Home.
- **Saving Goals** - tentukan target tabungan dan nominal setoran harian; aplikasi menghitung estimasi hari untuk mencapai target. Menambah tabungan memberi **+10 poin**.
- **Decision Lab** - selesaikan 3 kasus keuangan sehari-hari. Setiap pilihan memberi poin berjumlah berbeda dan menaikkan dimensi skor tertentu (saving, spending, goal, atau risk).
- **Family Mission** - 3 misi yang dikerjakan di rumah bersama keluarga, misalnya menyusun belanja mingguan atau hemat listrik, masing-masing bernilai 40-50 poin.
- **Family Group** - di halaman Misi, buat family atau gabung dengan kode undangan 6 karakter. Anggota bisa keluar kapan saja; owner juga bisa mengeluarkan anggota dan menghapus family. Misi dibuat owner (judul, deskripsi opsional, target 1-200 centang), lalu semua anggota menekan **Saya kerjakan** untuk mengisi bar progres bersama. Setiap kontribusi selalu bernilai +5 poin dan maksimal 5 kali per orang per hari, jadi satu family bisa mengumpulkan paling banyak 25 poin per hari dari misi bersama. Misi keluarga harian tetap bisa dikerjakan sendiri, tanpa family.

### Poin, skor, dan badge

- **Total poin** - kumpulkan dari semua aktivitas. Poin menentukan level: Financial Beginner, Explorer (600), Achiever (1200), Master (2000).
- **Finance Habit Score** - rata-rata 5 dimensi (saving, spending, decision, goal, risk) dalam skala 0-100, dengan grafik 7 hari di halaman Score.
- **Streak** - "hari beruntun" naik satu untuk setiap hari yang punya aktivitas.
- **Badge** - muncul otomatis saat syarat terpenuhi, contoh: mencatat pengeluaran pertama (tracker), menabung pertama kali (first-saver), 7 hari beruntun (streak-7), 5 lesson selesai (scholar), 1 misi keluarga (family-hero), dan 1.000 poin (decider).

## Setup dan menjalankan

### 1. Siapkan project Supabase

Buat project baru di [supabase.com](https://supabase.com). Buka **SQL Editor**, tempel dan jalankan isi `frontend/supabase/schema.sql`. File ini membuat:

- tabel `profiles` (menyimpan data kebiasaan tiap user)
- tabel `expenses`
- trigger `handle_new_user` yang membuat baris profil otomatis saat user baru mendaftar
- kebijakan **RLS** sehingga tiap user hanya bisa membaca dan mengubah datanya sendiri

Lalu di **Authentication → Sign In / Providers → Email**, matikan *Confirm email* supaya pendaftaran langsung masuk tanpa verifikasi (opsional tapi disarankan).

Setelah `schema.sql`, jalankan file di `frontend/supabase/migration-*.sql` **berurutan dari nomor terkecil** (10 sampai 15). Untuk fitur Family Group, `migration-15-family-system.sql` yang penting karena menambah:

- tabel `families`, `family_members`, `family_missions`, `family_mission_contributions`, plus kolom `profiles.family_id`
- RLS **enabled** di keempat tabel itu, jadi tidak perlu `disable row level security` saat menjalankan migrasi
- view `family_roster` dan RPC `create_family(text)` / `join_family(text)` (`security definer` + `search_path` terkunci)
- batas yang sama dengan yang dipakai klien: 5 kontribusi per user per hari, target misi 1-200, maksimal 8 anggota

Buat dan gabung family lewat RPC, bukan `insert` dari klien: kode undangan dibuat di dalam database (`generate_invite_code()`, `security definer`), jadi tidak bisa direka di sisi browser. Kalau menu family gagal dengan "Kode undangan tidak ditemukan" padahal kodenya benar, hampir selalu karena migrasi ini belum dijalankan di project itu. Batas di migrasi dan konstanta di `frontend/src/lib/family.js` dijaga tetap sama oleh `npm test`.

RLS tidak berlaku untuk role yang menjalankan migrasi (SQL Editor = `postgres`, owner tabel), tapi berlaku penuh untuk `authenticated` saat aplikasi berjalan. Jangan pernah memakai service-role key di browser: begitu RLS dilewati, semua policy di migration 15 tidak berlaku lagi.

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
   ├─ src/lib/          rewards (mesin poin), api (live), store (demo), family (aturan family group), data, util
   ├─ src/pages/        Home, Learn, Challenge, Expenses, Budget, Saving, Decision, Family, Score, Profile, Auth
   └─ supabase/         schema.sql + migration-10 sampai migration-15
```

Logika poin, dimensi, dan badge hidup di satu sumber: `frontend/src/lib/rewards.js`. File ini dipakai oleh `api.js` (Supabase live) dan `store.js` (mode demo), jadi hasilnya selalu identik di kedua mode. Aturan main Family Group (validasi nama, kuota harian, progress bar) juga hidup di satu sumber: `frontend/src/lib/family.js`, dibaca kedua adapter itu, sehingga mode demo dan mode live tidak bisa berbeda aturan.

## Teknologi

- React + Vite
- Supabase (Postgres, Auth, RLS)
- Vercel