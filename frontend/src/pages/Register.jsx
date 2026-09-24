import { useState } from "react";

import AuthShell from "../components/AuthShell";
import { useApp } from "../context/AppContext";
import { useI18n } from "../lib/i18n";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_SECONDS = 60;

export default function Register({ go }) {
  const { auth, oauth, enterDemo } = useApp();
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const emailClean = email.trim();
    if (!name.trim()) {
      setError(t("auth.errName"));
      return;
    }
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
    const res = await auth("register", { name, email: emailClean, password });
    if (res.needVerification) {
      setMagicLinkSent(true);
      setSentEmail(emailClean);
      setCooldown(RESEND_SECONDS);
    } else if (!res.ok && res.message) {
      setError(res.message);
    }
    setBusy(false);
  };

  const resend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    const res = await auth("register", { name, email: sentEmail, password });
    if (res.needVerification) {
      setCooldown(RESEND_SECONDS);
    } else if (!res.ok && res.message) {
      setError(res.message);
    }
    setResending(false);
  };

  const google = async () => {
    setBusy(true);
    setError("");
    await oauth("google");
  };

  const backToForm = () => {
    setMagicLinkSent(false);
    setSentEmail("");
    setError("");
  };

  return (
    <AuthShell>
      {magicLinkSent ? (
        <div className="verify-box magic-link-sent">
          <div className="magic-link-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </div>
          <p className="verify-title">{t("auth.magicLinkTitle")}</p>
          <p className="verify-note magic-link-note">
            {t("auth.magicLinkSub", { email: sentEmail })}
          </p>
          <p className="muted small magic-link-hint">{t("auth.magicLinkHint")}</p>
          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}
          <div className="verify-foot">
            <button className="btn btn-ghost slim" onClick={resend} disabled={cooldown > 0 || resending}>
              {cooldown > 0 ? t("auth.oVerCooldown", { s: cooldown }) : t("auth.oVerResend")}
            </button>
            <button className="btn btn-ghost slim" onClick={backToForm}>
              {t("auth.oVerBack")}
            </button>
          </div>
        </div>
      ) : (
        <>
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
              type="text"
              autoComplete="name"
              placeholder={t("auth.phName")}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError("");
              }}
            />
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
              autoComplete="new-password"
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
              {t("auth.btnRegister")}
            </button>
          </form>

          <p className="auth-switch">
            {t("auth.haveAccount")}{" "}
            <button className="link" onClick={() => go("/login")}>
              {t("auth.tabLogin")}
            </button>
          </p>

          <button className="btn btn-ghost center" onClick={() => enterDemo()}>
            {t("auth.btnDemo")}
          </button>
        </>
      )}
    </AuthShell>
  );
}