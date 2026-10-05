import { useState } from "react";
import { ClipboardCopy, UserMinus, Users } from "lucide-react";

import Avatar from "../../components/Avatar";
import Glyph from "../../lib/glyphs";
import Meter from "../../components/Meter";
import FamilyForm from "./FamilyForm";
import MissionForm from "./MissionForm";
import { useApp } from "../../context/AppContext";
import { useI18n } from "../../lib/i18n";
import {
  MAX_DAILY_CONTRIBUTIONS,
  canContribute,
  contributorTally,
  contributionsToday,
  missionProgress
} from "../../lib/family";
import { formatThousands } from "../../lib/money";
import { todayKey } from "../../lib/util";

// Batas anggota ini juga ada di migration 15 sebagai family_max_members(),
// supaya tampilan tidak menjanjikan kursi yang sebenarnya tidak ada.
const MAX_MEMBERS = 8;

function Confirm({ body, confirmLabel, onConfirm, onClose, busy }) {
  const { t } = useI18n();
  return (
    <div className="stack">
      <p className="muted">{body}</p>
      <div className="row-gap">
        <button type="button" className="btn btn-outline" onClick={onClose} disabled={busy}>
          {t("fa.cancel")}
        </button>
        <button type="button" className="btn btn-outline danger" onClick={onConfirm} disabled={busy}>
          {confirmLabel}
        </button>
      </div>
    </div>
  );
}

/**
 * Kartu family group: buat/gabung, kode undangan, roster, dan misi bersama.
 *
 * Semua state datang dari context (`family`) dan dimuat ulang lewat
 * familyAction, jadi setiap tombol tidak perlu load sendiri. Kartu ini tidak
 * pernah hilang karena gagal load: context sudah menurunkan board ke bentuk
 * "belum punya family" saat request-nya error.
 */
export default function GroupSection() {
  const { family, familyAction, showToast, showSuccess, openModal, closeModal } = useApp();
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);

  // null = belum selesai dimuat. Menampilkan apa pun sebelum itu akan
  // sempat menampilkan "belum punya family" lalu berubah jadi sebaliknya.
  if (!family) return null;

  const jalankan = async (fn, pesan) => {
    setBusy(true);
    const res = await familyAction(fn);
    setBusy(false);
    if (res.ok && pesan) showToast(pesan);
    return res;
  };

  const bukaBuat = () => {
    openModal(
      t("fa.createFamily"),
      <FamilyForm
        mode="create"
        submitLabel={t("fa.createFamily")}
        busy={busy}
        onSubmit={async (name) => {
          const res = await jalankan((s) => s.createFamily({ name }));
          if (res.ok) closeModal();
        }}
      />
    );
  };

  const bukaGabung = () => {
    openModal(
      t("fa.joinFamily"),
      <FamilyForm
        mode="join"
        submitLabel={t("fa.joinFamily")}
        busy={busy}
        onSubmit={async (code) => {
          const res = await jalankan((s) => s.joinFamily({ code }));
          if (res.ok) closeModal();
        }}
      />
    );
  };

  const bukaMisi = () => {
    openModal(
      t("fa.createMission"),
      <MissionForm
        submitLabel={t("fa.createMission")}
        busy={busy}
        onSubmit={async (input) => {
          const res = await jalankan((s) => s.createFamilyMission(input));
          if (res.ok) closeModal();
        }}
      />
    );
  };

  if (!family.family) {
    return (
      <div className="card group-card">
        <span className="tag family-tag">
          <Glyph name="users" size={15} /> {t("fa.group")}
        </span>
        <p className="mission-title">{t("fa.noFamily")}</p>
        <p className="muted">{t("fa.noFamilyHint")}</p>
        <div className="row-gap group-actions">
          <button type="button" className="btn btn-primary" onClick={bukaBuat} disabled={busy}>
            {t("fa.createFamily")}
          </button>
          <button type="button" className="btn btn-outline" onClick={bukaGabung} disabled={busy}>
            {t("fa.joinFamily")}
          </button>
        </div>
      </div>
    );
  }

  const grup = family.family;
  const isOwner = grup.ownerId === family.meId;
  const today = todayKey();
  const usedToday = contributionsToday(family.contributions, family.meId, today);
  const quotaLeft = Math.max(0, MAX_DAILY_CONTRIBUTIONS - usedToday);

  const nama = (userId) => {
    if (userId === family.meId) return t("fa.you");
    return family.members.find((m) => m.userId === userId)?.name || "?";
  };

  const salin = async () => {
    try {
      await navigator.clipboard.writeText(grup.inviteCode);
      showToast(t("fa.copied"));
    } catch {
      // Clipboard API butuh konteks aman (https atau localhost) dan bisa ditolak
      // izinnya. Kode tetap ditampilkan di layar, jadi user bisa menyalin manual.
      showToast(grup.inviteCode);
    }
  };

  const konfirmasi = (title, body, confirmLabel, fn, pesan) => {
    openModal(
      title,
      <Confirm
        body={body}
        confirmLabel={confirmLabel}
        busy={busy}
        onClose={closeModal}
        onConfirm={async () => {
          const res = await jalankan(fn, pesan);
          if (res.ok) closeModal();
        }}
      />
    );
  };

  return (
    <div className="card group-card">
      <div className="group-head">
        <span className="tag family-tag">
          <Glyph name="users" size={15} /> {t("fa.group")}
        </span>
        <span className="pill">
          {t("fa.membersCount", { count: family.members.length, max: MAX_MEMBERS })}
        </span>
      </div>

      <p className="mission-title">{grup.name}</p>

      <div className="invite-box">
        <div>
          <span className="k">{t("fa.inviteCode")}</span>
          <span className="code">{grup.inviteCode}</span>
        </div>
        <button
          type="button"
          className="btn-ghost invite-copy"
          onClick={salin}
          aria-label={t("fa.copy")}
          title={t("fa.copy")}
        >
          <ClipboardCopy aria-hidden="true" width={18} height={18} />
          <span>{t("fa.copy")}</span>
        </button>
      </div>
      <p className="muted small">{t("fa.inviteHint")}</p>

      <div className="section-title roster-title">
        <Users aria-hidden="true" width={16} height={16} />
        {t("fa.members")}
      </div>
      <ul className="roster">
        {family.members.map((m) => {
          const saya = m.userId === family.meId;
          return (
            <li key={m.userId} className="roster-row">
              <Avatar user={{ name: m.name, avatarUrl: m.avatarUrl }} size="sm" />
              <div className="roster-info">
                {/* Peran owner sudah ditulis sebagai tag di baris itu, jadi baris
                    ini cukup menampilkan poin. Menulis "Pemilik" dua kali dalam
                    satu baris cuma bikin barisnya-noisy. */}
                <span className="roster-name">{saya ? t("fa.you") : m.name}</span>
                <span className="roster-sub">
                  {formatThousands(m.points)} {t("common.points")}
                </span>
              </div>
              {m.role === "owner" ? (
                <span className="tag owner-tag">{t("fa.owner")}</span>
              ) : isOwner ? (
                <button
                  type="button"
                  className="btn-ghost roster-kick"
                  aria-label={t("fa.kickMember")}
                  title={t("fa.kickMember")}
                  onClick={() =>
                    konfirmasi(
                      t("fa.confirmKickTitle", { name: m.name }),
                      t("fa.confirmKickBody", { name: m.name }),
                      t("fa.kickMember"),
                      (s) => s.kickMember({ userId: m.userId }),
                      t("fa.kickDone", { name: m.name })
                    )
                  }
                >
                  <UserMinus aria-hidden="true" width={16} height={16} />
                </button>
              ) : null}
            </li>
          );
        })}
      </ul>

      <div className="group-head">
        <div className="section-title">
          <Glyph name="target" size={16} /> {t("fa.familyMissions")}
        </div>
        {isOwner ? (
          <button type="button" className="btn-ghost" onClick={bukaMisi} disabled={busy}>
            {t("fa.createMission")}
          </button>
        ) : null}
      </div>

      <p className="muted small">
        {t("fa.quotaToday", { used: usedToday, max: MAX_DAILY_CONTRIBUTIONS })}
        {quotaLeft > 0 ? " · " + t("fa.leftCount", { count: quotaLeft }) : ""}
      </p>

      {family.missions.length === 0 ? (
        <div className="group-empty">
          <p className="mission-title">{t("fa.noMissions")}</p>
          <p className="muted small">
            {/* Non-owner tidak punya tombol buat misi, jadi jangan sampai sarannya
                mengarah ke aksi yang tidak ada di layar. */}
            {isOwner ? t("fa.noMissionsHint") : t("fa.noMissionsHintMember")}
          </p>
        </div>
      ) : (
        <div className="stack">
          {family.missions.map((m) => {
            const p = missionProgress(m);
            const gate = canContribute({
              mission: m,
              contributions: family.contributions,
              userId: family.meId,
              today
            });
            const tally = contributorTally(family.contributions, m.id);
            return (
              <article key={m.id} className={"group-mission" + (p.done ? " is-done" : "")}>
                <div className="group-mission-head">
                  <p className="group-mission-title">{m.title}</p>
                  <span className={"tag " + (p.done ? "done-tag" : "pill")}>
                    {m.status === "completed"
                      ? t("fa.statusCompleted")
                      : m.status === "cancelled"
                        ? t("fa.statusCancelled")
                        : t("fa.statusActive")}
                  </span>
                </div>
                {m.description ? <p className="muted small">{m.description}</p> : null}

                <div className="bar">
                  <Meter value={p.pct} tone={p.done ? "green" : ""} />
                </div>
                <div className="group-mission-meta">
                  <span>
                    {t("fa.progressOf", { current: p.current, target: p.target })} {t("fa.unit")}
                  </span>
                  {!p.done ? <span>{t("fa.leftCount", { count: p.left })}</span> : null}
                </div>

                {tally.length ? (
                  <ul className="tally">
                    {tally.map((c) => (
                      <li key={c.userId} className="tally-item">
                        {nama(c.userId)} · {c.value}
                      </li>
                    ))}
                  </ul>
                ) : null}

                <div className="row-gap">
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={busy || !gate.ok}
                    onClick={async () => {
                      setBusy(true);
                      const res = await familyAction((s) => s.contribute({ missionId: m.id }));
                      setBusy(false);
                      if (res.ok) {
                        showSuccess(t("fa.contribDone"), "+" + res.data.gained + " " + t("common.points"));
                      }
                    }}
                  >
                    {t("fa.contribute")}
                  </button>
                  {isOwner ? (
                    <button
                      type="button"
                      className="btn btn-outline danger"
                      disabled={busy}
                      onClick={() =>
                        konfirmasi(
                          t("fa.confirmMissionTitle"),
                          t("fa.confirmMissionBody"),
                          t("common.delete"),
                          (s) => s.deleteFamilyMission({ id: m.id }),
                          t("fa.missionDeleted")
                        )
                      }
                    >
                      {t("common.delete")}
                    </button>
                  ) : null}
                </div>
                {!gate.ok && !p.done ? <p className="muted small">{t(gate.key)}</p> : null}
              </article>
            );
          })}
        </div>
      )}

      <div className="row-gap group-foot">
        {isOwner ? (
          <button
            type="button"
            className="btn btn-outline danger"
            disabled={busy}
            onClick={() =>
              konfirmasi(
                t("fa.confirmDeleteTitle"),
                t("fa.confirmDeleteBody", { count: family.missions.length }),
                t("fa.deleteFamily"),
                (s) => s.deleteFamily(),
                t("fa.deleteDone")
              )
            }
          >
            {t("fa.deleteFamily")}
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-outline danger"
            disabled={busy}
            onClick={() =>
              konfirmasi(
                t("fa.confirmLeaveTitle"),
                t("fa.confirmLeaveBody"),
                t("fa.leaveFamily"),
                (s) => s.leaveFamily(),
                t("fa.leaveDone")
              )
            }
          >
            {t("fa.leaveFamily")}
          </button>
        )}
      </div>
    </div>
  );
}
