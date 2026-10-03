-- ============================================================
-- MIGRASI 10 - Tabungan Goals (Sep 2026)
-- Jalankan seluruh file ini di SQL Editor Supabase.
-- Aman dijalankan ulang: semua create memakai drop / or replace / if not exists.
-- ============================================================

-- ----------------------------------------------------------------
-- 1. Tabel
-- ----------------------------------------------------------------
-- Saldo sengaja TIDAK disimpan sebagai kolom.
--
-- Kalau saldo disimpan di saving_goals atau di profiles, user bisa menulis
-- ulang kolom itu sendiri lewat policy update own. Persis masalah yang
-- sudah dibahas di MIGRASI 9: trigger yang hanya melindungi role dan banned
-- tidak menyentuh kolom gameplay. Dengan menghitung saldo dari transaksi,
-- tidak ada angka yang bisa dipalsukan tanpa menyetel transaksinya.
--
-- Menghapus riwayat otomatis mengurangi saldo, karena saldo selalu dihitung
-- ulang dari awal. Tidak ada langkah pembatalan yang bisa terlewat.

create table if not exists public.saving_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  target_amount numeric not null check (target_amount > 0),
  -- 0 berarti tidak punya rencana, bukan berarti tak hingga hari.
  cadence_amount numeric not null default 0 check (cadence_amount >= 0),
  cadence_unit text not null default 'day' check (cadence_unit in ('day','week','month')),
  cover_url text,
  created_at timestamptz not null default now(),
  constraint saving_goals_name_len check (char_length(btrim(name)) between 1 and 60)
);

create index if not exists saving_goals_user_idx
  on public.saving_goals (user_id, created_at);

create table if not exists public.saving_transactions (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.saving_goals(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('income','expense')),
  amount numeric not null check (amount > 0),
  note text,
  occurred_on date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists saving_tx_goal_idx
  on public.saving_transactions (goal_id, occurred_on desc, created_at desc);

-- created_at_goal_published hanya relevan setelah baris ada, jadi ditambahkan
-- terpisah dari create table (kalau dibuat di dalam definisi, trigger akan
-- memakai nama yang belum ada saat tabel itu sendiri baru dibuat).
create or replace function public.guard_goal_columns()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  -- created_at adalah acuan hitung "sisa hari". Kalau boleh ditulis ulang,
  -- goal bisa tampak dibuat kemarin atau besok untuk mengubah pace-nya.
  if new.created_at is distinct from old.created_at
     or new.user_id is distinct from old.user_id then
    raise exception 'created_at dan user_id tidak bisa diubah'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists saving_goals_guard_columns on public.saving_goals;
create trigger saving_goals_guard_columns
  before update on public.saving_goals
  for each row execute function public.guard_goal_columns();

-- ----------------------------------------------------------------
-- 2. Bucket gambar tujuan
-- ----------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('saving-covers', 'saving-covers', true, 5242880,
        array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

-- Policy baca langsung ke folder milik sendiri, sama seperti yang dipasang
-- MIGRASI 12. Tidak memakai policy longgar "bucket_id = 'saving-covers'" tanpa
-- syarat autentikasi, karena file ini harus aman dijalankan ulang SETELAH
-- MIGRASI 12: policy longgar akan menimpa pengetatan ketatnya dan membuka lagi
-- bucket yang sudah privat. Bucket publik tetap bisa dibaca lewat jalur
-- /object/public/, jadi tidak ada yang berubah untuk klien versi lama.
drop policy if exists "saving covers read" on storage.objects;
create policy "saving covers read" on storage.objects
  for select to authenticated
  using (bucket_id = 'saving-covers'
     and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "saving covers insert own" on storage.objects;
create policy "saving covers insert own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'saving-covers'
              and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "saving covers delete own" on storage.objects;
create policy "saving covers delete own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'saving-covers'
         and (storage.foldername(name))[1] = auth.uid()::text);

-- ----------------------------------------------------------------
-- 3. RLS
-- ----------------------------------------------------------------
alter table public.saving_goals enable row level security;
alter table public.saving_transactions enable row level security;

-- Privileges. RLS cuma membatasi baris, bukan hak akses tabel: tanpa grant
-- di sini, tabel yang dibuat lewat SQL editor tidak bisa dipakai anon/authenticated
-- dan semua query dari client berakhir dengan "permission denied for table".
grant select, insert, update, delete on public.saving_goals to authenticated;
grant select, insert, delete on public.saving_transactions to authenticated;

-- Goal milik sendiri: boleh dibuat, diubah, dihapus.
drop policy if exists "saving_goals own" on public.saving_goals;
create policy "saving_goals own" on public.saving_goals
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Transaksi boleh ditambah dan dihapus sendiri.
drop policy if exists "saving_tx read own" on public.saving_transactions;
create policy "saving_tx read own" on public.saving_transactions
  for select to authenticated using (auth.uid() = user_id);

-- Insert WAJIB goal milik orang yang sama. Kalau hanya auth.uid() = user_id,
-- user lain bisa menyisipkan baris dengan goal_id milik orang lain: saldonya
-- ikut nambah di pot theirs dan bisa masuk hitungan admin/leaderboard.
drop policy if exists "saving_tx insert own" on public.saving_transactions;
create policy "saving_tx insert own" on public.saving_transactions
  for insert to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.saving_goals g
      where g.id = saving_transactions.goal_id
        and g.user_id = auth.uid()
    )
  );

-- Riwayat TIDAK boleh diubah, hanya ditambah atau dihapus.
-- Riwayat yang bisa diedit membuat saldo tidak bisa ditelusuri: orang bisa
-- mengubah nominal setelah angkanya sempat dipakai untuk hitung hari.
drop policy if exists "saving_tx update own" on public.saving_transactions;
create policy "saving_tx update own" on public.saving_transactions
  for update to authenticated using (false);

drop policy if exists "saving_tx delete own" on public.saving_transactions;
create policy "saving_tx delete own" on public.saving_transactions
  for delete to authenticated using (auth.uid() = user_id);

-- ----------------------------------------------------------------
-- 4. Pindahkan data lama jadi satu goal
-- ----------------------------------------------------------------
-- Hanya yang targetnya benar-benar diganti atau saldonya sudah ada.
-- Kalau default 300000 ikut dipindah, setiap akun baru langsung punya goal
-- "Tabungan Saya" yang tidak pernah diminta.
insert into public.saving_goals (user_id, name, target_amount, cadence_amount, cadence_unit)
select p.id, 'Tabungan Saya', p.saving_goal, 0, 'day'
from public.profiles p
where (p.saving_goal <> 300000 or p.saving_current > 0)
  -- Penjaga idempotensi. Tanpa ini, menjalankan ulang file ini menabrak unique
  -- index dan seluruh script berhenti dengan "duplicate key value violates
  -- unique constraint". Pengecekan harus di dalam INSERT, bukan lewat index.
  and not exists (
    select 1 from public.saving_goals g
    where g.user_id = p.id and g.name = 'Tabungan Saya'
  );

-- Index unique parsial ini dulu dipakai sebagai penjaga migrasi, tapi setelah
-- data pindah dia berubah jadi constraint permanen atas data pengguna: orang
-- yang sah-saja ingin punya dua goal bernama "Tabungan Saya" akan mendapat
-- error 23505 mentah dari database. Pengecekan NOT EXISTS di atas sudah
-- menangani eksekusi ulang, jadi index ini tidak lagi diperlukan.
drop index if exists public.saving_goals_legacy_once;

-- Saldo lamanya ikut jadi satu transaksi pemasukan supaya angka yang dulu
-- terlihat di halaman saving tidak ikut hilang.
insert into public.saving_transactions (goal_id, user_id, kind, amount, note, occurred_on)
select g.id, g.user_id, 'income', p.saving_current, 'Saldo lama', current_date
from public.profiles p
join public.saving_goals g
  on g.user_id = p.id and g.name = 'Tabungan Saya'
where p.saving_current > 0
  and not exists (
    select 1 from public.saving_transactions t
    where t.goal_id = g.id and t.note = 'Saldo lama'
  );

-- Kolom saving_goal / saving_current sengaja tidak di-drop. Tidak ada UI yang
-- membacanya lagi, tapi halaman admin masih menunjuk ke sana sampai bagian 5
-- ikut dijalankan, dan men-drop kolom lebih berisiko daripada menyisakannya.
-- ----------------------------------------------------------------
-- 5. admin_overview() ikut menghitung dari goal
-- ----------------------------------------------------------------
-- Halaman admin masih membaca key 'saving_total' dan 'saving_goal_total'.
-- Dua key itu sekarang dijumlahkan dari seluruh goal, bukan dari satu
-- target per orang seperti sebelumnya.
--
-- Badannya/generated dari definisi yang sedang berjalan, bukan ditulis ulang
-- dari ingatan: kalau ada key yang terlewat, dashboard admin ikut kehilangan
-- datanya. Kalau nanti ada key baru di schema.sql, bagian ini harus di-regenerate.
-- ----------------------------------------------------------------
create or replace function public.admin_overview()
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v jsonb;
  v_score numeric;
begin
  if not public.is_admin() then
    return null;
  end if;

  select jsonb_build_object(
    'users', (select count(*) from public.profiles),
    'users_student', (select count(*) from public.profiles where role <> 'admin'),
    'admins', (select count(*) from public.profiles where role = 'admin'),
    'banned', (select count(*) from public.profiles where banned),
    'active_today', (select count(*) from public.profiles
                     where last_active_day = to_char(current_date, 'YYYY-MM-DD')),
    'active_7d', (select count(*) from public.profiles
                  where last_active_day >= to_char(current_date - 6, 'YYYY-MM-DD')),
    'active_30d', (select count(*) from public.profiles
                   where last_active_day >= to_char(current_date - 29, 'YYYY-MM-DD')),
    'new_7d', (select count(*) from public.profiles
               where created_at >= now() - interval '7 days'),
    'new_30d', (select count(*) from public.profiles
                where created_at >= now() - interval '30 days'),
    'avg_points', (select coalesce(round(avg(points)::numeric, 1), 0) from public.profiles),
    'avg_streak', (select coalesce(round(avg(streak)::numeric, 1), 0) from public.profiles),
    'avg_challenges', (select coalesce(round(avg(challenges_done)::numeric, 1), 0) from public.profiles),
    'total_expenses', (select count(*) from public.expenses),
    'total_spent', coalesce((select sum(amount) from public.expenses), 0),
    'spent_7d', coalesce((select sum(amount) from public.expenses
                          where date >= current_date - 6), 0),
    'expenses_7d', (select count(*) from public.expenses
                    where date >= current_date - 6),
    'with_avatar', (select count(*) from public.profiles where avatar_url is not null),
    'saving_total', coalesce((select sum(case when t.kind = 'expense'
                                                 then -t.amount else t.amount end)
                                from public.saving_transactions t), 0),
    'saving_goal_total', coalesce((select sum(target_amount) from public.saving_goals), 0),
    'saving_goals', (select count(*) from public.saving_goals),
    'dim_avg', jsonb_build_object(
      'saving',   (select coalesce(round(avg(coalesce((dims ->> 'saving')::numeric, 0)), 1), 0) from public.profiles),
      'spending', (select coalesce(round(avg(coalesce((dims ->> 'spending')::numeric, 0)), 1), 0) from public.profiles),
      'decision', (select coalesce(round(avg(coalesce((dims ->> 'decision')::numeric, 0)), 1), 0) from public.profiles),
      'goal',     (select coalesce(round(avg(coalesce((dims ->> 'goal')::numeric, 0)), 1), 0) from public.profiles),
      'risk',     (select coalesce(round(avg(coalesce((dims ->> 'risk')::numeric, 0)), 1), 0) from public.profiles)
    ),
    -- Sebaran skor habits: starter (<40), steady (40-69), smart (70-84), master (85+)
    'score_bands', jsonb_build_object(
      'starter', (select count(*) from public.profiles where (
        (dims ->> 'saving')::integer + (dims ->> 'spending')::integer +
        (dims ->> 'decision')::integer + (dims ->> 'goal')::integer +
        (dims ->> 'risk')::integer) / 5 < 40),
      'steady', (select count(*) from public.profiles where (
        (dims ->> 'saving')::integer + (dims ->> 'spending')::integer +
        (dims ->> 'decision')::integer + (dims ->> 'goal')::integer +
        (dims ->> 'risk')::integer) / 5 between 40 and 69),
      'smart', (select count(*) from public.profiles where (
        (dims ->> 'saving')::integer + (dims ->> 'spending')::integer +
        (dims ->> 'decision')::integer + (dims ->> 'goal')::integer +
        (dims ->> 'risk')::integer) / 5 between 70 and 84),
      'master', (select count(*) from public.profiles where (
        (dims ->> 'saving')::integer + (dims ->> 'spending')::integer +
        (dims ->> 'decision')::integer + (dims ->> 'goal')::integer +
        (dims ->> 'risk')::integer) / 5 >= 85)
    ),
    -- Rata-rata skor gabungan; dipakai sebagai angka "literasi bagus"
    'literacy_good', (select count(*) from public.profiles where (
      (dims ->> 'saving')::integer + (dims ->> 'spending')::integer +
      (dims ->> 'decision')::integer + (dims ->> 'goal')::integer +
      (dims ->> 'risk')::integer) / 5 >= 70),
    'avg_score', (select coalesce(round(avg(
        (dims ->> 'saving')::integer + (dims ->> 'spending')::integer +
        (dims ->> 'decision')::integer + (dims ->> 'goal')::integer +
        (dims ->> 'risk')::integer)::numeric / 5, 1), 0) from public.profiles),
    -- Sebar jumlah expense per hari selama 14 hari terakhir (grafik tren)
    'daily_expenses', coalesce((
      select jsonb_agg(jsonb_build_object('d', d::text, 'n', n::integer, 'total', total::numeric) order by d)
      from (
        select e.date as d, count(*) as n, sum(e.amount) as total
        from public.expenses e
        where e.date >= current_date - 13
        group by e.date
      ) s
    ), '[]'::jsonb),
    -- Papan 5 teratas + sebaran poin
    'top_users', coalesce((
      select jsonb_agg(jsonb_build_object('id', p.id, 'name', p.name, 'points', p.points,
                                          'streak', p.streak, 'avatar_url', p.avatar_url) order by p.points desc)
      from (select id, name, points, streak, avatar_url
            from public.profiles where role <> 'admin'
            order by points desc limit 5) p
    ), '[]'::jsonb),
    'points_bands', jsonb_build_object(
      '0_99',    (select count(*) from public.profiles where points < 100),
      '100_299', (select count(*) from public.profiles where points between 100 and 299),
      '300_599', (select count(*) from public.profiles where points between 300 and 599),
      '600_1199',(select count(*) from public.profiles where points between 600 and 1199),
      '1200plus',(select count(*) from public.profiles where points >= 1200)
    )
  ) into v;

  return v;
end;
$$;
