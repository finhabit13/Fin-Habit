import mascotUrl from "../assets/mascot.png";
import { useI18n } from "../lib/i18n";

export default function AuthShell({ children }) {
  const { t, lang, setLang } = useI18n();
  return (
    <div className="phone auth-screen">
      <div className="auth-inner">
        <div className="lang-switch">
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
        <img className="auth-mark auth-mark-img" src="/finhabit-logo.jpeg" alt="FINHABIT" />
        <h1 className="auth-title">FINHABIT</h1>
        <p className="auth-tagline">{t("auth.tagline")}</p>
        <p className="auth-sub">{t("auth.subtitle")}</p>
        {children}
      </div>
      <img className="auth-mascot" src={mascotUrl} alt={t("auth.mascotAlt")} />
    </div>
  );
}