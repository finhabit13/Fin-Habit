-- MIGRASI 15 - Family/Group System
-- Jalankan SETELAH MIGRASI 14.

create table if not exists public.families (id uuid primary key default gen_random_uuid(), name text not null check (length(trim(name))>=1 and length(trim(name))<=64), owner_id uuid not null references public.profiles(id) on delete cascade, invite_code text not null unique, created_at timestamptz not null default now());
create table if not exists public.family_members (family_id uuid not null references public.families(id) on delete cascade, user_id uuid not null references public.profiles(id) on delete cascade, role text not null check (role in ('owner','member')), joined_at timestamptz not null default now(), primary key (family_id,user_id));
create table if not exists public.family_missions (id uuid primary key default gen_random_uuid(), family_id uuid not null references public.families(id) on delete cascade, title text not null check (length(trim(title))>=1), description text, target integer not null check (target>0), current integer not null default 0 check (current>=0), status text not null default 'active' check (status in ('active','completed','cancelled')), created_by uuid not null references public.profiles(id), created_at timestamptz not null default now(), completed_at timestamptz, deadline timestamptz);
create table if not exists public.family_mission_contributions (id uuid primary key default gen_random_uuid(), mission_id uuid not null references public.family_missions(id) on delete cascade, user_id uuid not null references public.profiles(id), value integer not null check (value>0), created_at timestamptz not null default now());
alter table public.profiles add column if not exists family_id uuid references public.families(id) on delete set null;
-- Batas anggota dan pembuatan kode undangan dipisah jadi fungsi supaya bisa
-- dipanggil dari policy RLS. Bodinya wajib diapit $$ ... $$: Postgres hanya
-- menerima string literal sebagai badan fungsi, jadi "as select 8" tanpa
-- kutip akan ditolak dengan "syntax error at or near select".
create or replace function public.family_max_members() returns integer
language sql
immutable
security definer
set search_path = public
as $$ select 8 $$;

create or replace function public.generate_invite_code() returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  code text;
  exist boolean;
begin
  loop
    code := upper(substring(md5(gen_random_uuid()::text), 1, 6));
    select exists (select 1 from public.families f where f.invite_code = code) into exist;
    if not exist then
      exit;
    end if;
  end loop;
  return code;
end;
$$;

create index if not exists families_owner_idx on public.families (owner_id);
create index if not exists fm_family_idx on public.family_members (family_id);
create index if not exists fm_user_idx on public.family_members (user_id);
create index if not exists fms_family_idx on public.family_missions (family_id);
create index if not exists fms_status_idx on public.family_missions (status);
create index if not exists fmc_mission_idx on public.family_mission_contributions (mission_id);
create index if not exists fmc_user_idx on public.family_mission_contributions (user_id);

-- Tabel dibuat dengan "if not exists", policy dengan "drop ... if exists" dulu.
-- Tanpa drop, menjalankan ulang file ini (misal karena ada error di baris
-- sebelumnya) berhenti dengan "policy ... already exists" padahal tabelnya
-- sudah benar-benar ada. Intinya: migrasi ini harus bisa dijalankan berulang.
alter table public.families enable row level security;
drop policy if exists "families select member" on public.families;
create policy "families select member" on public.families for select using (exists (select 1 from public.family_members m where m.family_id = families.id and m.user_id = auth.uid()));
drop policy if exists "families insert own" on public.families;
create policy "families insert own" on public.families for insert with check (owner_id = auth.uid());
drop policy if exists "families update owner" on public.families;
create policy "families update owner" on public.families for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
drop policy if exists "families delete owner" on public.families;
create policy "families delete owner" on public.families for delete using (owner_id = auth.uid());

alter table public.family_members enable row level security;
drop policy if exists "members select member" on public.family_members;
create policy "members select member" on public.family_members for select using (exists (select 1 from public.family_members m2 where m2.family_id = family_members.family_id and m2.user_id = auth.uid()));
drop policy if exists "members insert owner" on public.family_members;
create policy "members insert owner" on public.family_members for insert with check (exists (select 1 from public.families f where f.id = family_members.family_id and f.owner_id = auth.uid()) and (select count(*) from public.family_members m where m.family_id = family_members.family_id) < public.family_max_members());
drop policy if exists "members delete self or owner" on public.family_members;
create policy "members delete self or owner" on public.family_members for delete using (user_id = auth.uid() or exists (select 1 from public.families f where f.id = family_members.family_id and f.owner_id = auth.uid()));

alter table public.family_missions enable row level security;
drop policy if exists "fms select member" on public.family_missions;
create policy "fms select member" on public.family_missions for select using (exists (select 1 from public.family_members m where m.family_id = family_missions.family_id and m.user_id = auth.uid()));
drop policy if exists "fms insert owner" on public.family_missions;
create policy "fms insert owner" on public.family_missions for insert with check (exists (select 1 from public.families f where f.id = family_missions.family_id and f.owner_id = auth.uid()));
drop policy if exists "fms update owner" on public.family_missions;
create policy "fms update owner" on public.family_missions for update using (exists (select 1 from public.families f where f.id = family_missions.family_id and f.owner_id = auth.uid())) with check (exists (select 1 from public.families f where f.id = family_missions.family_id and f.owner_id = auth.uid()));
drop policy if exists "fms delete owner" on public.family_missions;
create policy "fms delete owner" on public.family_missions for delete using (exists (select 1 from public.families f where f.id = family_missions.family_id and f.owner_id = auth.uid()));

-- Privileges. RLS cuma membatasi baris, bukan hak akses tabel: tabel yang
-- dibuat lewat SQL editor tidak otomatis bisa dipakai role anon/authenticated,
-- dan semua query dari client berakhir dengan "permission denied for table
-- families", bukan error policy yang lebih jelas. Grant di sini persis yang
-- dipakai src/lib/api.js:
--   families                     select (baca kode), delete (hapus family)
--   family_members               select (cek anggota), delete (leave/kick)
--   family_missions              select, insert (buat misi), delete
--   family_mission_contributions select (rekap + kuota), insert (contribute)
-- INSERT ke families/family_members sengaja tidak diberi: keduanya hanya
-- boleh lewat RPC create_family/join_family supaya kode undangan tetap dibuat
-- di dalam database. UPDATE ke family_missions juga tidak diberi, karena
-- current dan status dihitung trigger yang jalan sebagai owner tabel.
grant select, delete on public.families to authenticated;
grant select, delete on public.family_members to authenticated;
grant select, insert, delete on public.family_missions to authenticated;
grant select, insert on public.family_mission_contributions to authenticated;

alter table public.family_mission_contributions enable row level security;
drop policy if exists "fmc select member" on public.family_mission_contributions;
create policy "fmc select member" on public.family_mission_contributions for select using (exists (select 1 from public.family_members m join public.family_missions fm on fm.id = family_mission_contributions.mission_id where m.family_id = fm.family_id and m.user_id = auth.uid()));
drop policy if exists "fmc delete owner" on public.family_mission_contributions;
create policy "fmc delete owner" on public.family_mission_contributions for delete using (exists (select 1 from public.families f join public.family_missions fm on fm.family_id = f.id where fm.id = family_mission_contributions.mission_id and f.owner_id = auth.uid()));

-- Owner tidak boleh keluar sendiri, tapi baris owner HARUS boleh hilang saat
-- family-nya dihapus: itu keputusan owner sendiri, dan delete pada families
-- sudah cascade ke family_members. Baris parent sudah hilang saat trigger ini
-- jalan, jadi "family masih ada" adalah pembeda yang tepat antara keluar
-- sendiri dan dihapus bersama seluruh familynya.
create or replace function public.prevent_owner_leave() returns trigger
language plpgsql
as $$
begin
  if old.role = 'owner'
     and exists (select 1 from public.families f where f.id = old.family_id) then
    raise exception 'Owner tidak dapat keluar dari family. Hapus family atau ubah owner terlebih dahulu.';
  end if;
  return old;
end;
$$;
drop trigger if exists prevent_owner_leave_trg on public.family_members; create trigger prevent_owner_leave_trg before delete on public.family_members for each row execute function public.prevent_owner_leave();

-- security definer itu wajib, bukan gaya penulisan. Trigger ini jalan dengan
-- hak pengguna yang memicu.row-nya (anggota family), sementara policy update di
-- profiles hanya membuka baris milik sendiri. Tanpa security definer, UPDATE
-- di dalam trigger kena filter RLS dan diam-diam mengubah 0 baris: baris
-- family_id untuk anggota lain tidak pernah ikut tersinkron, terutama saat
-- owner menghapus family dan cascade ikut menghapus semua anggota.
-- search_path dikunci supaya fungsi ini tidak bisa dipanggil lewat objek milik
-- schema lain.
create or replace function public.sync_profile_family_id() returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.profiles set family_id = new.family_id where id = new.user_id;
    return new;
  elsif tg_op = 'DELETE' then
    -- Hanya kosongkan kalau user ini benar-benar tidak punya family lain.
    update public.profiles set family_id = null
     where id = old.user_id
       and not exists (select 1 from public.family_members m where m.user_id = old.user_id);
    return old;
  end if;
  return coalesce(new, old);
end;
$$;
drop trigger if exists fm_sync_profile_ins on public.family_members; drop trigger if exists fm_sync_profile_del on public.family_members; create trigger fm_sync_profile_ins after insert on public.family_members for each row execute function public.sync_profile_family_id(); create trigger fm_sync_profile_del after delete on public.family_members for each row execute function public.sync_profile_family_id();

-- security definer itu wajib, bukan gaya penulisan. Trigger ini jalan dengan
-- hak pengguna yang memicu barisnya (anggota family), sementara policy update
-- di family_missions hanya membuka owner. Tanpa security definer, UPDATE di
-- dalam trigger kena filter RLS dan diam-diam mengubah 0 baris: kontribusi
-- anggota biasa tetap tercatat, tapi current tidak pernah naik dan misi tidak
-- pernah jadi completed. search_path dikunci supaya fungsi ini tidak bisa
-- dipanggil lewat objek milik schema lain.
create or replace function public.update_family_mission_progress() returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  total integer;
  tgt integer;
  sid uuid;
begin
  sid := coalesce(new.mission_id, old.mission_id);

  select coalesce(sum(c.value), 0), fm.target
    into total, tgt
    from public.family_mission_contributions c
    join public.family_missions fm on fm.id = c.mission_id
   where fm.id = sid
   group by fm.target;

  if total is null then
    total := 0;
  end if;
  if tgt is null then
    select target into tgt from public.family_missions where id = sid;
  end if;

  update public.family_missions fm set current = total where fm.id = sid;

  -- Misi yang totalnya menyentuh target jadi completed, dan sebaliknya saat
  -- total turun lagi (owner menghapus salah satu kontribusi) statusnya balik
  -- active.
  if tgt is not null and total >= tgt
     and exists (select 1 from public.family_missions fm2 where fm2.id = sid and fm2.status <> 'completed') then
    update public.family_missions fm
       set status = 'completed', completed_at = now()
     where fm.id = sid;
  end if;

  if tgt is not null and total < tgt
     and exists (select 1 from public.family_missions fm2 where fm2.id = sid and fm2.status = 'completed') then
    update public.family_missions fm
       set status = 'active', completed_at = null
     where fm.id = sid;
  end if;

  return coalesce(new, old);
end;
$$;
drop trigger if exists fmc_update_progress_ins on public.family_mission_contributions; drop trigger if exists fmc_update_progress_del on public.family_mission_contributions; create trigger fmc_update_progress_ins after insert on public.family_mission_contributions for each row execute function public.update_family_mission_progress(); create trigger fmc_update_progress_del after delete on public.family_mission_contributions for each row execute function public.update_family_mission_progress();

-- Batas atas target dan nilai kontribusi. Tanpa ini owner bisa membuat misi
-- dengan target 100000 lalu menambah kontribusi sendiri berulang kali; setiap
-- kontribusi bernilai poin, jadi target adalah batas atas poin dari satu misi.
alter table public.family_missions drop constraint if exists family_missions_target_range;
alter table public.family_missions add constraint family_missions_target_range check (target > 0 and target <= 200);
alter table public.family_mission_contributions drop constraint if exists fmc_value_range;
alter table public.family_mission_contributions add constraint fmc_value_range check (value > 0 and value <= 50);

-- Batas kontribusi per hari. Dihitung dari baris yang dibuat hari ini, bukan
-- dari state di profiles, jadi tidak ada kolom baru yang harus disinkronkan
-- setiap kali kuota terpakai. 5 kontribusi per hari => maksimal 25 poin dari
-- misi keluarga per hari.
drop policy if exists "fmc insert member" on public.family_mission_contributions;
create policy "fmc insert member" on public.family_mission_contributions
  for insert with check (
    user_id = auth.uid()
    and exists (select 1 from public.family_members m join public.family_missions fm on fm.id = family_mission_contributions.mission_id where m.family_id = fm.family_id and m.user_id = auth.uid())
    and not exists (select 1 from public.family_missions fm2 where fm2.id = family_mission_contributions.mission_id and fm2.status = 'completed')
    and (select count(*) from public.family_mission_contributions c where c.user_id = auth.uid() and c.created_at >= date_trunc('day', now())) < 5
  );

-- Klien tidak bisa membuat family lewat insert biasa: RLS hanya mengizinkan
-- owner yang menambah anggota, dan kode undangan harus dibuat di dalam
-- database. Fungsi security definer juga satu-satunya cara membaca kode
-- undangan family yang belum dimasuki orang, karena policy select hanya
-- membuka baris family yang sudah dimasuki.
create or replace function public.create_family(p_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text := trim(coalesce(p_name, ''));
  v_id uuid;
  v_code text;
begin
  if char_length(v_name) < 1 or char_length(v_name) > 64 then
    raise exception 'Nama family tidak valid.';
  end if;
  if exists (select 1 from public.family_members where user_id = auth.uid()) then
    raise exception 'Kamu sudah punya family.';
  end if;
  v_code := public.generate_invite_code();
  insert into public.families (name, owner_id, invite_code)
  values (v_name, auth.uid(), v_code)
  returning id into v_id;
  insert into public.family_members (family_id, user_id, role)
  values (v_id, auth.uid(), 'owner');
  return v_id;
end;
$$;

create or replace function public.join_family(p_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  select f.id into v_id from public.families f
   where f.invite_code = upper(trim(coalesce(p_code, '')));
  if v_id is null then
    raise exception 'Kode undangan tidak ditemukan.';
  end if;
  if exists (select 1 from public.family_members where user_id = auth.uid()) then
    raise exception 'Kamu sudah punya family.';
  end if;
  if (select count(*) from public.family_members m where m.family_id = v_id) >= public.family_max_members() then
    raise exception 'Family sudah penuh.';
  end if;
  insert into public.family_members (family_id, user_id, role)
  values (v_id, auth.uid(), 'member')
  on conflict do nothing;
  return v_id;
end;
$$;

revoke all on function public.create_family(text) from public;
revoke all on function public.join_family(text) from public;
grant execute on function public.create_family(text) to authenticated;
grant execute on function public.join_family(text) to authenticated;

-- Daftar anggota untuk kolom profil rekan satu family. Policy "profiles select
-- own" hanya membuka baris milik sendiri, padahal roster justru perlu nama dan
-- foto rekan. View memakai pola yang sama seperti leaderboard
-- (security_invoker = false), lalu dibatasi hanya family milik pemanggil
-- supaya tidak jadi daftar global semua keluarga yang ada.
create or replace view public.family_roster
with (security_invoker = false)
as
  select m.family_id,
         m.user_id,
         m.role,
         m.joined_at,
         p.name,
         p.avatar_url,
         p.points,
         p.streak
    from public.family_members m
    join public.profiles p on p.id = m.user_id
   where exists (
     select 1 from public.family_members me
      where me.family_id = m.family_id and me.user_id = auth.uid()
   );

revoke all on public.family_roster from anon;
grant select on public.family_roster to authenticated;
