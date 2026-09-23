import { createContext, useCallback, useContext, useRef, useState } from "react";

import { api, ApiError, NetworkError, clearToken, hasToken, setToken } from "../lib/api";
import { store } from "../lib/store";

const AppCtx = createContext(null);

const NAV_TABS = ["home", "learn", "challenge", "score", "profile"];

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [demo, setDemo] = useState(false);
  const [resolved, setResolved] = useState(false);
  const [page, setPage] = useState("home");
  const [toastMsg, setToastMsg] = useState("");
  const [toastShow, setToastShow] = useState(false);
  const [success, setSuccess] = useState(null);
  const [modal, setModal] = useState(null);

  const toastTimer = useRef(null);
  const successTimer = useRef(null);

  const service = demo ? store : api;

  const showToast = useCallback((msg) => {
    clearTimeout(toastTimer.current);
    setToastMsg(msg);
    setToastShow(true);
    toastTimer.current = setTimeout(() => setToastShow(false), 2400);
  }, []);

  const showSuccess = useCallback((title, text) => {
    clearTimeout(successTimer.current);
    setSuccess({ title, text });
    successTimer.current = setTimeout(() => setSuccess(null), 1700);
  }, []);

  const go = useCallback((p) => {
    setPage(p);
    document.getElementById("screenArea")?.scrollTo({ top: 0 });
  }, []);

  const isTab = NAV_TABS.includes(page);

  const enterDemo = useCallback(
    (msg) => {
      if (demo) return;
      setDemo(true);
      store.getSessionUser().then(setUser);
      if (msg) showToast(msg);
    },
    [demo, showToast]
  );

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    setDemo(false);
    setPage("home");
  }, []);

  /** Jalan kan aksi pada service aktif; tangani error & ambil user terbaru. */
  const run = useCallback(
    async (fn, { silent = false } = {}) => {
      try {
        const data = await fn(service);
        if (data && data.user) setUser(data.user);
        return { ok: true, data };
      } catch (err) {
        if (err instanceof NetworkError) {
          enterDemo("Backend tidak terhubung. Beralih ke mode demo.");
        } else if (err instanceof ApiError) {
          if (err.status === 401) {
            logout();
            return { ok: false };
          }
          if (!silent) showToast(err.message);
        } else {
          if (!silent) showToast(err.message || "Terjadi kesalahan");
        }
        return { ok: false };
      }
    },
    [demo, enterDemo, logout, showToast, service]
  );

  /**
   * Muat ulang data user. Dipanggil saat boot (kalau ada token) supaya
   * backend/demo tersambung tanpa halaman login.
   */
  const boot = useCallback(async () => {
    if (hasToken()) {
      try {
        const data = await api.me();
        setToken(data.token || null);
        setUser(data);
        setResolved(true);
        return;
      } catch (err) {
        if (err instanceof NetworkError) {
          enterDemo();
        }
      }
    }
    setResolved(true);
  }, [enterDemo]);

  const auth = useCallback(
    async (kind, body) => {
      try {
        const target = demo ? store : api;
        const data = await target[kind](body);
        if (!demo) setToken(data.token);
        setUser(data.user);
        setPage("home");
        showToast(demo ? "Mode demo aktif" : `Halo, ${data.user.name}!`);
        return { ok: true };
      } catch (err) {
        if (err instanceof NetworkError) {
          if (!demo) {
            setDemo(true);
            const demoUser = await store.login(body);
            setUser(demoUser.user);
            setPage("home");
            showToast("Backend tidak terhubung. Mode demo aktif.");
            return { ok: true };
          }
        } else if (err instanceof ApiError) {
          showToast(err.message);
        } else {
          showToast(err.message || "Terjadi kesalahan");
        }
        return { ok: false };
      }
    },
    [demo, showToast]
  );

  const value = {
    user,
    demo,
    resolved,
    page,
    go,
    isTab,
    toastMsg,
    toastShow,
    success,
    modal,
    showToast,
    showSuccess,
    openModal: (title, body) => setModal({ title, body }),
    closeModal: () => setModal(null),
    run,
    boot,
    auth,
    logout,
    enterDemo
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export const useApp = () => useContext(AppCtx);