import { useEffect, useRef, useState } from "react";

import Avatar from "../components/Avatar";
import Glyph from "../lib/glyphs";
import { useApp } from "../context/AppContext";
import { useI18n } from "../lib/i18n";
import { levelName } from "../lib/util";

const MAX_BYTES = 2 * 1024 * 1024;
const OK_TYPES = ["image/png", "image/jpeg", "image/webp"];

export default function Profile() {
  const { user, demo, run, logout, showToast, service } = useApp();
  const { t, content, lang, setLang } = useI18n();

  const [name, setName] = useState("");
  const [editing, setEditing] = useState(false);
  // undefined = belum ada perubahan, { file, preview } = foto baru, null = hapus foto
  const [photo, setPhoto] = useState(undefined);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    if (!editing && user?.name) setName(user.name);
  }, [user?.name, editing]);

  useEffect(() => () => {
    if (photo && photo.preview) URL.revokeObjectURL(photo.preview);
  }, [photo]);

  if (!user) return null;

  const reset = async () => {
    if (!confirm(t("pf.resetConfirm"))) return;
    const res = await run((s) => s.reset());
    if (res.ok) showToast(t("toast.reset"));
  };

  const owned = new Set(user.badges || []);
  const avatarPreview = photo === undefined ? user.avatarUrl : photo === null ? null : photo.preview;

  const pickPhoto = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!OK_TYPES.includes(file.type)) {
      showToast(t("pf.photoBadType"));
      return;
    }
    if (file.size > MAX_BYTES) {
      showToast(t("pf.photoTooBig"));
      return;
    }
    if (photo && photo.preview) URL.revokeObjectURL(photo.preview);
    setPhoto({ file, preview: URL.createObjectURL(file) });
    setEditing(true);
  };

  const dropPhoto = () => {
    if (photo && photo.preview) URL.revokeObjectURL(photo.preview);
    setPhoto(null);
    setEditing(true);
  };

  const save = async () => {
    const clean = name.trim();
    if (!clean) {
      showToast(t("pf.needName"));
      return;
    }
    if (clean.length > 40) {
      showToast(t("pf.nameTooLong"));
      return;
    }
    setBusy(true);
    try {
      let avatarUrl;
      if (photo && photo.file) {
        showToast(t("pf.photoUploading"));
        avatarUrl = await service.uploadAvatar(photo.file);
      } else if (photo === null) {
        avatarUrl = "";
      }
      const res = await run((s) => s.updateIdentity({ name: clean, avatarUrl }));
      if (!res.ok) return;
      setPhoto(undefined);
      setEditing(false);
      showToast(t("pf.saved"));
    } catch {
      showToast(t("toast.error"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <h1 className="page-title">{t("nav.profile")}</h1>

      <div className="card profile-card">
        <Avatar user={{ ...user, avatarUrl: avatarPreview }} size="lg" />
        <div>
          <p className="profile-name">{user.name}</p>
          <p className="muted small">{t(levelName(user.points))}</p>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">{t("pf.editIdentity")}</h3>

        <label className="field">
          <span className="small">{t("pf.nameLabel")}</span>
          <input
            type="text"
            value={name}
            maxLength={40}
            placeholder={t("pf.namePlaceholder")}
            onChange={(e) => {
              setName(e.target.value);
              setEditing(true);
            }}
          />
        </label>

        <div className="field">
          <span className="small">{t("pf.photoLabel")}</span>
          <div className="photo-row">
            <Avatar user={{ ...user, avatarUrl: avatarPreview }} size="lg" />
            <div className="photo-actions">
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={pickPhoto}
                hidden
              />
              <button className="btn btn-outline" onClick={() => fileRef.current?.click()}>
                {t("pf.changePhoto")}
              </button>
              {avatarPreview && (
                <button className="btn btn-light" onClick={dropPhoto}>
                  {t("pf.removePhoto")}
                </button>
              )}
              <p className="muted small">{t("pf.photoHint")}</p>
            </div>
          </div>
        </div>

        <button className="btn btn-primary" disabled={busy || !editing} onClick={save}>
          {t("pf.save")}
        </button>
      </div>

      <div className="stat-row">
        <div className="stat">
          <span className="stat-num">{user.streak}</span>
          <span className="stat-lab">{t("pf.streak")}</span>
        </div>
        <div className="stat">
          <span className="stat-num">{user.challengesDone || 0}</span>
          <span className="stat-lab">{t("pf.challenge")}</span>
        </div>
        <div className="stat">
          <span className="stat-num">{user.points}</span>
          <span className="stat-lab">{t("pf.points")}</span>
        </div>
      </div>

      <h3 className="section-title">{t("pf.badges")}</h3>
      <div className="badge-grid">
        {content.BADGES.map((b) => (
          <div key={b.id} className={"badge" + (owned.has(b.id) ? "" : " locked")}>
            <span className="badge-ico">
              <Glyph name={b.icon} size={20} />
            </span>
            {b.name}
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="card-title">{t("pf.data")}</h3>
        <p className="muted small">
          {demo ? t("pf.demoNote") : t("pf.liveNote")}
        </p>
        <div className="lang-row">
          <span>{t("pf.language")}</span>
          <div className="lang-switch inline">
            {(["id", "en"]).map((l) => (
              <button
                key={l}
                className={"lang-btn" + (lang === l ? " on" : "")}
                onClick={() => setLang(l)}
              >
                {l === "id" ? "ID" : "EN"}
              </button>
            ))}
          </div>
        </div>
        {demo && (
          <button className="btn btn-outline" onClick={reset}>
            {t("pf.resetBtn")}
          </button>
        )}
        <button className="btn btn-light" onClick={logout}>
          {t("pf.logout")}
        </button>
      </div>
    </>
  );
}
