import { useEffect, useState } from "react";

import { useApp } from "../../context/AppContext";
import { useI18n } from "../../lib/i18n";
import { CHALLENGES } from "../../lib/data";

const KINDS = ["video", "read", "quiz", "practice"];
const DIMS = ["saving", "spending", "decision", "goal", "risk"];

const EMPTY = {
  kind: "practice",
  title: "",
  desc: "",
  source: "",
  url: "",
  steps: ["", "", ""],
  minutes: 10,
  points: 20,
  dim: "goal",
  active: true,
  position: 0
};

/**
 * CRUD challenge buatan admin. Challenge bawaan (data.js) tidak bisa diubah
 * dari sini, jadi yang tampil di bawah hanya yang dibuat lewat dashboard.
 */
export default function Challenges() {
  const { run, showToast, reloadChallenges } = useApp();
  const { t } = useI18n();
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = () =>
    run(async (s) => {
      const r = await Promise.allSettled([s.adminChallenges()]);
      setRows(r[0].status === "fulfilled" ? r[0].value || [] : []);
      setLoading(false);
      return null;
    });

  useEffect(() => {
    load();
  }, []);

  const setStep = (i, v) => setForm((f) => ({ ...f, steps: f.steps.map((s, x) => (x === i ? v : s)) }));

  const validate = () => {
    if (form.title.trim().length < 3) return t("chErr.title");
    if (!form.steps.some((s) => s.trim())) return t("chErr.steps");
    if (form.url && !/^https:\/\//.test(form.url)) return t("chErr.url");
    return "";
  };

  const reset = () => {
    setForm(EMPTY);
    setEditingId(null);
    setErr("");
  };

  const save = async () => {
    const msg = validate();
    setErr(msg);
    if (msg) return;

    const body = { ...form, steps: form.steps.map((s) => s.trim()).filter(Boolean) };
    const res = editingId
      ? await run((s) => s.adminUpdateChallenge({ id: editingId, ...body }))
      : await run((s) => s.adminAddChallenge(body));

    if (!res.ok) return;
    showToast(t(editingId ? "chErr.saved" : "chErr.created"));
    reset();
    await load();
    await reloadChallenges();
  };

  const edit = (c) => {
    setEditingId(c.id);
    setErr("");
    setForm({
      kind: c.kind,
      title: c.title,
      desc: c.desc,
      source: c.source,
      url: c.url,
      steps: c.steps?.length ? c.steps : ["", "", ""],
      minutes: c.min,
      points: c.pts,
      dim: c.dim,
      active: c.active !== false,
      position: c.position || 0
    });
    window.scrollTo({ top: 0 });
  };

  const toggleActive = async (c) => {
    // Hanya kirim active. Dulu objek challenge utuh diteruskan, dan karena
    // bentuknya beda dengan bentuk form, minutes dan points ikut ditulis ulang
    // jadi nilai default 5/20 setiap kali challenge dinyalakan atau dimatikan.
    const res = await run((s) => s.adminUpdateChallenge({ id: c.id, active: !c.active }));
    if (res.ok) {
      await load();
      await reloadChallenges();
    }
  };

  const remove = async (c) => {
    if (!confirm(t("chErr.delete") + "?")) return;
    const res = await run((s) => s.adminDeleteChallenge({ id: c.id }));
    if (res.ok) {
      showToast(t("chErr.deleted"));
      if (editingId === c.id) reset();
      await load();
      await reloadChallenges();
    }
  };

  return (
    <>
      <section className="admin-section">
        <div className="row-between">
          <h2 className="section-title">{t("ad.challenges")}</h2>
          <span className="small muted">
            {rows.length} {t("ch.custom")} · {CHALLENGES.length} {t("ch.builtin")}
          </span>
        </div>
        <p className="muted small">{t("ch.crSub")}</p>

        <div className="card admin-detail-card">
          {err && (
            <p className="form-error" role="alert">
              {err}
            </p>
          )}

          <div className="form-grid">
            <label className="field">
              <span>{t("ch.form.kind")}</span>
              <select value={form.kind} onChange={(e) => setForm((f) => ({ ...f, kind: e.target.value }))}>
                {KINDS.map((k) => (
                  <option key={k} value={k}>
                    {t("ch.kind." + k)}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>{t("ch.form.dim")}</span>
              <select value={form.dim} onChange={(e) => setForm((f) => ({ ...f, dim: e.target.value }))}>
                {DIMS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="field">
            <span>{t("ch.form.title")}</span>
            <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </label>

          <label className="field">
            <span>{t("ch.form.desc")}</span>
            <textarea rows={2} value={form.desc} onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))} />
          </label>

          <div className="form-grid">
            <label className="field">
              <span>{t("ch.form.source")}</span>
              <input
                type="text"
                value={form.source}
                onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
              />
            </label>
            <label className="field">
              <span>{t("ch.form.url")}</span>
              <input
                type="text"
                value={form.url}
                placeholder="https://..."
                onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              />
            </label>
          </div>

          <label className="field">
            <span>{t("ch.form.steps")}</span>
            <div className="step-editor">
              {form.steps.map((s, i) => (
                <input
                  key={i}
                  type="text"
                  value={s}
                  placeholder={t("ch.form.stepN", { n: i + 1 })}
                  onChange={(e) => setStep(i, e.target.value)}
                />
              ))}
              {form.steps.length < 8 && (
                <button className="btn btn-outline small-btn" onClick={() => setForm((f) => ({ ...f, steps: [...f.steps, ""] }))}>
                  + {t("ch.form.addStep")}
                </button>
              )}
            </div>
          </label>

          <div className="form-grid">
            <label className="field">
              <span>{t("ch.form.minutes")}</span>
              <input
                type="number"
                min="1"
                max="240"
                value={form.minutes}
                onChange={(e) => setForm((f) => ({ ...f, minutes: Number(e.target.value) || 5 }))}
              />
            </label>
            <label className="field">
              <span>{t("ch.form.points")}</span>
              <input
                type="number"
                min="5"
                max="200"
                value={form.points}
                onChange={(e) => setForm((f) => ({ ...f, points: Number(e.target.value) || 20 }))}
              />
            </label>
            <label className="field">
              <span>{t("ch.form.position")}</span>
              <input
                type="number"
                min="0"
                value={form.position}
                onChange={(e) => setForm((f) => ({ ...f, position: Number(e.target.value) || 0 }))}
              />
            </label>
          </div>

          <div className="row-between">
            <button className="btn btn-primary" onClick={save}>
              {editingId ? t("ch.form.saveEdit") : t("ch.form.create")}
            </button>
            {editingId && (
              <button className="btn btn-outline" onClick={reset}>
                {t("ch.form.cancel")}
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="admin-section">
        <h3 className="section-title">{t("ch.customList")}</h3>
        {loading && <p className="muted small">{t("common.loading")}</p>}
        {!loading && rows.length === 0 && <p className="muted small">{t("ch.noCustom")}</p>}

        <div className="grid-2">
          {rows.map((c) => (
            <div key={c.id} className={"mini-card admin-challenge-card" + (c.active ? "" : " is-off")}>
              <div>
                <p className="mini-title">{c.title}</p>
                <p className="mini-meta">
                  {t("ch.kind." + c.kind)} · {c.dim} · {c.min} {t("common.minutes")} · +{c.pts} {t("common.points")}
                </p>
              </div>
              <div className="row-actions">
                <span className={"tag" + (c.active ? " admin" : "")}>
                  {c.active ? t("ch.active") : t("ch.inactive")}
                </span>
                <button className="btn btn-outline small-btn" onClick={() => edit(c)}>
                  {t("common.edit")}
                </button>
                <button className="btn btn-outline small-btn" onClick={() => toggleActive(c)}>
                  {c.active ? t("ch.deactivate") : t("ch.activate")}
                </button>
                <button className="btn btn-outline small-btn danger" onClick={() => remove(c)}>
                  {t("common.delete")}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
