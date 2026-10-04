-- =============================================================================
-- MIGRASI 14 - Perbaikan append array di clamp_gameplay_columns()
-- =============================================================================
-- Jalankan di Supabase SQL Editor, SETELAH MIGRASI 13.
--
-- Gejala
-- ------
-- Menyimpan profil gagal dengan error berikut.
--
--   ERROR: 22P02: malformed array literal: "lessons_done"
--
-- Penyebab
-- --------
-- c_fields di clamp_gameplay_columns() bertipe text[], lalu di-append
-- dengan string polos: c_fields || 'lessons_done'. Postgres membaca operand
-- kanan sebagai array literal, bukan sebagai satu elemen, jadi setiap append
-- melempar error 22P02.
--
-- Dampak
-- ------
-- Baris yang melempar error hanya tercapai ketika clamp benar-benar memotong
-- nilai. Jadi justru saat berhasil bekerja, penyimpanan yang gagal. Yang
-- rusak di antara lain:
--
--   - user mendapat lencana pertama, atau urutan lencana tidak kanonik
--   - user menyelesaikan materi, jadi urutan lessons_done berubah
--   - poin user melebihi jatah harian
--   - saving_current tidak sama dengan jumlah transaksi
--
-- Semua itu membuat satu UPDATE profiles ditolak seluruhnya. Bukan nilai yang
-- dikoreksi dengan rapi, tapi progres yang hilang.
--
-- Perbaikan
-- ---------
-- Enam baris diubah dari c_fields || 'x' menjadi c_fields || ARRAY['x'].
-- Perilaku lain tidak diubah: nilai, urutan, dan ambang clamp tetap sama.
--
-- Fungsi di-replace utuh, bukan ditambah trigger baru. Trigger yang sudah
-- terpasang menunjuk fungsi ini lewat nama, dan create or replace mempertahankan
-- OID, jadi trigger langsung memakai badan yang baru.
-- =============================================================================
create or replace function public.clamp_gameplay_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  c_today      date    := current_date;
  c_last       date;
  c_days       int;
  c_allowance  int;
  c_cap        int;
  c_want       int;
  c_balance    numeric := 0;
  c_fields     text[]  := '{}';
  c_before     jsonb   := '{}';
  c_after      jsonb   := '{}';
  c_dims       jsonb;
  c_ids        jsonb;
  c_item       text;
  c_out        jsonb   := '[]'::jsonb;
begin
  -- Admin boleh mengubah apa saja lewat halaman admin.
  if public.is_admin() then
    return new;
  end if;

  -- 2.1 last_active_day jadi acuan jatah harian, jadi tidak boleh dimundurkan
  -- untuk mengumpulkan jatah baru setiap kali menyimpan.
  -- Perbandingan memakai TEKS, bukan "::date". Format "YYYY-MM-DD" yang lolos
  -- regex di bawah selalu nol-padded, jadi urutan string identik dengan urutan
  -- tanggal. Casting ke date bisa melempar error untuk kalender palsu seperti
  -- '2024-02-31' (lolos regex, tidak ada di kalender) dan error itu akan
  -- menggagalkan seluruh penyimpanan progres pengguna tersebut.
  if new.last_active_day is null
     or new.last_active_day !~ '^\d{4}-\d{2}-\d{2}$'
     or new.last_active_day > c_today::text
     or new.last_active_day < (c_today - 1)::text then
    new.last_active_day := c_today::text;
  end if;

  -- Diturunkan dari versi LAMA. to_date dipakai di sini hanya untuk pengurangan
  -- tanggal, jadi round-trip plus blok exception menutup kemungkinan to_date
  -- melempar error pada data lama yang rusak.
  c_last := c_today;
  begin
    if old.last_active_day ~ '^\d{4}-\d{2}-\d{2}$'
       and to_char(to_date(old.last_active_day, 'YYYY-MM-DD'), 'YYYY-MM-DD')
           = old.last_active_day then
      c_last := to_date(old.last_active_day, 'YYYY-MM-DD');
    end if;
  exception when others then
    c_last := c_today;
  end;

  -- 2.2 Poin. Boleh turun karena jawaban salah mengurangi poin, tapi tidak ke
  -- bawah nol, dan boleh naik hanya sebesar jatah harian. Jatah dihitung dari
  -- last_active_day versi LAMA, jadi memundurkan tanggal tidak menambah jatah.
  -- "is distinct from" dipakai, bukan "<>", karena menyetel points jadi null
  -- membuat perbandingan bernilai null yang berarti false, sehingga clamp
  -- dilewati. Postgres mengurutkan null paling depan pada "order by points
  -- desc", jadi points null akan menempel di puncak papan skor publik.
  c_days := greatest(1, least(7, c_today - least(c_last, c_today)));
  c_allowance := 600 * c_days;
  c_cap := greatest(coalesce(old.points, 0), 0) + c_allowance;
  c_want := greatest(coalesce(new.points, 0), 0);
  if new.points is distinct from least(c_want, c_cap) then
    c_fields := c_fields || ARRAY['points'];
    c_before := c_before || jsonb_build_object('points', old.points);
    new.points := least(c_want, c_cap);
    c_after := c_after || jsonb_build_object('points', new.points);
  end if;

  -- 2.3 Streak tidak bisa melebihi jumlah hari sejak akun dibuat. Alasan
  -- memakai "is distinct from" sama seperti poin di atas.
  c_cap := (c_today - old.created_at::date) + 1;
  c_want := greatest(coalesce(new.streak, 0), 0);
  if new.streak is distinct from least(c_want, c_cap) then
    c_fields := c_fields || ARRAY['streak'];
    c_before := c_before || jsonb_build_object('streak', old.streak);
    new.streak := least(c_want, c_cap);
    c_after := c_after || jsonb_build_object('streak', new.streak);
  end if;

  -- 2.4 Dimensi hanya boleh lima kunci yang dikenal, masing-masing 0-100.
  -- CASE dipakai agar cast ke integer tidak meledak saat nilainya bukan angka.
  c_dims := coalesce(new.dims, '{}'::jsonb);
  new.dims := jsonb_build_object(
    'saving',   case when c_dims->>'saving'   ~ '^\d+$' then least(100, (c_dims->>'saving')::int)   else 0 end,
    'spending', case when c_dims->>'spending' ~ '^\d+$' then least(100, (c_dims->>'spending')::int) else 0 end,
    'decision', case when c_dims->>'decision' ~ '^\d+$' then least(100, (c_dims->>'decision')::int) else 0 end,
    'goal',     case when c_dims->>'goal'     ~ '^\d+$' then least(100, (c_dims->>'goal')::int)     else 0 end,
    'risk',     case when c_dims->>'risk'     ~ '^\d+$' then least(100, (c_dims->>'risk')::int)     else 0 end
  );
  if new.dims is distinct from old.dims then
    c_fields := c_fields || ARRAY['dims'];
    c_before := c_before || jsonb_build_object('dims', old.dims);
    c_after := c_after || jsonb_build_object('dims', new.dims);
  end if;

  -- 2.5 Lencana disaring ke daftar yang sah dan duplikat dibuang. Tidak perlu
  -- dihitung ulang dari sini: syarat setiap lencana (streak >= 7, points >= 1000,
  -- dan seterusnya) sudah dibatasi oleh clamp di atas, jadi lencana tidak lagi
  -- bisa diambil tanpa points atau streak palsu.
  -- "smart-saver" tetap dipertahankan supaya urutan tampilan tidak berubah,
  -- memang unlockBadges di rewards.js tidak pernah memunculkannya.
  c_ids := case when jsonb_typeof(new.badges) = 'array' then new.badges else '[]'::jsonb end;
  c_out := '[]'::jsonb;
  for c_item in select jsonb_array_elements_text(c_ids) loop
    if c_item in ('first-saver','streak-7','smart-saver','tracker','scholar','decider','family-hero')
       and not (c_out @> to_jsonb(c_item)) then
      c_out := c_out || to_jsonb(c_item);
    end if;
  end loop;
  new.badges := (
    select coalesce(jsonb_agg(b order by p.ord), '[]'::jsonb)
    from jsonb_array_elements_text(c_out) b
    join (values ('first-saver',1),('streak-7',2),('smart-saver',3),
                 ('tracker',4),('scholar',5),('decider',6),('family-hero',7))
         as p(name, ord) on p.name = b
  );
  if new.badges is distinct from old.badges then
    c_fields := c_fields || ARRAY['badges'];
    c_before := c_before || jsonb_build_object('badges', old.badges);
    c_after := c_after || jsonb_build_object('badges', new.badges);
  end if;

  -- 2.6 Materi yang selesai hanya boleh 15 id yang dikenal, sesuai topicOf()
  -- di rewards.js. Sekalian mencegah jsonb dipakai menyimpan data sampah.
  c_ids := case when jsonb_typeof(new.lessons_done) = 'array' then new.lessons_done else '[]'::jsonb end;
  new.lessons_done := (
    select coalesce(jsonb_agg(d order by p.ord), '[]'::jsonb)
    from jsonb_array_elements_text(c_ids) d
    join (values ('sav1',1),('sav2',2),('sav3',3),('sp1',4),('sp2',5),('sp3',6),
                 ('bd1',7),('bd2',8),('bd3',9),('gl1',10),('gl2',11),('gl3',12),
                 ('rs1',13),('rs2',14),('rs3',15))
         as p(name, ord) on p.name = d
  );
  if new.lessons_done is distinct from old.lessons_done then
    c_fields := c_fields || ARRAY['lessons_done'];
    c_before := c_before || jsonb_build_object('lessons_done', old.lessons_done);
    c_after := c_after || jsonb_build_object('lessons_done', new.lessons_done);
  end if;

  -- 2.7 Array lain yang isinya berasal dari konten statis di repo. Id tidak
  -- disaring terhadap tabel challenges karena klien memakai id dari
  -- content.CHALLENGES sebagai fallback saat tabelnya kosong, dan penyaringan
  -- akan menghapus progres itu. Yang dijaga hanya bentuk dan panjangnya.
  if jsonb_typeof(new.done_challenges) <> 'array' then
    new.done_challenges := '[]'::jsonb;
  elsif jsonb_array_length(new.done_challenges) > 200 then
    new.done_challenges := (new.done_challenges)[1:200];
  end if;

  if jsonb_typeof(new.done_missions) <> 'array' then
    new.done_missions := '[]'::jsonb;
  elsif jsonb_array_length(new.done_missions) > 200 then
    new.done_missions := (new.done_missions)[1:200];
  end if;

  if jsonb_typeof(new.challenge_categories) <> 'array' then
    new.challenge_categories := '[]'::jsonb;
  elsif jsonb_array_length(new.challenge_categories) > 50 then
    new.challenge_categories := (new.challenge_categories)[1:50];
  end if;

  if jsonb_typeof(new.challenge_reflections) <> 'array' then
    new.challenge_reflections := '[]'::jsonb;
  elsif jsonb_array_length(new.challenge_reflections) > 200 then
    new.challenge_reflections := (new.challenge_reflections)[1:200];
  end if;

  -- 2.8 Penghitung harian dan mingguan dibatasi supaya tidak jadi tempat
  -- menyembunyikan angka.
  new.today_done := least(greatest(new.today_done, 0), 1000);
  new.today_total := least(greatest(new.today_total, 0), 1000);
  new.last_week := least(greatest(new.last_week, 0), 100);
  new.case_index := least(greatest(new.case_index, 0), 100000);
  new.challenges_done := least(greatest(new.challenges_done, 0), 100000);
  new.monthly_budget := least(greatest(new.monthly_budget, 0), 1000000000);

  -- 2.9 Grafik mingguan: maksimal 52 minggu.
  if jsonb_typeof(new.weekly) <> 'array' then
    new.weekly := '[0,0,0,0,0,0,0]'::jsonb;
  elsif jsonb_array_length(new.weekly) > 52 then
    new.weekly := (new.weekly)[1:52];
  end if;

  -- 2.10 Saldo tidak dihitung di kolom ini. Nilainya disalin dari jumlah
  -- transaksi supaya tidak bisa dipalsukan, dan kebetulan jadi benar untuk
  -- pembaca lama. Dilewatkan kalau MIGRASI 10 belum dijalankan.
  if to_regclass('public.saving_transactions') is not null then
    select coalesce(sum(case when t.kind = 'income' then t.amount else -t.amount end), 0)
      into c_balance
    from public.saving_transactions t
    where t.user_id = new.id;

    if new.saving_current is distinct from c_balance then
      c_fields := c_fields || ARRAY['saving_current'];
      c_before := c_before || jsonb_build_object('saving_current', old.saving_current);
      new.saving_current := c_balance;
      c_after := c_after || jsonb_build_object('saving_current', new.saving_current);
    end if;
  end if;

  -- 2.11 Catat kalau ada yang benar-benar dipotong. Kegagalan menulis audit
  -- tidak boleh menggagalkan penyimpanan progres.
  if cardinality(c_fields) > 0 then
    begin
      insert into public.integrity_events (user_id, fields, before_vals, after_vals)
      values (new.id, c_fields, c_before, c_after);
    exception when others then
      null;
    end;
  end if;

  return new;
end;
$$;

