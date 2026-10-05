-- =============================================================================
-- MIGRASI 16 - Perbaikan select k, v dari jsonb_each_text() di clamp_mission_log()
-- =============================================================================
-- Jalankan di Supabase SQL Editor, SETELAH MIGRASI 15.
--
-- Gejala
-- ------
-- Menyimpan profil gagal, dan karena semua alur ini berakhir dengan update ke
-- profiles, semuanya gagal sekaligus:
--
--   ERROR: 42703: column "k" does not exist
--   QUERY:  select k, v from jsonb_each_text(new.mission_log)
--   CONTEXT: PL/pgSQL function clamp_mission_log() line 27 at FOR over SELECT rows
--
-- Di browser ini tampil sebagai HTTP 400 dari PostgREST, dan user hanya melihat
-- aksi yang tidak merespons: menyelesaikan challenge, menjawab kuis, dan
-- mengerjakan misi keluarga.
--
-- Penyebab
-- --------
-- jsonb_each_text() menghasilkan dua kolom bernama key dan value, bukan k dan
-- v. Postgrest tidak bisa menemukan kolom k di hasil fungsi tersebut, jadi
-- plpgsql menolak query itu.
--
-- Fungsi ini dibuat di MIGRASI 13, tapi tidak pernah berhasil diuji: trigger
-- profiles_clamp_mission_log baru menyala ketika mission_log berisi object.
-- Selama nilainya kosong atau null, trigger keluar lebih dulu di cek
-- jsonb_typeof, jadi jalur yang salah tidak pernah tersentuh.
--
-- Dampak
-- ------
-- profiles_clamp_mission_log adalah BEFORE UPDATE, jadi setiap update ke
-- profiles ditolak, tanpa kecuali. Bukan data yang jadi rusak: penulisan yang
-- gagal ditolak utuh, tidak ada yang tersimpan separuh.
--
-- Yang ikut mati selama bug ini aktif:
--
--   - Poin dan streak tidak bertambah untuk challenge, kuis, dan misi keluarga
--   - Urutan lencana dan lessons_done tidak bisa ikut diperbarui
--   - Misi harian tidak pernah tercatat selesai
--   - Reset profil dan ubah budget bulanan ikut gagal
--
-- Perbaikan
-- ---------
-- Fungsi didefinisikan ulang dengan select key, value. Trigger juga dilepas
-- dan dipasang ulang supaya pasti menunjuk ke definisi yang baru.
--
-- File ini idempoten dan boleh dijalankan berulang. MIGRASI 13 di repo juga
-- sudah diperbaiki, jadi instalasi baru tidak melewati bug ini sama sekali;
-- file ini hanya perlu untuk database yang sudah menjalankan MIGRASI 13
-- dengan versi lamanya.
-- =============================================================================

create or replace function public.clamp_mission_log()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  c_out    jsonb := '{}'::jsonb;
  c_key    text;
  c_val    text;
  c_known  text[] := array[
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
  -- Tanggal palsu tidak akan lolos karena nilainya dibuang, tapi seperti kolom
  -- gameplay lain, isinya tetap client-authoritative.
  for c_key, c_val in select key, value from jsonb_each_text(new.mission_log) loop
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

-- Verifikasi: update yang tidak mengubah nilai apa pun, tapi tetap memicu
-- kelima trigger di profiles. Kalau query ini berhasil, penulisan profil sudah
-- aman lagi.
--
--   update public.profiles
--      set points = points
--    where id = (select id from auth.users order by created_at limit 1);