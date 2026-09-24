import { useState } from "react";

import AuthShell from "../components/AuthShell";
import { useApp } from "../context/AppContext";
import { useI18n } from "../lib/i18n";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login({ go }) {
  const { auth, oauth, enterDemo } = useApp();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    const emailClean = email.trim();
    if (!emailClean) {
      setError(t("auth.errEmail"));
      return;
    }
    if (!EMAIL_RE.test(emailClean)) {
      setError(t("auth.errEmailFormat"));
      return;
    }
    if (password.length < 6) {
      setError(t("auth.errPassShort"));
      return;
    }
    setBusy(true);
    setError("");
    const res = await auth("login", { email: emailClean, password });
    if (!res.ok && res.message) setError(res.message);
    setBusy(false);
  };

  const google = async () => {
    setBusy(true);
    setError("");
    await oauth("google");
  };

  return (
    <AuthShell>
      <button className="btn btn-google center wide" disabled={busy} onClick={google}>
        <svg className="google-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
          <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.35-2.1V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52Z" />
        </svg>
        {t("auth.btnGoogle")}
      </button>

      <div className="auth-divider">
        <span>{t("auth.orDivider")}</span>
      </div>

      <form className="auth-form" onSubmit={submit} noValidate>
        <input
          type="email"
          autoComplete="email"
          placeholder={t("auth.phEmail")}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError("");
          }}
        />
        <input
          type="password"
          autoComplete="current-password"
          placeholder={t("auth.phPassword")}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (error) setError("");
          }}
        />
        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}
        <button className="btn btn-primary" disabled={busy}>
          {t("auth.tabLogin")}
        </button>
      </form>
      <button className="btn btn-ghost center slim" onClick={() => go("/forgot")}>
        {t("auth.forgot")}
      </button>

      <p className="auth-switch">
        {t("auth.noAccount")}{" "}
        <button className="link" onClick={() => go("/register")}>
          {t("auth.tabRegister")}
        </button>
      </p>

      <button className="btn btn-ghost center" onClick={() => enterDemo()}>
        {t("auth.btnDemo")}
      </button>
    </AuthShell>
  );
}