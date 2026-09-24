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
    values (new.id, coalesce(new.raw_user_meta_data ->> 'name', 'Bailey'))
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
    values (new.id, coalesce(new.raw_user_meta_data ->> 'name', 'Bailey'))
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