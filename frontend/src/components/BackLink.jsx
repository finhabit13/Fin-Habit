import { useApp } from "../context/AppContext";
import { useI18n } from "../lib/i18n";

export default function BackLink({ label, target = "home" }) {
  const { go } = useApp();
  const { t } = useI18n();
  return (
    <button className="back-link" onClick={() => go(target)}>
      ← {label ?? t("nav.home")}
    </button>
  );
}