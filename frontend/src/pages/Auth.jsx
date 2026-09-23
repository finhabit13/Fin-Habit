import { useState } from "react";

import { useApp } from "../context/AppContext";

const TAGLINE = "SPEND SMART. SAVE BETTER. BEAT FOMO.";

export default function Auth() {
  const { auth, enterDemo, showToast } = useApp();
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      showToast("Kata sandi minimal 6 karakter");
      return;
    }
    if (!email.trim()) return;
    setBusy(true);
    await auth(mode, { name, email, password });
    setBusy(false);
  };

  return (
    <div className="phone auth-screen">
      <div className="auth-inner">
        <div className="auth-mark">₣</div>
        <h1 className="auth-title">FINHABIT</h1>
        <p className="auth-tagline">{TAGLINE}</p>
        <p className="auth-sub">Kelola uangmu tanpa harus membosankan.</p>

        <div className="auth-tabs">
          <button
            className={"auth-tab" + (mode === "login" ? " on" : "")}
            onClick={() => setMode("login")}
          >
            Masuk
          </button>
          <button
            className={"auth-tab" + (mode === "register" ? " on" : "")}
            onClick={() => setMode("register")}
          >
            Daftar
          </button>
        </div>

        <form className="auth-form" onSubmit={submit}>
          {mode === "register" && (
            <input
              type="text"
              placeholder="Nama"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Kata sandi (min. 6 karakter)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="btn btn-primary" disabled={busy}>
            {mode === "login" ? "Masuk" : "Buat akun"}
          </button>
        </form>

        <button className="btn btn-ghost center" onClick={() => enterDemo()}>
          Coba mode demo tanpa akun
        </button>
      </div>
    </div>
  );
}