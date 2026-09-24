import { useEffect, useRef, useState } from "react";

import mascotUrl from "../assets/mascot.png";
import { useApp } from "../context/AppContext";
import { useI18n } from "../lib/i18n";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_SECONDS = 60;

export default function Auth({ recovery }) {
  const { auth, resetPassword, updatePassword, enterDemo } = useApp();
  const { t, lang, setLang } = useI18n();

  const [mode, setMode] = useState("login");
  const [view, setView] = useState("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const switchMode = (m) => {
    setMode(m);
    setError("");
    setMagicLinkSent(false);
    setView("form");
  };

  const openForgot = () => {
    setError("");
    setView("forgot");
  };

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
    if (res.ok) {
      setView("forgotSent");
      setSentEmail(emailClean);
    }
    setBusy(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    const emailClean = email.trim();
    if (mode === "register" && !name.trim()) {
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
    const res = await auth(mode, { name, email: emailClean, password });
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

  const submitRecovery = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError(t("auth.errPassShort"));
      return;
    }
    setBusy(true);
    setError("");
    const res = await updatePassword({ password });
    if (res.ok) {
      setPassword("");
    }
    setBusy(false);
  };

  const backToForm = () => {
    setMagicLinkSent(false);
    setSentEmail("");
    setMode("register");
    setError("");
  };

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
        <div className="auth-mark">₣</div>
        <h1 className="auth-title">FINHABIT</h1>
        <p className="auth-tagline">{t("auth.tagline")}</p>
        <p className="auth-sub">{t("auth.subtitle")}</p>

        {recovery ? (
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
          </div>
        ) : magicLinkSent ? (
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
            <p className="muted small magic-link-hint">
              {t("auth.magicLinkHint")}
            </p>
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
        ) : view === "forgot" || view === "forgotSent" ? (
          <div className="verify-box">
            <p className="verify-title">{t("auth.forgotTitle")}</p>
            {view === "forgot" ? (
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
                <button className="btn btn-ghost center" onClick={() => setView("form")}>
                  {t("auth.forgotBack")}
                </button>
              </>
            ) : (
              <>
                <p className="verify-note">{t("auth.forgotSent", { email: sentEmail })}</p>
                <button className="btn btn-ghost center" onClick={() => setView("form")}>
                  {t("auth.forgotBack")}
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="auth-tabs">
              <button
                className={"auth-tab" + (mode === "login" ? " on" : "")}
                onClick={() => switchMode("login")}
              >
                {t("auth.tabLogin")}
              </button>
              <button
                className={"auth-tab" + (mode === "register" ? " on" : "")}
                onClick={() => switchMode("register")}
              >
                {t("auth.tabRegister")}
              </button>
            </div>

            <form className="auth-form" onSubmit={submit} noValidate>
              {mode === "register" && (
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
              )}
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
                autoComplete={mode === "login" ? "current-password" : "new-password"}
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
                {mode === "login" ? t("auth.tabLogin") : t("auth.btnRegister")}
              </button>
            </form>
            {mode === "login" && (
              <button className="btn btn-ghost center slim" onClick={openForgot}>
                {t("auth.forgot")}
              </button>
            )}

            <button className="btn btn-ghost center" onClick={() => enterDemo()}>
              {t("auth.btnDemo")}
            </button>
          </>
        )}
      </div>
      <img
        className="auth-mascot"
        src={mascotUrl}
        alt={t("auth.mascotAlt")}
      />
    </div>
  );
}