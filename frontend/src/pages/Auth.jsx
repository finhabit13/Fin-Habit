import { useEffect, useRef, useState } from "react";

import mascotUrl from "../assets/mascot.png";
import { useApp } from "../context/AppContext";
import { useI18n } from "../lib/i18n";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_SECONDS = 60;

export default function Auth() {
  const { auth, verify, enterDemo } = useApp();
  const { t, lang, setLang } = useI18n();

  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [vfEmail, setVfEmail] = useState("");
  const [digits, setDigits] = useState(Array(6).fill(""));
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  const boxes = useRef([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const switchMode = (m) => {
    setMode(m);
    setError("");
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
      setVfEmail(emailClean);
      setCooldown(RESEND_SECONDS);
      setDigits(Array(6).fill(""));
    } else if (!res.ok && res.message) {
      setError(res.message);
    }
    setBusy(false);
  };

  const code = digits.join("");

  const handleDigit = (i, value) => {
    const clean = value.replace(/\D/g, "").slice(-1);
    if (!clean) return;
    const next = digits.slice();
    next[i] = clean;
    setDigits(next);
    if (i < 5) boxes.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) boxes.current[i - 1]?.focus();
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text) {
      e.preventDefault();
      setDigits(Array(6).fill("").map((_, i) => text[i] || ""));
      boxes.current[Math.min(text.length, 5)]?.focus();
    }
  };

  const submitCode = async () => {
    if (code.length < 6) return;
    setBusy(true);
    setError("");
    const res = await verify({ email: vfEmail, code, password });
    if (!res.ok && res.message) setError(res.message);
    setBusy(false);
  };

  const resend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    const res = await auth("register", { name, email: vfEmail, password });
    if (res.needVerification) {
      setCooldown(RESEND_SECONDS);
    } else if (!res.ok && res.message) {
      setError(res.message);
    }
    setResending(false);
  };

  const backToForm = () => {
    setVfEmail("");
    setMode("register");
    setDigits(Array(6).fill(""));
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

        {vfEmail ? (
          <div className="verify-box">
            <p className="verify-title">{t("auth.oVerTitle")}</p>
            <p className="verify-note">
              {t("auth.oVerSub", { email: vfEmail })}
            </p>
            <div className="verify-grid" onPaste={handlePaste}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => (boxes.current[i] = el)}
                  className="verify-digit"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleDigit(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  aria-label={t("auth.oVerDigit", { n: i + 1 })}
                />
              ))}
            </div>
            {error && (
              <p className="auth-error" role="alert">
                {error}
              </p>
            )}
            <button
              className="btn btn-primary"
              disabled={busy || code.length < 6}
              onClick={submitCode}
            >
              {t("auth.oVerVerify")}
            </button>
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