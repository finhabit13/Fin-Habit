import { useEffect, useRef, useState } from "react";
import { EllipsisVertical, PencilLine, Trash } from "lucide-react";

import { useI18n } from "../lib/i18n";

/**
 * Menu tiga titik di pojok kartu tabungan: ubah dan hapus.
 *
 * Menu ini hidup di dalam kartu yang seluruhnya bisa diklik, jadi pemicunya
 * tidak boleh ikut membuka detail goal. Karena itu posisinya sibling dari
 * tombol buka, bukan anak di dalamnya. Menaruh <button> di dalam <button>
 * juga tidak valid di HTML: browser akan menutup tag luar lebih dulu sehingga
 * tombol menu justru jadi pemicu kartu.
 *
 * Ditutup lagi dengan klik di luar, Escape, atau setelah salah satu aksi
 * dijalankan. Fokus dikembalikan ke pemicunya supaya pengguna keyboard
 * tidak kehilangan tempat setelah menutup menu.
 */
export default function GoalMenu({ goalName, onEdit, onDelete }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const close = (restoreFocus) => {
      setOpen(false);
      if (restoreFocus) triggerRef.current?.focus();
    };

    const onPointerDown = (e) => {
      if (!wrapRef.current?.contains(e.target)) close(false);
    };

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close(true);
        return;
      }
      // Panah atas/bawah memindah fokus antar item, seperti menu native.
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      const items = [...wrapRef.current.querySelectorAll('[role="menuitem"]')];
      if (items.length === 0) return;
      e.preventDefault();
      const now = items.indexOf(document.activeElement);
      const step = e.key === "ArrowDown" ? 1 : -1;
      items[(now + step + items.length) % items.length].focus();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    // Fokus langsung ke item pertama supaya menu bisa dipakai tanpa mouse.
    wrapRef.current.querySelector('[role="menuitem"]')?.focus();

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="goal-menu-wrap" ref={wrapRef}>
      <button
        type="button"
        ref={triggerRef}
        className="goal-menu-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("g.menu", { name: goalName })}
        onClick={() => setOpen((v) => !v)}
      >
        <EllipsisVertical aria-hidden="true" width={18} height={18} />
      </button>

      {open && (
        <div className="goal-menu" role="menu">
          <button
            type="button"
            role="menuitem"
            className="goal-menu-item"
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
          >
            <PencilLine aria-hidden="true" width={16} height={16} />
            {t("g.edit")}
          </button>
          <button
            type="button"
            role="menuitem"
            className="goal-menu-item is-danger"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
          >
            <Trash aria-hidden="true" width={16} height={16} />
            {t("g.deleteGoal")}
          </button>
        </div>
      )}
    </div>
  );
}