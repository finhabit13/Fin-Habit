

-- 10) Family Missions (cooperative)
create table if not exists public.family_missions (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  title text not null check (length(trim(title)) >= 1 and length(trim(title)) <= 120),
  description text not null default '',
  target numeric not null check (target > 0),
  current numeric not null default 0 check (current >= 0),
  deadline date,
  status text not null default 'active' check (status in ('active','completed','cancelled')),
  created_by uuid not null references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists family_missions_family_idx on public.family_missions (family_id);

-- 11) Contributions
create table if not exists public.family_mission_contributions (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references public.family_missions (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  value numeric not null check (value > 0),
  created_at timestamptz not null default now(),
  unique (mission_id, user_id, created_at)
);

create index if not exists fmc_mission_idx on public.family_mission_contributions (mission_id);
create index if not exists fmc_user_idx on public.family_mission_contributions (user_id);

-- 12) RLS family_missions
alter table public.family_missions enable row level security;

create policy "fm select member" on public.family_missions
  for select using (
    exists (
      select 1 from public.family_members m
      where m.family_id = family_missions.family_id and m.user_id = auth.uid()
    )
  );

create policy "fm insert owner" on public.family_missions
  for insert with check (
    exists (
      select 1 from public.families f
      where f.id = family_missions.family_id and f.owner_id = auth.uid()
    )
  );

create policy "fm update owner" on public.family_missions
  for update using (
    exists (
      select 1 from public.families f
      where f.id = family_missions.family_id and f.owner_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.families f
      where f.id = family_missions.family_id and f.owner_id = auth.uid()
    )
  );

create policy "fm delete owner" on public.family_missions
  for delete using (
    exists (
      select 1 from public.families f
      where f.id = family_missions.family_id and f.owner_id = auth.uid()
    )
  );

-- 13) RLS contributions
alter table public.family_mission_contributions enable row level security;

create policy "fmc select member" on public.family_mission_contributions
  for select using (
    exists (
      select 1 from public.family_members m
       join public.family_missions fm on fm.id = family_mission_contributions.mission_id
      where m.family_id = fm.family_id and m.user_id = auth.uid()
    )
  );

create policy "fmc insert self member" on public.family_mission_contributions
  for insert with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.family_members m
       join public.family_missions fm on fm.id = family_mission_contributions.mission_id
      where m.family_id = fm.family_id and m.user_id = auth.uid()
    )
    and exists (
      select 1 from public.family_missions fm2
      where fm2.id = family_mission_contributions.mission_id and fm2.status = 'active'
        and (fm2.deadline is null or fm2.deadline >= current_date)
    )
  );

create policy "fmc update self member" on public.family_mission_contributions
  for update using (
    user_id = auth.uid()
    and exists (
      select 1 from public.family_members m
       join public.family_missions fm on fm.id = family_mission_contributions.mission_id
      where m.family_id = fm.family_id and m.user_id = auth.uid()
    )
  ) with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.family_members m
       join public.family_missions fm on fm.id = family_mission_contributions.mission_id
      where m.family_id = fm.family_id and m.user_id = auth.uid()
    )
  );

create policy "fmc delete self member" on public.family_mission_contributions
  for delete using (
    user_id = auth.uid()
    and exists (
      select 1 from public.family_members m
       join public.family_missions fm on fm.id = family_mission_contributions.mission_id
      where m.family_id = fm.family_id and m.user_id = auth.uid()
    )
  );

-- 14) Fungsi bantu
create or replace function public.family_member_count(f_id uuid)
returns integer
language sql
stable
security definer
as $$
  select count(*) from public.family_members where family_id = f_id;
$$;

create or replace function public.family_current_progress(m_id uuid)
returns numeric
language sql
stable
security definer
as $$
  select coalesce(sum(value), 0)
    from public.family_mission_contributions
   where mission_id = m_id;
$$;

-- 15) Auto-update current + status saat kontribusi berubah
create or replace function public.update_family_mission_progress()
returns trigger
language plpgsql
as $$
declare
  m_id uuid;
  cur numeric;
  tgt numeric;
  st  text;
begin
  -- mission_id checked via join/table; no old/new in this trigger context
  select fm.current, fm.target, fm.status
    into cur, tgt, st
    from public.family_missions fm
   where fm.id = m_id;
  if not found then return coalesce(new, old); end if;
  select coalesce(sum(c.value), 0)
    into cur
    from public.family_mission_contributions c
   where c.mission_id = m_id;
  update public.family_missions fm
     set current = cur,
         status = case
           when st = 'completed' then 'completed'
           when st = 'cancelled' then 'cancelled'
           when cur >= tgt then 'completed'
           else 'active'
         end,
         completed_at = case
           when (st <> 'completed' and cur >= tgt) then now()
           else fm.completed_at
         end
   where fm.id = m_id;
  return coalesce(new, old);
end;
$$;

drop trigger if exists fmc_progress_ins on public.family_mission_contributions;
drop trigger if exists fmc_progress_upd on public.family_mission_contributions;
drop trigger if exists fmc_progress_del on public.family_mission_contributions;
create trigger fmc_progress_ins after insert on public.family_mission_contributions for each row execute function public.update_family_mission_progress();
create trigger fmc_progress_upd after update on public.family_mission_contributions for each row execute function public.update_family_mission_progress();
create trigger fmc_progress_del after delete on public.family_mission_contributions for each row execute function public.update_family_mission_progress();
