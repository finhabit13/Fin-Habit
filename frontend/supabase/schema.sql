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