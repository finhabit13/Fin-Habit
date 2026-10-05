import { useState } from "react";

import { useI18n } from "../../lib/i18n";
import { MAX_FAMILY_NAME, cleanFamilyName, cleanInviteCode } from "../../lib/family";

/**
 * Form di dalam modal untuk membuat family atau gabung ke family lain.
 *
 * Satu komponen untuk dua mode karena isinya sama-sama satu field: yang
 * membedakan hanya label, placeholder, dan cara memvalidasinya. Validasi
 * memakai helper yang sama dengan adapter (family.js), jadi pesan di dalam form
 * dan pesan dari backend tidak akan berbeda pendapat.
 *
 * Error ditampilkan di dalam form, bukan hanya lewat toast: toast hilang
 * sendiri, sementara input yang salah masih terisi di layar.
 */
export default function FamilyForm({ mode, submitLabel, busy, onSubmit }) {
  const { t } = useI18n();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  const join = mode === "join";

  const kirim = async (e) => {
    e.preventDefault();
    const cleaned = join ? cleanInviteCode(value) : cleanFamilyName(value);
    if (!cleaned.ok) {
      setError(t(cleaned.key));
      return;
    }
    setError("");
    await onSubmit(cleaned.value);
  };

  return (
    <form className="stack" onSubmit={kirim}>
      <label className="field">
        <span>{join ? t("fa.inviteCode") : t("fa.familyName")}</span>
        <input
          type="text"
          value={value}
          maxLength={join ? 6 : MAX_FAMILY_NAME}
          // Kode undangan hanya huruf kapital dan angka, jadi filter di sini
          // sudah cukup untuk mencegah salah ketik.
          autoCapitalize={join ? "characters" : "sentences"}
          autoComplete="off"
          spellCheck={false}
          onChange={(e) => {
            const next = join ? e.target.value.toUpperCase().replace(/[^0-9A-Z]/g, "") : e.target.value;
            setValue(next);
            if (error) setError("");
          }}
          placeholder={join ? t("fa.inviteCodePh") : t("fa.familyNamePh")}
          required
          autoFocus
        />
      </label>

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
