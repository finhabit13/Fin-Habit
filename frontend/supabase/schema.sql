-- Jalankan di Supabase SQL Editor (Dashboard > SQL Editor).
-- Skema migrasi backend FastAPI+MongoDB -> Supabase (Postgres + RLS).
-- Kolom profiles mencerminkan bentuk user pada aplikasi (lihat models.new_user backend).

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default 'Bailey',
  points integer not null default 0,
  streak integer not null default 0,
  challenges_done integer not null default 0,
  dims jsonb not null default '{"saving":0,"spending":0,"decision":0,"goal":0,"risk":0}',
  last_week integer not null default 0,
  weekly jsonb not null default '[0,0,0,0,0,0,0]',
  today_done integer not null default 0,
  today_total integer not null default 3,
  lessons_done jsonb not null default '[]',
  done_challenges jsonb not null default '[]',
  challenge_date jsonb not null default '{}',
  challenge_categories jsonb not null default '[]',
  case_index integer not null default 0,
  done_missions jsonb not null default '[]',
  badges jsonb not null default '[]',
  saving_goal numeric not null default 300000,
  saving_current numeric not null default 0,
  monthly_budget numeric not null default 500000,
  last_active_day text,
  created_at timestamptz not null default now()
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  amount numeric not null check (amount > 0),
  category text not null,
  note text not null default '',
  date date not null
);

create index expenses_user_date_idx on public.expenses (user_id, date desc);

-- Buat baris profiles otomatis saat user mendaftar lewat Supabase Auth.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', 'Bailey'))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.expenses enable row level security;

create policy "profiles select own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles insert own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles update own" on public.profiles
  for update using (auth.uid() = id);

create policy "expenses select own" on public.expenses
  for select using (auth.uid() = user_id);
create policy "expenses insert own" on public.expenses
  for insert with check (auth.uid() = user_id);
create policy "expenses update own" on public.expenses
  for update using (auth.uid() = user_id);
create policy "expenses delete own" on public.expenses
  for delete using (auth.uid() = user_id);

-- ============================================================
-- MIGRASI 2 - Leaderboard & Admin (Sep 2026)
-- JALANKAN DARI BARIS INI (file bagian atas sudah dieksekusi).
-- ============================================================

-- Peran profil: 'user' (default) atau 'admin'.
alter table public.profiles
  add column if not exists role text not null default 'user';

-- Papan skor publik: nama, poin, streak, badges semua pemain.
-- View berjalan sebagai pemilik tabel sehingga RLS tidak membatasi.
create or replace view public.leaderboard
with (security_invoker = false)
as
  select id, name, points, streak, badges
  from public.profiles
  where role <> 'admin'
  order by points desc;

grant select on public.leaderboard to anon, authenticated;

-- Helper: apakah user yang login berperan admin?
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- Statistik ringkas untuk halaman admin. Non-admin mendapat null.
create or replace function public.admin_stats()
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v jsonb;
begin
  if not public.is_admin() then
    return null;
  end if;

  select jsonb_build_object(
    'users', (select count(*) from public.profiles),
    'expenses', (select count(*) from public.expenses),
    'total_spent', coalesce((select sum(amount) from public.expenses), 0),
    'avg_points', (select coalesce(round(avg(points)::numeric, 1), 0) from public.profiles),
    'avg_streak', (select coalesce(round(avg(streak)::numeric, 1), 0) from public.profiles),
    'avg_score', (select coalesce(round(avg(
        (dims ->> 'saving')::integer + (dims ->> 'spending')::integer +
        (dims ->> 'decision')::integer + (dims ->> 'goal')::integer +
        (dims ->> 'risk')::integer)::numeric / 5, 1), 0) from public.profiles),
    'active_today', (select count(*) from public.profiles
                     where last_active_day = to_char(current_date, 'YYYY-MM-DD'))
  ) into v;

  return v;
end;
$$;

revoke all on function public.admin_stats() from public, anon;
grant execute on function public.admin_stats() to authenticated;

-- Admin boleh membaca & mengubah semua profil dan membaca semua pengeluaran.
create policy "profiles admin select" on public.profiles
  for select using (public.is_admin());
create policy "profiles admin update" on public.profiles
  for update using (public.is_admin());
create policy "expenses admin select" on public.expenses
  for select using (public.is_admin());

-- Cegah user biasa meng-eskalasi dirinya sendiri menjadi admin
-- lewat update kolom role (tools update own tetap berlaku untuk kolom lain).
create or replace function public.guard_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Peran hanya bisa diubah oleh admin.';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_guard_role on public.profiles;
create trigger profiles_guard_role
before update on public.profiles
for each row execute function public.guard_role_change();

-- ============================================================
-- MIGRASI 3 - Ban/Suspend + Leaderboard & Detail admin (Sep 2026)
-- JALANKAN DARI BARIS INI.
-- ============================================================

-- Akun ditangguhkan (banned): user tidak bisa masuk/mengakses aplikasi.
alter table public.profiles
  add column if not exists banned boolean not null default false;

-- Hanya admin yang boleh mengubah status banned (cegah user menonaktifkan dirinya).
create or replace function public.guard_banned_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.banned is distinct from old.banned and not public.is_admin() then
    raise exception 'Status banned hanya bisa diubah oleh admin.';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_guard_banned on public.profiles;
create trigger profiles_guard_banned
before update on public.profiles
for each row execute function public.guard_banned_change();

-- Leaderboard admin: semua profil (termasuk admin & banned) diurutkan poin.
-- Dipakai halaman admin untuk tampilan papan peringkat lengkap.
create or replace function public.admin_leaderboard()
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v jsonb;
begin
  if not public.is_admin() then
    return null;
  end if;

  select coalesce(jsonb_agg(row_to_json(u) order by u.points desc), '[]'::jsonb)
  from (
    select
      id, name, points, streak, badges,
      role, banned,
      row_number() over (order by points desc) as rank
    from public.profiles
  ) u into v;

  return v;
end;
$$;

revoke all on function public.admin_leaderboard() from public, anon;
grant execute on function public.admin_leaderboard() to authenticated;

-- Profil lengkap satu user untuk modal detail admin.
-- TIDAK mengembalikan catatan pribadi (expenses.note) — hanya agregat grafik.
create or replace function public.admin_profile(p_user uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v jsonb;
begin
  if not public.is_admin() then
    return null;
  end if;

  select jsonb_build_object(
    'id', p.id,
    'name', p.name,
    'points', p.points,
    'streak', p.streak,
    'challenges_done', p.challenges_done,
    'badges', p.badges,
    'dims', p.dims,
    'weekly', p.weekly,
    'saving_goal', p.saving_goal,
    'saving_current', p.saving_current,
    'monthly_budget', p.monthly_budget,
    'last_active_day', p.last_active_day,
    'created_at', p.created_at,
    'role', p.role,
    'banned', p.banned,
    'spend_by_cat', (
      select coalesce(jsonb_agg(row_to_json(x) order by x.total desc), '[]'::jsonb)
      from (
        select e.category, round(sum(e.amount)::numeric, 0) as total, count(*) as n
        from public.expenses e
        where e.user_id = p_user
        group by e.category
      ) x
    )
  ) into v
  from public.profiles p
  where p.id = p_user;

  return v;
end;
$$;

revoke all on function public.admin_profile() from public, anon;
grant execute on function public.admin_profile() to authenticated;

-- ============================================================
-- MIGRASI 4 - Profil hanya dibuat setelah email dikonfirmasi (Sep 2026)
-- JALANKAN DARI BARIS INI.
-- Prasyarat: nyalakan "Confirm email" di Dashboard > Authentication
-- > Sign In / Providers > Email. Baris profil (dan data pengguna lain)
-- baru akan ada setelah user meng-klik tautan verifikasi di email.
-- ============================================================

-- 1) Saat user baru INSERT (mendaftar): profil TIDAK dibuat
--    jika email belum dikonfirmasi (email_confirmed_at masih null).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email_confirmed_at is not null then
    insert into public.profiles (id, name)
    values (new.id, coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name', 'Bailey'))
    on conflict (id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- 2) Saat email dikonfirmasi (klik tautan verifikasi), baru buat profil.
create or replace function public.handle_user_confirmed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email_confirmed_at is not null
     and old.email_confirmed_at is null then
    insert into public.profiles (id, name)
    values (new.id, coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name', 'Bailey'))
    on conflict (id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_confirmed on auth.users;
create trigger on_auth_user_confirmed
after update on auth.users
for each row execute function public.handle_user_confirmed();

-- (Opsional, jalan terpisah) Hapus profil akun yang emailnya BELUM
-- dikonfirmasi (sisa akun buatan saat setting lama masih longgar).
-- Jalankan hanya jika yakin, karena menghapus data pengguna tsb:
-- delete from public.profiles p
-- where not exists (
--   select 1 from auth.users u
--   where u.id = p.id and u.email_confirmed_at is not null
-- );

-- ============================================================
-- MIGRASI 5 - Quiz Decision Lab + Banner Promosi (Sep 2026)
-- JALANKAN DARI BARIS INI.
-- 1) quiz_state menyimpan sesi kuis harian (tanggal, jumlah soal,
--    poin terkumpul, soal yang sudah dijawab) di baris profile.
-- 2) Tabel banners untuk carousel promosi di home.
-- ============================================================

alter table public.profiles
  add column if not exists quiz_state jsonb not null default '{}';

create table public.banners (
  id uuid primary key default gen_random_uuid(),
  image_data text not null,
  caption text not null default '',
  link text not null default '',
  position integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.banners enable row level security;

-- Semua user login bisa membaca banner aktif (untuk home).
create policy "banners select authed" on public.banners
  for select using (auth.role() = 'authenticated');

-- Admin mengelola banner lewat fungsi di bawah (bisa read semua).

create or replace function public.get_banners()
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v jsonb;
begin
  select coalesce(jsonb_agg(row_to_json(b) order by b.position), '[]'::jsonb)
  from (
    select id, image_data, caption, link, position
    from public.banners
    where active = true
  ) b into v;
  return v;
end;
$$;

revoke all on function public.get_banners() from public, anon;
grant execute on function public.get_banners() to authenticated;

create or replace function public.admin_banners_all()
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v jsonb;
begin
  if not public.is_admin() then
    return null;
  end if;
  select coalesce(jsonb_agg(row_to_json(b) order by b.position), '[]'::jsonb)
  from (
    select id, image_data, caption, link, position, active, created_at
    from public.banners
  ) b into v;
  return v;
end;
$$;

revoke all on function public.admin_banners_all() from public, anon;
grant execute on function public.admin_banners_all() to authenticated;

create or replace function public.admin_add_banner(p_image text, p_caption text, p_link text, p_position integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Hanya admin.';
  end if;
  insert into public.banners (image_data, caption, link, position)
  values (p_image, coalesce(p_caption, ''), coalesce(p_link, ''), coalesce(p_position, 0));
end;
$$;

revoke all on function public.admin_add_banner(text, text, text, integer) from public, anon;
grant execute on function public.admin_add_banner(text, text, text, integer) to authenticated;

create or replace function public.admin_set_banner(p_id uuid, p_active boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Hanya admin.';
  end if;
  update public.banners
  set active = coalesce(p_active, true)
  where id = p_id;
end;
$$;

revoke all on function public.admin_set_banner(uuid, boolean) from public, anon;
grant execute on function public.admin_set_banner(uuid, boolean) to authenticated;

create or replace function public.admin_delete_banner(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Hanya admin.';
  end if;
  delete from public.banners where id = p_id;
end;
$$;

revoke all on function public.admin_delete_banner(uuid) from public, anon;
grant execute on function public.admin_delete_banner(uuid) to authenticated;

-- ============================================================
-- MIGRASI 6 - Reset Acak Poin Leaderboard (Sep 2026)
-- JALANKAN DARI BARIS INI (sekali saja, di Supabase SQL Editor).
-- Sebelum update quiz, ada user yang spam poin sehingga
-- dominasi leaderboard tidak wajar. Blok ini mengacak poin
-- semua user NON-ADMIN menjadi 0-49 agar papan peringkat
-- kembali sehat. Akun admin tidak ikut diacak.
-- ============================================================

-- 1) Pratinjau (jalankan dulu, lihat siapa yang poinnya akan diacak):
--    Hanya user dengan poin >= 50 yang diacak; yang < 50 dibiarkan.
select id, name, role, points, streak
from public.profiles
where role <> 'admin'
order by points desc;

-- 2) Acak poin >= 50 menjadi 0-49. Yang sudah di bawah 50 tidak diubah.
--    Jalankan dalam satu transaksi agar bisa dibatalkan:
begin;

update public.profiles
set points = floor(random() * 50)::integer
where role <> 'admin' and points >= 50;

-- 3) Verifikasi (tidak boleh ada non-admin dengan poin >= 50):
select id, name, role, points
from public.profiles
where role <> 'admin' and points >= 50
order by points desc;

-- 4) Kalau hasil sudah benar, ubah baris di bawah menjadi "commit;"
--    lalu jalankan ulang. Kalau belum yakin, cukup jalankan "rollback;".
commit;

-- ============================================================
-- (OPSIONAL) Bereskan data abnormal lain akibat spam.
-- Jalankan hanya kalau angka-angka ini memang terlihat nggak wajar.
-- ============================================================

-- Clamp dimensi skill ke rentang wajar 0-100 (dipakai di Skor & rating).
update public.profiles
set dims = jsonb_build_object(
  'saving',   least(greatest(coalesce((dims ->> 'saving')::integer, 0), 0), 100),
  'spending', least(greatest(coalesce((dims ->> 'spending')::integer, 0), 0), 100),
  'decision', least(greatest(coalesce((dims ->> 'decision')::integer, 0), 0), 100),
  'goal',     least(greatest(coalesce((dims ->> 'goal')::integer, 0), 0), 100),
  'risk',     least(greatest(coalesce((dims ->> 'risk')::integer, 0), 0), 100)
)
where role <> 'admin';

-- Cegah streak absurd (maks. 1 tahun = 365). Bukan penghapusan data,
-- hanya membatasi akun yang streak-nya tidak masuk akal.
update public.profiles
set streak = 365
where role <> 'admin' and streak > 365;

-- ============================================================
-- MIGRASI 7 - Foto Profil, Nama, & Dashboard Admin Terpisah (Sep 2026)
-- JALANKAN DARI BARIS INI (sekali saja, di Supabase SQL Editor).
-- 1) Kolom avatar_url + RPC ganti nama/foto (user hanya boleh ubah 2 kolom ini).
-- 2) Bucket storage "avatars" + policy agar user hanya bisa akses folder miliknya.
-- 3) RPC admin_overview() untuk visual data di dashboard admin utama.
-- ============================================================

-- 1) Kolom foto profil & refleksi challenge ---------------------------------

alter table public.profiles
  add column if not exists avatar_url text;

alter table public.profiles
  add column if not exists challenge_reflections jsonb not null default '[]'::jsonb;

-- Ganti nama & foto lewat RPC, bukan update langsung, supaya user tidak
-- bisa menyunting kolom lain (poin, streak, dims) lewat RLS.
-- p_name       : 1-40 karakter, wajib diisi.
-- p_avatar_url  : null = jangan ubah foto, '' = hapus foto, selain itu URL publik.
create or replace function public.update_identity(p_name text, p_avatar_url text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
  v_avatar text;
  v_new_name text;
  v_new_avatar text;
begin
  v_name := nullif(btrim(p_name), '');
  if v_name is null or char_length(v_name) > 40 then
    raise exception 'Nama harus 1-40 karakter';
  end if;

  if p_avatar_url is not null and btrim(p_avatar_url) <> '' then
    v_avatar := btrim(p_avatar_url);
    if v_avatar !~ '^https://[a-z0-9.-]+/storage/v1/object/public/avatars/' then
      raise exception 'URL foto tidak valid';
    end if;
  end if;

  update public.profiles
  set name = v_name,
      avatar_url = case
        when p_avatar_url is null then avatar_url
        when btrim(p_avatar_url) = '' then null
        else v_avatar
      end
  where id = auth.uid()
  returning name, avatar_url into v_new_name, v_new_avatar;

  if v_new_name is null then
    raise exception 'Profil tidak ditemukan';
  end if;

  return jsonb_build_object('name', v_new_name, 'avatar_url', v_new_avatar);
end;
$$;

revoke all on function public.update_identity(text, text) from public, anon;
grant execute on function public.update_identity(text, text) to authenticated;

-- Kolom baru harus ikut terbaca oleh RLS yang sudah ada (policies lama tetap berlaku).

-- 2) Bucket foto profil --------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  2097152,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
  set public = true,
      file_size_limit = 2097152,
      allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp'];

-- Nama file dipaksa berawalan <user_id>/ supaya user hanya bisa menyentuh foldernya.
create or replace function public.avatar_owner()
returns text
language sql
stable
as $$
  select auth.uid()::text;
$$;

drop policy if exists "avatars read" on storage.objects;
create policy "avatars read" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "avatars insert own" on storage.objects;
create policy "avatars insert own" on storage.objects
  for insert with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = public.avatar_owner());

drop policy if exists "avatars update own" on storage.objects;
create policy "avatars update own" on storage.objects
  for update using (bucket_id = 'avatars' and (storage.foldername(name))[1] = public.avatar_owner());

drop policy if exists "avatars delete own" on storage.objects;
create policy "avatars delete own" on storage.objects
  for delete using (bucket_id = 'avatars' and (storage.foldername(name))[1] = public.avatar_owner());

-- 3) Ringkasan data untuk dashboard admin utama ---------------------------

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
    'saving_total', coalesce((select sum(saving_current) from public.profiles), 0),
    'saving_goal_total', coalesce((select sum(saving_goal) from public.profiles), 0),
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

revoke all on function public.admin_overview() from public, anon;
grant execute on function public.admin_overview() to authenticated;
-- ============================================================
-- MIGRASI 8 - CHALLENGE BUATAN ADMIN
-- Challenge bawaan tetap ada di data.js. Yang ada di tabel ini
-- adalah tambahan yang dibuat admin lewat dashboard.
-- Kolom 'description' bukan 'desc' karena DESC keyword terpesan
-- di Postgres dan akan merusak query PostgREST.
-- ============================================================

create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'practice'
    check (kind in ('video', 'read', 'quiz', 'practice')),
  title text not null check (char_length(trim(title)) between 3 and 120),
  description text not null default '' check (char_length(description) <= 400),
  source text not null default '' check (char_length(source) <= 80),
  url text not null default '' check (url = '' or url ~ '^https://'),
  steps jsonb not null default '[]'::jsonb
    check (jsonb_typeof(steps) = 'array' and jsonb_array_length(steps) between 1 and 8),
  minutes integer not null default 5 check (minutes between 1 and 240),
  points integer not null default 20 check (points between 5 and 200),
  dim text not null default 'goal'
    check (dim in ('saving', 'spending', 'decision', 'goal', 'risk')),
  active boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists challenges_active_idx
  on public.challenges (active, position);

alter table public.challenges enable row level security;

-- Semua user login bisa membaca challenge yang aktif saja.
create policy "challenges select authed" on public.challenges
  for select using (auth.role() = 'authenticated' and active);

-- Tulis hanya admin. Tiap policies-named supaya create ulang tidak konflik.
create policy "challenges insert admin" on public.challenges
  for insert with check (public.is_admin());

create policy "challenges update admin" on public.challenges
  for update using (public.is_admin()) with check (public.is_admin());

create policy "challenges delete admin" on public.challenges
  for delete using (public.is_admin());