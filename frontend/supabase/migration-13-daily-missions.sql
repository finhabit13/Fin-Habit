-- =============================================================================
-- MIGRASI 13 - Misi keluarga harian
-- =============================================================================
-- Jalankan di Supabase SQL Editor, SETELAH MIGRASI 12.
--
-- Latar belakang
-- --------------
-- Misi keluarga sebelumnya disimpan sebagai satu daftar permanen di
-- profiles.done_missions, dan completeMission() menolak id yang sudah ada di
-- daftar itu. Itu benar selama setiap misi hanya bisa dikerjakan sekali.
--
-- Begitu misi diacak ulang tiap hari, pola itu justru jadi penghalang. Begitu
-- semua misi pernah selesai, tidak ada lagi yang bisa dikerjakan, dan halaman
-- Misi Keluarga akan menampilkan "sudah selesai" untuk semua misi selamanya.
--
-- Yang ditambahkan
-- ----------------
-- Kolom mission_log: objek yang memetakan id misi ke tanggal terakhir misi itu
-- selesai. Bentuknya disengaja seperti ini, bukan daftar, supaya ukurannya
-- tidak tumbuh tanpa batas. Satu kunci per misi, jadi sebesar jumlah misi yang
-- ada, bukan sebesar jumlah hari yang pernah dilalui.
--
-- Tidak ada kolom hari undian karena undiannya dihitung ulang dari tanggal di
-- src/lib/util.js dailyMissions(), bukan dibaca dari database.
--
-- Bentuk mission_log: {"m1": "2026-10-03", "m7": "2026-10-03"}
-- =============================================================================

alter table public.profiles
  add column if not exists mission_log jsonb not null default '{}'::jsonb;

-- -----------------------------------------------------------------------------
-- Clamp mission_log
-- -----------------------------------------------------------------------------
-- Trigger terpisah, bukan tambahan di dalam clamp_gameplay_columns() milik
-- MIGRASI 11. Keduanya mengatur kolom yang tidak sama, dan menyalin ulang
-- fungsi yang sudah ratusan baris hanya untuk menambah satu kolom membuat
-- file ini rapuh: perubahan MIGRASI 11 di masa depan tidak ikut terbawa.
create or replace function public.clamp_mission_log()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  c_out  jsonb := '{}'::jsonb;
  c_key  text;
  c_val  text;
  c_known text[] := array[
    'm1','m2','m3','m4','m5','m6',
    'm7','m8','m9','m10','m11','m12'
  ];
begin
  -- Admin bebas, sama seperti trigger MIGRASI 11.
  if public.is_admin() then
    return new;
  end if;

  -- Bentuk object adalah bentuk yang diharapkan. jsonb_each_text() pada array
  -- atau string akan melempar error, jadi bentuk dicek lebih dulu.
  if jsonb_typeof(new.mission_log) <> 'object' then
    new.mission_log := '{}'::jsonb;
    return new;
  end if;

  -- Kunci di luar daftar misi dan nilai yang bukan tanggal YYYY-MM-DD dibuang.
  -- Kunci di luar daftar misi dan nilai yang bukan tanggal YYYY-MM-DD dibuang.
  -- Tanggal palsu tidak akan lolos karena nilainya dibuang, tapi seperti
  -- kolom gameplay lain, isinya tetap client-authoritative: hadiah masih
  for c_key, c_val in select k, v from jsonb_each_text(new.mission_log) loop
    if c_key = any(c_known) and c_val ~ '^\d{4}-\d{2}-\d{2}$' then
      c_out := c_out || jsonb_build_object(c_key, c_val);
    end if;
  end loop;

  new.mission_log := c_out;
  return new;
end;
$$;

drop trigger if exists profiles_clamp_mission_log on public.profiles;
create trigger profiles_clamp_mission_log
  before update on public.profiles
  for each row execute function public.clamp_mission_log();