import { useState } from "react";

import AuthShell from "../components/AuthShell";
import { useApp } from "../context/AppContext";
import { useI18n } from "../lib/i18n";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPassword({ go, recovery }) {
  const { resetPassword, updatePassword } = useApp();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const submitForgot = async (e) => {
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
    setBusy(true);
    setError("");
    const res = await resetPassword({ email: emailClean });
    if (res.ok) setSent(true);
    setBusy(false);
  };

  const submitRecovery = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError(t("auth.errPassShort"));
      return;
    }
    setBusy(true);
    setError("");
    const res = await updatePassword({ password });
    if (res.ok) setPassword("");
    setBusy(false);
  };

  if (recovery) {
    return (
      <AuthShell>
        <div className="verify-box">
          <p className="verify-title">{t("auth.newPassTitle")}</p>
          <p className="verify-note">{t("auth.newPassSub")}</p>
          <form className="auth-form" onSubmit={submitRecovery} noValidate>
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
              {t("auth.newPassSave")}
            </button>
          </form>
          <button className="btn btn-ghost center" onClick={() => go("/login")}>
            {t("auth.forgotBack")}
          </button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div className="verify-box">
        <p className="verify-title">{t("auth.forgotTitle")}</p>
        {sent ? (
          <>
            <p className="verify-note">{t("auth.forgotSent", { email: email.trim() })}</p>
            <button className="btn btn-ghost center" onClick={() => go("/login")}>
              {t("auth.forgotBack")}
            </button>
          </>
        ) : (
          <>
            <p className="verify-note">{t("auth.forgotSub")}</p>
            <form className="auth-form" onSubmit={submitForgot} noValidate>
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
              {error && (
                <p className="auth-error" role="alert">
                  {error}
                </p>
              )}
              <button className="btn btn-primary" disabled={busy}>
                {t("auth.forgotSend")}
              </button>
            </form>
            <button className="btn btn-ghost center" onClick={() => go("/login")}>
              {t("auth.forgotBack")}
            </button>
          </>
        )}
      </div>
    </AuthShell>
  );
}