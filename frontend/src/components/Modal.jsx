import { useEffect, useId } from "react";

import { useApp } from "../context/AppContext";

export default function Modal() {
  const { modal, closeModal } = useApp();
  const titleId = useId();

  useEffect(() => {
    if (!modal) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [modal, closeModal]);

  if (!modal) return null;

  return (
    <div
      className="modal-backdrop open"
      onClick={(e) => e.target === e.currentTarget && closeModal()}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <button className="modal-close" onClick={closeModal} aria-label="Tutup">
          ✕
        </button>
        <h2 className="modal-title" id={titleId}>
          {modal.title}
        </h2>
        <div className="modal-body">{modal.body}</div>
      </div>
    </div>
  );
}