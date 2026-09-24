import { useState } from "react";

import AuthShell from "../components/AuthShell";
import { useApp } from "../context/AppContext";
import { useI18n } from "../lib/i18n";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login({ go }) {
  const { auth, enterDemo } = useApp();
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

  return (
    <AuthShell>
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