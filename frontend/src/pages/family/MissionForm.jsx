import { useState } from "react";

import { useI18n } from "../../lib/i18n";
import {
  MAX_MISSION_TARGET,
  MAX_MISSION_TITLE,
  cleanDescription,
  cleanMissionTarget,
  cleanMissionTitle
} from "../../lib/family";

/**
 * Form di dalam modal untuk membuat misi keluarga.
 *
 * Target adalah jumlah ceklis, bukan rupiah: misi ini berarti "berapa kali
 * family perlu melakukannya", jadi semua anggota berkontribusi dengan unit yang
 * sama. Batas maksimum target tetap ditulis ulang di sini supaya yang tampil
 * di bawah field tidak berbeda dengan check constraint di database.
 */
export default function MissionForm({ submitLabel, busy, onSubmit }) {
  const { t } = useI18n();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [target, setTarget] = useState("");
  const [error, setError] = useState("");

  const kirim = async (e) => {
    e.preventDefault();
    const judul = cleanMissionTitle(title);
    if (!judul.ok) {
      setError(t(judul.key));
      return;
    }
    const aim = cleanMissionTarget(target);
    if (!aim.ok) {
      setError(t(aim.key));
      return;
    }
    setError("");
    await onSubmit({
      title: judul.value,
      description: cleanDescription(description),
      target: aim.value
    });
  };

  return (
    <form className="stack" onSubmit={kirim}>
      <label className="field">
        <span>{t("fa.missionTitle")}</span>
        <input
          type="text"
          value={title}
          maxLength={MAX_MISSION_TITLE}
          onChange={(e) => {
            setTitle(e.target.value);
            if (error) setError("");
          }}
          required
          autoFocus
        />
      </label>

      <label className="field">
        <span>{t("fa.missionDesc")}</span>
        <textarea
          rows={3}
          value={description}
          maxLength={400}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("fa.missionDescPh")}
        />
      </label>

      <label className="field">
        <span>{t("fa.missionTarget")}</span>
        <input
          type="text"
          inputMode="numeric"
          value={target}
          aria-describedby="fa-target-hint"
          onChange={(e) => {
            setTarget(e.target.value.replace(/[^\d]/g, ""));
            if (error) setError("");
          }}
          placeholder={t("fa.missionTargetPh")}
          required
        />
      </label>
      {/* Petunjuk ini di luar <label> dengan sengaja: kalau masih di dalam,
          pembaca layar membacakan seluruh paragraf ini sebagai bagian dari
          nama field, jadi field-nya terdengar "Target kontribusi Target harus
          antara 1 dan 200". */}
      <p className="muted small" id="fa-target-hint">
        {t("fa.errTarget")} ({MAX_MISSION_TARGET})
      </p>

      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}

      <button className="btn btn-primary" type="submit" disabled={busy}>
        {submitLabel}
      </button>
    </form>
  );
}
