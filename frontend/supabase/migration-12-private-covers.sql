-- =============================================================================
-- MIGRASI 12 - Bucket gambar tujuan jadi privat
-- =============================================================================
-- Jalankan di Supabase SQL Editor (Dashboard > SQL Editor), SETELAH MIGRASI 11.
-- File ini perlu dikirim bersama perubahan klien yang ada di repo. Bucket yang
-- sudah privat akan membuat URL publik lama mati, jadi jangan jalankan lebih
-- dulu sebelum klien baru ter-deploy.
--
-- Latar belakang
-- --------------
-- Bucket "saving-covers" dibuat public = true dan policy bacanya hanya
-- memeriksa bucket_id, tanpa syarat autentikasi. Foto tujuan yang sifatnya
-- personal jadi URL publik yang tidak bisa dicabut: begitu URL-nya bocor lewat
-- screenshot, riwayat browser, atau share, gambarnya terbuka selamanya.
--
-- Bucket "avatars" SENGAJA dibiarkan public. Avatar dipakai di papan skor
-- publik yang dibaca tanpa login, jadi membungkusnya dengan signed URL akan
-- membuat avatar tidak tampil untuk pengunjung. Nama dan URL avatar sudah
-- dibatasi update_identity() dan RLS, jadi risikonya jauh lebih kecil.
--
-- Yang berubah bagi klien
-- ----------------------
-- cover_url tidak lagi menyimpan URL absolut, tapi path relatif di dalam
-- bucket, misalnya "<user-id>/1712...-ab12cd.jpg". Klien menandatanganinya
-- dengan createSignedUrl() saat ditampilkan. Nilai lama berupa data URL
-- (mode demo) atau URL http tetap diteruskan apa adanya.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) Jadikan bucket privat
-- -----------------------------------------------------------------------------
update storage.buckets
   set public = false
 where id = 'saving-covers';

-- -----------------------------------------------------------------------------
-- 2) Batasi policy baca ke folder milik sendiri
-- -----------------------------------------------------------------------------
-- Sama seperti policy avatar: folder pertama pada path harus sama dengan id
-- user. Signed URL hanya bisa dibuat oleh policy select di bawah, jadi
-- createSignedUrl() dari sisi klien.
drop policy if exists "saving covers read" on storage.objects;
create policy "saving covers read" on storage.objects
  for select to authenticated
  using (bucket_id = 'saving-covers'
     and (storage.foldername(name))[1] = auth.uid()::text);

-- -----------------------------------------------------------------------------
-- 3) Ubah URL absolut yang sudah tersimpan menjadi path
-- -----------------------------------------------------------------------------
-- Record jumlah baris yang berubah supaya hasil migrasinya kelihatan di
-- Output SQL Editor. Baris yang URL-nya tidak cocok pola (misalnya gambar
-- eksternal) dibiarkan apa adanya.
do $$
declare
  v_changed integer;
begin
  update public.saving_goals
     set cover_url = nullif(
       regexp_replace(cover_url, '^.*?/object/public/saving-covers/', ''),
       ''
     )
   where cover_url is not null
     and cover_url ~ '^https?://.*/object/public/saving-covers/';

  get diagnostics v_changed = row_count;
  raise notice 'MIGRASI 12: % cover diubah dari URL publik menjadi path Storage.', v_changed;
end;
$$;

-- -----------------------------------------------------------------------------
-- 4) Bentuk nilai cover yang boleh disimpan
-- -----------------------------------------------------------------------------
-- Panjang dibatasi supaya kolom ini tidak dipakai menyimpan blob,
-- dan skema javascript: ditolak walau <img> modern tidak mengeksekusinya.
alter table public.saving_goals
  drop constraint if exists saving_goals_cover_shape;

alter table public.saving_goals
  add constraint saving_goals_cover_shape
  check (
    cover_url is null
    or (char_length(cover_url) between 1 and 200000
        and cover_url !~ '^\s*javascript:')
  );

-- -----------------------------------------------------------------------------
-- 5) Catatan Performanya
-- -----------------------------------------------------------------------------
-- Signed URL berlaku beberapa jam. Halaman Saving menandatanganinya ulang
-- setiap kali daftar goal dimuat, jadi cover yang basi tidak menggantung
-- permanen. Jangan menyimpan signed URL ke cover_url: begitu kedaluwarsa,
-- satu-satunya pemulihan adalah pengguna mengunggah ulang gambarnya.